<?php

namespace App\Observers;

use App\Models\Institute;
use App\Jobs\UpdatePostScoresJob;

class InstituteObserver
{
    /**
     * Handle the Institute "updated" event.
     */
    public function updated(Institute $institute): void
    {
        // If critical ranking factors changed, trigger an immediate score update for this institute's posts.
        if ($institute->isDirty('is_premium') || $institute->isDirty('followers_count')) {
            UpdatePostScoresJob::dispatch($institute->id);
        }
    }
}
