<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Institute;
use App\Models\Subscription;
use App\Jobs\UpdatePostScoresJob;
use Illuminate\Support\Facades\Cache;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SyncExpiredSubscriptions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'subscriptions:sync-expiry';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Deactivate expired premium statuses for institutes and subscriptions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $now = now();
        $this->info("Running subscription sync at: {$now->toDateTimeString()}");

        // 1. Sync Institutes with expired premium column
        $expiredInstitutes = Institute::where('is_premium', 1)
            ->whereNotNull('premium_expires_at')
            ->where('premium_expires_at', '<', $now)
            ->get();

        $countInstitutes = $expiredInstitutes->count();
        if ($countInstitutes > 0) {
            foreach ($expiredInstitutes as $institute) {
                $institute->update(['is_premium' => 0]);
                $this->warn("Deactivated premium for Institute ID: {$institute->id} ({$institute->institute_name})");
            }
            Log::info("Deactivated premium status for {$countInstitutes} institutes via scheduler.");

            // Immediately recalculate post rankings so expired institutes drop in results right away.
            UpdatePostScoresJob::dispatch();
            $this->info("Dispatched UpdatePostScoresJob to immediately refresh post rankings.");

            // Flush the filter page cache so stale cached results don't show expired institutes on top.
            Cache::flush();
            $this->info("Flushed page cache to ensure updated rankings are visible immediately.");
        }

        // 2. Sync Subscription table statuses (Precise timestamp check)
        $expiredSubscriptions = Subscription::where('status', 'active')
            ->whereNotNull('ends_at')
            ->where('ends_at', '<', $now)
            ->get();

        $countSubscriptions = $expiredSubscriptions->count();
        if ($countSubscriptions > 0) {
            foreach ($expiredSubscriptions as $subscription) {
                $subscription->update(['status' => 'expired']);
                $this->warn("Marked Subscription ID: {$subscription->id} as expired.");
            }
            Log::info("Updated status to 'expired' for {$countSubscriptions} subscriptions via scheduler.");
        }

        if ($countInstitutes === 0 && $countSubscriptions === 0) {
            $this->info("No expired subscriptions found.");
        } else {
            $this->info("Sync complete. Institutes: {$countInstitutes}, Subscriptions: {$countSubscriptions}");
        }

        return Command::SUCCESS;
    }
}
