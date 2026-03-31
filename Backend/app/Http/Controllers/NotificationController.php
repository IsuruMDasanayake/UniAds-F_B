<?php

namespace App\Http\Controllers;

use App\Models\Notification;
use App\Models\AdminNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    public function index()
    {
        $instituteId = Auth::user()->institute->id;

        $notifications = Notification::where('institute_id', $instituteId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $unreadCount = Notification::where('institute_id', $instituteId)
            ->where('is_read', false)
            ->count();

        return $this->success([
            'notifications' => $notifications,
            'unreadCount' => $unreadCount
        ]);
    }

    public function markAsRead($id)
    {
        $instituteId = Auth::user()->institute->id;
        $notification = Notification::where('institute_id', $instituteId)->findOrFail($id);

        $notification->update([
            'is_read' => true,
            'read_at' => now()
        ]);

        return $this->success(null, 'Operation successful');
    }

    public function markAllAsRead()
    {
        $instituteId = Auth::user()->institute->id;

        Notification::where('institute_id', $instituteId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now()
            ]);

        return $this->success(null, 'Operation successful');
    }

    public function destroy($id)
    {
        $instituteId = Auth::user()->institute->id;
        $notification = Notification::where('institute_id', $instituteId)->findOrFail($id);

        $notification->delete();

        return $this->success(null, 'Operation successful');
    }

    // --- Admin Notification Methods ---

    public function adminIndex()
    {
        $userId = Auth::id();

        $notifications = AdminNotification::where('user_id', $userId)
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        $unreadCount = AdminNotification::where('user_id', $userId)
            ->where('is_read', false)
            ->count();

        return $this->success([
            'notifications' => $notifications,
            'unreadCount' => $unreadCount
        ]);
    }

    public function adminMarkAsRead($id)
    {
        $userId = Auth::id();
        $notification = AdminNotification::where('user_id', $userId)
            ->findOrFail($id);

        $notification->update([
            'is_read' => true,
            'read_at' => now()
        ]);

        return $this->success(null, 'Operation successful');
    }

    public function adminMarkAllAsRead()
    {
        $userId = Auth::id();

        AdminNotification::where('user_id', $userId)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now()
            ]);

        return $this->success(null, 'Operation successful');
    }

    public function adminDestroy($id)
    {
        $userId = Auth::id();
        $notification = AdminNotification::where('user_id', $userId)
            ->findOrFail($id);

        $notification->delete();

        return $this->success(null, 'Operation successful');
    }

}
