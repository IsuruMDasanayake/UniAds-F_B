<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule)
    {
        $schedule->command('analytics:cleanup')->daily();
        $schedule->command('emails:fetch')->everyFiveMinutes();
        $schedule->command('notifications:send-scheduled')->dailyAt('09:00');

        // Sync expired premium statuses and subscriptions
        $schedule->command('subscriptions:sync-expiry')->everyMinute();

        // Recalculate post scores for ranking every 15 minutes
        $schedule->job(new \App\Jobs\UpdatePostScoresJob)->everyFifteenMinutes();
    }


    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
