<?php

namespace App\Services;

use App\Models\InstituteActivityLog;
use Illuminate\Support\Facades\Auth;

class InstituteActivityLogger
{
    /**
     * Log an institute activity
     *
     * @param string $actionType The action performed (e.g., 'Post Created')
     * @param string $description Detailed description
     * @param string $category Content, Application, Account, Subscription
     * @param string|null $subjectType Optional: model class
     * @param int|null $subjectId Optional: model ID
     * @return void
     */
    public static function log($actionType, $description, $category = 'General', $subjectType = null, $subjectId = null)
    {
        $user = Auth::user();

        // This logger is specifically for actions within the context of an institute
        if ($user && $user->role === 'Institute' && $user->institute) {
            InstituteActivityLog::create([
                'institute_id' => $user->institute->id,
                'user_id' => $user->id,
                'action_type' => $actionType,
                'description' => $description,
                'category' => $category,
                'subject_type' => $subjectType,
                'subject_id' => $subjectId,
            ]);
        }
    }
}
