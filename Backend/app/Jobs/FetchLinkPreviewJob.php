<?php

namespace App\Jobs;

use App\Models\Message;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class FetchLinkPreviewJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * The number of times the job may be attempted.
     */
    public int $tries = 2;

    /**
     * The number of seconds to wait before retrying.
     */
    public int $backoff = 10;

    /**
     * Max seconds to wait for the external HTTP response.
     */
    private const HTTP_TIMEOUT = 5;

    public function __construct(
        public readonly int    $messageId,
        public readonly string $url
    ) {}

    /**
     * Execute the job.
     * Fetches OpenGraph metadata and writes it back to the message row.
     * Any failure is non-fatal — the message will simply have no preview.
     */
    public function handle(): void
    {
        // SSRF guard: reject URLs that resolve to private/reserved address space.
        if (!$this->isSafeUrl($this->url)) {
            Log::warning('FetchLinkPreviewJob: blocked SSRF-risk URL', ['url' => $this->url]);
            return;
        }

        $preview = $this->fetchMetadata($this->url);

        // Only update if the message still exists (it may have been deleted)
        Message::where('id', $this->messageId)->update([
            'link_preview_data' => $preview,
        ]);
    }

    /**
     * SSRF protection: resolve the hostname and reject any IP in a private,
     * loopback, link-local, or cloud-metadata range.
     *
     * Blocked ranges:
     *   - 10.0.0.0/8          (RFC 1918 private)
     *   - 172.16.0.0/12       (RFC 1918 private)
     *   - 192.168.0.0/16      (RFC 1918 private)
     *   - 127.0.0.0/8         (loopback)
     *   - ::1                  (IPv6 loopback)
     *   - 169.254.0.0/16      (link-local / AWS metadata)
     *   - fd00::/8            (IPv6 ULA)
     *   - fc00::/7            (IPv6 ULA)
     */
    private function isSafeUrl(string $url): bool
    {
        $host = parse_url($url, PHP_URL_HOST);
        if (!$host) {
            return false;
        }

        // Strip IPv6 brackets
        $host = trim($host, '[]');

        // Resolve hostname to IP (returns false on failure)
        $ip = gethostbyname($host);
        if ($ip === $host && !filter_var($host, FILTER_VALIDATE_IP)) {
            // gethostbyname returns the input unchanged on failure
            return false;
        }

        // Private / reserved IPv4 CIDR blocks to block
        $deniedCidrs = [
            '10.0.0.0/8',
            '172.16.0.0/12',
            '192.168.0.0/16',
            '127.0.0.0/8',
            '169.254.0.0/16',   // AWS/GCP metadata endpoint
            '100.64.0.0/10',    // Shared address space (RFC 6598)
            '192.0.0.0/24',     // IETF Protocol Assignments
            '198.18.0.0/15',    // Network benchmark testing
            '240.0.0.0/4',      // Reserved
            '0.0.0.0/8',        // "This" network
        ];

        foreach ($deniedCidrs as $cidr) {
            if ($this->ipInCidr($ip, $cidr)) {
                return false;
            }
        }

        // Block IPv6 loopback and ULA ranges
        if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6)) {
            if ($ip === '::1') {
                return false;
            }
            // ULA: fc00::/7 covers fc00:: – fdff::
            $longIp = inet_pton($ip);
            $firstByte = ord($longIp[0]);
            if (($firstByte & 0xFE) === 0xFC) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if an IPv4 address falls within a CIDR range.
     */
    private function ipInCidr(string $ip, string $cidr): bool
    {
        if (!filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4)) {
            return false;
        }

        [$subnet, $bits] = explode('/', $cidr);
        $ipLong     = ip2long($ip);
        $subnetLong = ip2long($subnet);
        $mask       = $bits == 0 ? 0 : (~0 << (32 - (int) $bits));

        return ($ipLong & $mask) === ($subnetLong & $mask);
    }

    /**
     * Fetch and parse OpenGraph metadata from a safe external URL.
     * Returns a minimal array — never throws; failures return null.
     */
    private function fetchMetadata(string $url): ?array
    {
        try {
            $response = Http::timeout(self::HTTP_TIMEOUT)
                ->withHeaders(['User-Agent' => 'UniAds-LinkPreview/1.0'])
                ->get($url);

            if (!$response->successful()) {
                return ['url' => $url, 'title' => parse_url($url, PHP_URL_HOST)];
            }

            $html        = $response->body();
            $title       = '';
            $description = '';
            $image       = '';

            // Open Graph tags take priority
            if (preg_match('/<meta[^>]+property=["\']?og:title["\']?[^>]+content=["\']([^"\']+)["\']/', $html, $m)) {
                $title = $m[1];
            } elseif (preg_match('/<title>([^<]+)<\/title>/i', $html, $m)) {
                $title = $m[1];
            }

            if (preg_match('/<meta[^>]+property=["\']?og:description["\']?[^>]+content=["\']([^"\']+)["\']/', $html, $m)) {
                $description = $m[1];
            } elseif (preg_match('/<meta[^>]+name=["\']?description["\']?[^>]+content=["\']([^"\']+)["\']/', $html, $m)) {
                $description = $m[1];
            }

            if (preg_match('/<meta[^>]+property=["\']?og:image["\']?[^>]+content=["\']([^"\']+)["\']/', $html, $m)) {
                $image = $m[1];
            }

            return [
                'url'         => $url,
                'title'       => html_entity_decode(trim($title)),
                'description' => html_entity_decode(trim($description)),
                'image'       => $image,
            ];
        } catch (\Exception $e) {
            Log::info('FetchLinkPreviewJob: metadata fetch failed', [
                'url'   => $url,
                'error' => $e->getMessage(),
            ]);

            return ['url' => $url, 'title' => parse_url($url, PHP_URL_HOST)];
        }
    }
}
