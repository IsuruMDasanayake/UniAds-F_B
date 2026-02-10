<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Webklex\IMAP\Facades\Client;
use App\Models\IncomingEmail;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class FetchEmails extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'emails:fetch';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Fetch emails from IMAP server and save to database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Connecting to IMAP server...');

        try {
            $client = Client::account('default');
            $client->connect();

            $folder = $client->getFolder('INBOX');
            $this->info('Connected. Fetching recent messages (last 7 days)...');

            // Fetch messages from the last 7 days instead of just unseen
            $messages = $folder->query()
                ->since(now()->subDays(7))
                ->get();

            $count = 0;
            $skipped = 0;

            foreach ($messages as $message) {
                $subject = (string)$message->getSubject();
                $from = $message->getFrom()[0];
                $fromEmail = (string)$from->mail;
                $fromName = (string)$from->personal;
                $receivedAt = Carbon::parse($message->getDate());

                // Deduplication check: Check if this email already exists
                $exists = IncomingEmail::where('subject', $subject)
                    ->where('from_email', $fromEmail)
                    ->where('received_at', $receivedAt)
                    ->exists();

                if ($exists) {
                    $skipped++;
                    continue;
                }

                // Get body (prefer HTML, fallback to text)
                $body = $message->getHTMLBody() ?: $message->getTextBody();

                // Save to database
                IncomingEmail::create([
                    'subject' => $subject,
                    'from_email' => $fromEmail,
                    'from_name' => $fromName,
                    'body' => $body,
                    'received_at' => $receivedAt,
                    'is_read' => false
                ]);

                $count++;
            }

            $this->info("Fetched and saved {$count} new emails. Skipped {$skipped} duplicates.");
            Log::info("IMAP Sync: {$count} new emails saved, {$skipped} skipped.");
        } catch (\Exception $e) {
            $this->error('Error fetching emails: ' . $e->getMessage());
            Log::error('IMAP Fetch Error: ' . $e->getMessage());
        }
    }
}
