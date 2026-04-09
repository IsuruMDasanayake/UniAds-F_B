<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Institute;

class BackfillAnalyticsCommand extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'analytics:backfill-all {--force : Overwrite existing data}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Performs an all-time backfill of analytics data into the daily_analytics table.';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info("Starting All-Time Analytics Backfill...");

        $earliestPostView = DB::table('post_views')->min('viewed_at');
        $earliestEventView = DB::table('event_views')->min('viewed_at');
        $earliestProfileView = DB::table('institute_profile_views')->min('viewed_at');

        $startDate = collect([$earliestPostView, $earliestEventView, $earliestProfileView])
            ->filter()
            ->map(fn($d) => Carbon::parse($d))
            ->min();

        if (!$startDate) {
            $this->error("No analytics data found to backfill.");
            return;
        }

        $endDate = Carbon::today();
        $totalDays = $startDate->diffInDays($endDate);

        $this->info("Backfill range: {$startDate->toDateString()} to {$endDate->toDateString()} ({$totalDays} days)");

        $currentDate = $startDate->copy();
        
        while ($currentDate->lte($endDate)) {
            $dateString = $currentDate->toDateString();
            $this->info("Processing: {$dateString}");

            $institutes = DB::table('institutes')->pluck('id');

            foreach ($institutes as $instituteId) {
                // 1. Profile Views
                $profileViews = DB::table('institute_profile_views')
                    ->where('institute_id', $instituteId)
                    ->whereDate('viewed_at', $dateString)
                    ->count();

                // 2. Post Views
                $postViews = DB::table('post_views')
                    ->join('posts', 'post_views.post_id', '=', 'posts.id')
                    ->where('posts.institute_id', $instituteId)
                    ->whereDate('post_views.viewed_at', $dateString)
                    ->count();
                
                // 3. Post Likes
                $postLikes = DB::table('post_likes')
                    ->join('posts', 'post_likes.post_id', '=', 'posts.id')
                    ->where('posts.institute_id', $instituteId)
                    ->whereDate('post_likes.created_at', $dateString)
                    ->count();

                // 4. Event Views
                $eventViews = DB::table('event_views')
                    ->join('events', 'event_views.event_id', '=', 'events.id')
                    ->where('events.institute_id', $instituteId)
                    ->whereDate('event_views.viewed_at', $dateString)
                    ->count();
                
                // 5. Event Interests
                $eventInterests = DB::table('event_user_interests')
                    ->join('events', 'event_user_interests.event_id', '=', 'events.id')
                    ->where('events.institute_id', $instituteId)
                    ->whereDate('event_user_interests.created_at', $dateString)
                    ->count();

                // 6. Followers
                $followers = DB::table('followers')
                    ->where('institute_id', $instituteId)
                    ->whereDate('created_at', $dateString)
                    ->count();

                // 7. Applications
                $applications = DB::table('apply_cases')
                    ->where('institute_id', $instituteId)
                    ->whereDate('created_at', $dateString)
                    ->count();
                
                // 8. New Ratings
                $newRatings = DB::table('ratings')
                    ->where('institute_id', $instituteId)
                    ->whereDate('created_at', $dateString)
                    ->count();

                if ($profileViews > 0 || $postViews > 0 || $eventViews > 0 || $followers > 0 || $applications > 0 || $postLikes > 0 || $eventInterests > 0 || $newRatings > 0) {
                    DB::table('daily_analytics')->updateOrInsert(
                        ['institute_id' => $instituteId, 'date' => $dateString],
                        [
                            'profile_views' => $profileViews,
                            'post_views' => $postViews,
                            'event_views' => $eventViews,
                            'post_likes' => $postLikes,
                            'event_interests' => $eventInterests,
                            'new_followers' => $followers,
                            'applications' => $applications,
                            'new_ratings' => $newRatings,
                            'updated_at' => now(),
                        ]
                    );
                }
            }

            $currentDate->addDay();
        }

        $this->info("All-Time Backfill Completed Successfully.");
    }
}
