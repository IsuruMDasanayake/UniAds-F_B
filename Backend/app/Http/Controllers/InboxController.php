<?php

namespace App\Http\Controllers;

use App\Models\IncomingEmail;
use App\Models\Institute;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Cache;

class InboxController extends Controller
{
    /**
     * Manual sync with IMAP server
     */
    public function sync(Request $request)
    {
        // Throttle sync to once every 60 seconds to avoid slow page loads
        // But allow bypass if ?force=true is passed
        if (Cache::has('imap_sync_lock') && !$request->has('force')) {
            return response()->json([
                'message' => 'Sync skipped: recently synchronized',
                'status' => 'skipped'
            ]);
        }

        try {
            Artisan::call('emails:fetch');
            // Set lock for 60 seconds
            Cache::put('imap_sync_lock', true, 60);

            return response()->json([
                'message' => 'Synchronization complete',
                'status' => 'success'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'error' => 'Sync failed: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get paginated list of emails
     */
    public function index(Request $request)
    {
        $query = IncomingEmail::orderBy('received_at', 'desc');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('subject', 'like', "%{$search}%")
                    ->orWhere('from_name', 'like', "%{$search}%")
                    ->orWhere('from_email', 'like', "%{$search}%");
            });
        }

        if ($request->has('status')) {
            if ($request->status === 'unread') {
                $query->where('is_read', false);
            }
        }

        $emails = $query->paginate(15);

        // Append avatar to each email in the collection manually to avoid lint issues
        foreach ($emails->items() as $email) {
            $email->sender_avatar = $this->getSenderAvatar($email->from_email, $email->from_name);
        }

        return response()->json($emails);
    }

    /**
     * Get single email
     */
    public function show($id)
    {
        $email = IncomingEmail::find($id);
        if (!$email) {
            return response()->json(['error' => 'Email not found'], 404);
        }

        $email->sender_avatar = $this->getSenderAvatar($email->from_email, $email->from_name);
        return response()->json($email);
    }

    /**
     * Mark email as read
     */
    public function markAsRead($id)
    {
        $email = IncomingEmail::find($id);
        if (!$email) {
            return response()->json(['error' => 'Email not found'], 404);
        }

        $email->update(['is_read' => true]);
        return response()->json(['message' => 'Email marked as read']);
    }

    /**
     * Get unread count
     */
    public function unreadCount()
    {
        $count = IncomingEmail::where('is_read', false)->count();
        return response()->json(['count' => $count]);
    }

    /**
     * Delete email
     */
    public function destroy($id)
    {
        $email = IncomingEmail::find($id);
        if (!$email) {
            return response()->json(['error' => 'Email not found'], 404);
        }

        $email->delete();
        return response()->json(['message' => 'Email deleted successfully']);
    }

    /**
     * Helper to get sender avatar URL
     */
    private function getSenderAvatar($email, $name = null)
    {
        // 1. Check if it's a registered Institute
        $institute = Institute::where('email', $email)->first();
        if ($institute && $institute->profile_photo) {
            if (filter_var($institute->profile_photo, FILTER_VALIDATE_URL)) {
                return $institute->profile_photo;
            }
            return url('/storage/' . $institute->profile_photo);
        }

        // 2. Check if it's a registered User
        $user = User::where('email', $email)->first();
        if ($user && isset($user->profile_picture) && $user->profile_picture) {
            if (filter_var($user->profile_picture, FILTER_VALIDATE_URL)) {
                return $user->profile_picture;
            }
            return url('/storage/' . $user->profile_picture);
        }

        // 3. Fallback to DiceBear Initials (Matches UserProfilePage aesthetic)
        $seed = $name ?: ($email ?: 'User');
        $seed = urlencode($seed);
        return "https://api.dicebear.com/7.x/initials/svg?seed={$seed}&backgroundColor=ffc107";
    }
}
