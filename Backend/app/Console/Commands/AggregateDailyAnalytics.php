<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AggregateDailyAnalytics extends Command
{
    protected $signature = 'analytics:aggregate {date?}';
    protected $description = 'Aggregates daily analytics metrics into the daily_analytics table for all institutes.';

    public function handle()
    {
        $dateStr = $this->argument('date');
        // By default, aggregate yesterday's data to ensure the full day is captured.
        $date = $dateStr ? Carbon::parse($dateStr) : Carbon::yesterday();
        $dateString = $date->toDateString();

        $this->info("Aggregating analytics for {$dateString}...");

        $institutes = DB::table('institutes')->where('status', 'active')->pluck('id');

        $bar = $this->output->createProgressBar($institutes->count());

        foreach ($institutes as $instituteId) {
            $profileViews = DB::table('institute_profile_views')
                ->where('institute_id', $instituteId)
                ->whereDate('created_at', $dateString)
                ->count();

            $postViews = DB::table('post_views')
                ->join('posts', 'post_views.post_id', '=', 'posts.id')
                ->where('posts.institute_id', $instituteId)
                ->whereDate('post_views.created_at', $dateString)
                ->count();

            $followers = DB::table('followers')
                ->where('institute_id', $instituteId)
                ->whereDate('created_at', $dateString)
                ->count();

            $inquiries = DB::table('institute_inquiries')
                ->where('institute_id', $instituteId)
                ->whereDate('created_at', $dateString)
                ->count();

            if ($profileViews > 0 || $postViews > 0 || $followers > 0 || $inquiries > 0) {
                DB::table('daily_analytics')->updateOrInsert(
                    ['institute_id' => $instituteId, 'date' => $dateString],
                    [
                        'profile_views' => $profileViews,
                        'post_views' => $postViews,
                        'new_followers' => $followers,
                        'inquiries_received' => $inquiries,
                        'updated_at' => now(),
                    ]
                );
            }

            $bar->advance();
        }

        $bar->finish();
        $this->newLine();
        $this->info("Daily analytics aggregated successfully.");
    }
}
