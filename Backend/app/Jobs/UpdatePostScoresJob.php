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

    private ?int $instituteId;

    /**
     * Create a new job instance.
     * 
     * @param int|null $instituteId If provided, only updates scores for this institute's posts.
     */
    public function __construct(?int $instituteId = null)
    {
        $this->instituteId = $instituteId;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            $query = "
                UPDATE posts 
                JOIN institutes ON posts.institute_id = institutes.id
                LEFT JOIN (
                    SELECT institute_id, AVG(rating) as avg_rating
                    FROM ratings
                    GROUP BY institute_id
                ) AS inst_ratings ON institutes.id = inst_ratings.institute_id
                SET posts.score_cache = ROUND(
                    (
                        (LOG(GREATEST(posts.likes_count, 0) + 1) * 5) + 
                        (LOG(GREATEST(posts.view_count, 0) + 1) * 2) + 
                        (LOG(GREATEST(posts.applications_count, 0) + 1) * 12) + 
                        (LOG(GREATEST(institutes.followers_count, 0) + 1) * 8) + 
                        (IF(TIMESTAMPDIFF(SECOND, posts.created_at, NOW()) < 86400, 10, 0)) +
                        (COALESCE(inst_ratings.avg_rating, 3.0) * 2)
                    ) 
                    * EXP(-0.023 * GREATEST(TIMESTAMPDIFF(DAY, posts.created_at, NOW()), 0))
                    * IF(institutes.is_premium = 1 AND (institutes.premium_expires_at IS NULL OR institutes.premium_expires_at > NOW()), 1.5, 1.0)
                    * IF(posts.view_count > 100 AND (posts.likes_count + posts.applications_count) < (posts.view_count * 0.01), 0.5, 1.0)
                , 4)
                WHERE posts.status = 'active' AND posts.created_at >= DATE_SUB(NOW(), INTERVAL 60 DAY)
            ";

            if ($this->instituteId) {
                $query .= " AND institutes.id = " . (int) $this->instituteId;
            }

            DB::statement($query);

            // Sync the updated posts to Meilisearch (Scout) so search results use the decayed scores
            $scoutQuery = \App\Models\Post::where('status', 'active')
                ->where('created_at', '>=', now()->subDays(60));

            if ($this->instituteId) {
                $scoutQuery->where('institute_id', $this->instituteId);
            }

            // Since this is a raw DB update, model events aren't fired. 
            // We must manually trigger Scout to index the new scores.
            $scoutQuery->searchable();

            $logMsg = $this->instituteId
                ? "Successfully updated score_cache and scout index for active posts of institute ID: {$this->instituteId}."
                : 'Successfully updated score_cache and scout index for all active recent posts.';
            Log::info($logMsg);
        } catch (\Exception $e) {
            Log::error('Failed to update post scores: ' . $e->getMessage());
        }
    }
}
