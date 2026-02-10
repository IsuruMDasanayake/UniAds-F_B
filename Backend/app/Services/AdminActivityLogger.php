<?php

namespace App\Services;

use App\Models\AdminActivityLog;
use Illuminate\Support\Facades\Auth;

class AdminActivityLogger
{
    /**
     * Log an admin activity
     *
     * @param string $action The action performed (e.g., 'Approved', 'Deleted')
     * @param string|null $subjectType The type of object affected (e.g., 'Institute', 'User')
     * @param int|null $subjectId The ID of the affected object
     * @param string $description Detailed description of the activity
     * @return void
     */
    public static function log($action, $subjectType, $subjectId, $description)
    {
        AdminActivityLog::create([
            'admin_id' => Auth::id() ?? 1, // Fallback to ID 1 if not auth (for testing/seeds)
            'action' => $action,
            'subject_type' => $subjectType,
            'subject_id' => $subjectId,
            'description' => $description,
        ]);
    }
}
