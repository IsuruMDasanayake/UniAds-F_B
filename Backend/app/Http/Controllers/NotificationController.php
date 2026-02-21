<?php

namespace App\Http\Controllers;

use App\Models\Notification;
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

        return response()->json([
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

        return response()->json(['success' => true]);
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

        return response()->json(['success' => true]);
    }

    public function destroy($id)
    {
        $instituteId = Auth::user()->institute->id;
        $notification = Notification::where('institute_id', $instituteId)->findOrFail($id);

        $notification->delete();

        return response()->json(['success' => true]);
    }
}
