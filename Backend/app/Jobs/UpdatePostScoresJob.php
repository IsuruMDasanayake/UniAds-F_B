<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class UpdatePostScoresJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            DB::statement("
                UPDATE posts
                JOIN institutes ON posts.institute_id = institutes.id
                SET posts.score_cache = (
                    (CASE WHEN (institutes.is_premium = 1 AND (institutes.premium_expires_at IS NULL OR institutes.premium_expires_at > NOW())) THEN 30 ELSE 0 END) +
                    (LOG(institutes.followers_count + 1) * 10) +
                    (100 - TIMESTAMPDIFF(HOUR, posts.created_at, NOW())) +
                    (MOD(posts.id, 10) * 0.5)
                )
                WHERE posts.status = 'active'
            ");
            
            Log::info('Successfully updated score_cache for all active posts.');
        } catch (\Exception $e) {
            Log::error('Failed to update post scores: ' . $e->getMessage());
        }
    }
}
