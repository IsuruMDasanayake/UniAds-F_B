<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class CleanOldAnalyticsData extends Command
{
    protected $signature = 'analytics:cleanup';
    protected $description = 'Delete analytics data older than 90 days';

    public function handle()
    {
        $cutoffDate = Carbon::now()->subDays(90)->startOfDay();

        // Clean each table
        DB::table('post_views')->where('viewed_at', '<', $cutoffDate)->delete();
        DB::table('event_views')->where('viewed_at', '<', $cutoffDate)->delete();
        DB::table('institute_profile_views')->where('viewed_at', '<', $cutoffDate)->delete();
        DB::table('followers')->where('created_at', '<', $cutoffDate)->delete();

        $this->info("Old analytics data cleaned successfully.");
    }
}
