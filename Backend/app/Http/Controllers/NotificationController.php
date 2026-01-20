<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Notification;
use App\Models\Institute;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    // Fetch notifications for all institutes excluding the user who uploaded the post/event
    public function getNotifications()
{
    // Get the logged-in user's ID
    $userId = Auth::id();

    // Fetch notifications for the logged-in user, excluding notifications they created
    $notifications = Notification::latest()
        ->where('created_by', '!=', $userId) // Exclude notifications created by the logged-in user
        ->get();

    // Get the count of notifications for the logged-in user
    $notificationCount = $notifications->count();

    return response()->json([
        'notifications' => $notifications,
        'notification_count' => $notificationCount,
    ]);
}

    // Mark notifications as seen (reset the notification count)
    public function markAsSeen()
    {
        // Reset notification count to zero for the current session
        session(['notification_count' => 0]);

        return response()->json(['message' => 'Notifications marked as seen.']);
    }
}
