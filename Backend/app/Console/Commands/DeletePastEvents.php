<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Event;
use Carbon\Carbon;

class DeletePastEvents extends Command
{
    // Command signature to run in terminal: php artisan events:delete-past
    protected $signature = 'events:delete-past';

    protected $description = 'Delete events with event_date before today';

    public function handle()
    {
        // Delete all events where event_date is before today
        $deleted = Event::where('event_date', '<', Carbon::today()->toDateString())->delete();

        // Output how many events were deleted
        $this->info("Deleted $deleted past events.");
    }
}
