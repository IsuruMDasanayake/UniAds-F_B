<?php

namespace App\Http\Controllers;

use App\Models\Event;
use App\Models\EventView;
use App\Models\EventUserDeclines;
use App\Models\Institute;
use App\Models\User;
use App\Models\EventUserInterest;
use App\Models\Notification;
use App\Models\AdminNotification;
use App\Services\InstituteActivityLogger;
use App\Services\AdminActivityLogger;
use App\Services\ImageOptimiser;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Carbon;
use Mews\Purifier\Facades\Purifier;

class EventController extends Controller
{
    /**
     * Store a new event (Web/Blade)
     */
    public function store(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $request->validate([
                'event_title' => 'required|string|max:255',
                'event_image' => 'required|image|max:2048',
                'event_description' => 'required|string',
                'event_date' => 'required|date',
                'main_location' => 'required|string',
                'sub_location' => 'required|string',
            ]);

            // Handle image upload with Optimization
            $eventImagePath = ImageOptimiser::store($request->file('event_image'), 'event_images');

            // Sanitize event description
            $sanitizedDescription = Purifier::clean($request->event_description);

            // Store the event data
            $event = Event::create([
                'institute_id' => $id,
                'event_title' => $request->event_title,
                'event_description' => $sanitizedDescription,
                'event_image' => $eventImagePath,
                'event_date' => $request->event_date,
                'main_location' => $request->main_location,
                'sub_location' => $request->sub_location,
            ]);

            return redirect()->route('profile.edit', ['id' => $id])->with('success', 'Event created successfully!');
        });
    }

    /**
     * Show the edit event form data (JSON)
     */
    public function edit($id)
    {
        $event = Event::findOrFail($id);
        return response()->json($event);
    }

    /**
     * Update the event (Web/Blade)
     */
    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        $request->validate([
            'event_title' => 'required|string|max:255',
            'event_description' => 'required|string',
            'event_date' => 'required|date',
            'sub_location' => 'nullable|string',
            'main_location' => 'nullable|string',
            'event_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        // Sanitize event description
        $sanitizedDescription = Purifier::clean($request->event_description);

        // Update fields individually
        $event->event_title = $request->event_title;
        $event->event_description = $sanitizedDescription;
        $event->event_date = $request->event_date;
        $event->sub_location = $request->sub_location;
        $event->main_location = $request->main_location;

        // Handle file upload with Optimization
        if ($request->hasFile('event_image')) {
            if ($event->event_image) {
                Storage::disk('public')->delete($event->event_image);
            }
            $event->event_image = ImageOptimiser::store($request->file('event_image'), 'event_images');
        }

        $event->save();

        return redirect()->back()->with('success', 'Event updated successfully.');
    }

    /**
     * Delete an event
     */
    public function destroy($id)
    {
        $event = Event::findOrFail($id);
        $user = Auth::user();

        // Authorization: Admin OR Owner
        if ($user->role !== 'Admin') {
            if ($user->role !== 'Institute' || !$user->institute || $event->institute_id !== $user->institute->id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
        }

        // Delete associated image
        if ($event->event_image) {
            Storage::disk('public')->delete($event->event_image);
        }

        $eventTitle = $event->event_title;
        $eventId = $event->id;
        $event->delete();

        InstituteActivityLogger::log(
            'Event Deleted',
            "Deleted event: \"{$eventTitle}\"",
            'Content',
            'Event',
            $eventId
        );

        return response()->json(['success' => true, 'message' => 'Event deleted successfully.']);
    }

    // ==========================================
    // API METHODS
    // ==========================================

    /**
     * Admin Index
     */
    public function apiAdminIndex()
    {
        $events = Event::with('institute')->orderBy('created_at', 'desc')->get();
        return response()->json($events);
    }

    /**
     * Toggle Active Status
     */
    public function apiToggleStatus($id)
    {
        $event = Event::findOrFail($id);
        $event->is_active = !$event->is_active;
        $event->save();

        AdminActivityLogger::log(
            'Updated Event Status',
            'Event',
            $event->id,
            auth()->user()->name . " changed active status of event \"{$event->event_title}\" to " . ($event->is_active ? 'Active' : 'Inactive')
        );

        return response()->json(['success' => true, 'is_active' => $event->is_active]);
    }

    /**
     * Mark Interest
     */
    public function markInterest($eventId)
    {
        $userId = Auth::id();
        $event = Event::findOrFail($eventId);

        $interestRecord = EventUserInterest::where('user_id', $userId)
            ->where('event_id', $eventId)
            ->first();

        if ($interestRecord) {
            $interestRecord->delete();
            $event->decrement('interested_count');
            return response()->json(['status' => 'uninterested']);
        } else {
            EventUserInterest::create([
                'user_id' => $userId,
                'event_id' => $eventId,
            ]);

            $event->increment('interested_count');

            Notification::create([
                'institute_id' => $event->institute_id,
                'user_id' => $userId,
                'type' => 'event_interest',
                'title' => 'New Event Interest',
                'message' => auth()->user()->name . " is interested in your event: {$event->event_title}",
                'data' => [
                    'event_id' => $event->id,
                    'event_title' => $event->event_title,
                    'image' => $event->event_image
                ]
            ]);

            return response()->json(['status' => 'interested']);
        }
    }

    /**
     * Decline Event
     */
    public function markDecline($eventId)
    {
        $userId = Auth::id();
        $event = Event::findOrFail($eventId);

        $alreadyDeclined = EventUserDeclines::where('user_id', $userId)
            ->where('event_id', $eventId)
            ->exists();

        if (!$alreadyDeclined) {
            EventUserDeclines::create([
                'user_id' => $userId,
                'event_id' => $eventId,
            ]);
            $event->increment('decline_count');
        }

        return response()->json(['status' => 'declined']);
    }

    /**
     * Track Event Views
     */
    public function trackView(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        $user = Auth::guard('sanctum')->user();
        $ip = $request->ip();
        $today = now()->toDateString();

        if ($user && $user->role === 'Institute' && $user->institute && $event->institute_id === $user->institute->id) {
            return response()->json(['status' => 'ignored_own_event']);
        }

        $uniqueKey = $user
            ? "E:{$event->id}:U:{$user->id}:{$today}"
            : "E:{$event->id}:G:{$ip}:{$today}";

        try {
            DB::transaction(function () use ($event, $user, $ip, $uniqueKey) {
                EventView::create([
                    'user_id' => $user ? $user->id : null,
                    'event_id' => $event->id,
                    'viewed_at' => now(),
                    'ip_address' => $ip,
                    'unique_key' => $uniqueKey
                ]);
                $event->increment('view_count');
            });
            return response()->json(['status' => 'success']);
        } catch (\Illuminate\Database\QueryException $e) {
            if ($e->getCode() == '23000') {
                return response()->json(['status' => 'already_viewed']);
            }
            return response()->json(['status' => 'error'], 500);
        }
    }

    /**
     * API Index: Paginated feed with relations
     */
    public function apiIndex(Request $request)
    {
        $userId = Auth::id();
        $search = $request->query('search');
        $filter = $request->query('filter', 'all');

        $query = Event::with(['institute'])
            ->withExists(['interests as is_interested' => function($q) use ($userId) {
                $q->where('user_id', $userId);
            }])
            ->where('is_active', true);

        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('event_title', 'like', "%{$search}%")
                  ->orWhere('sub_location', 'like', "%{$search}%")
                  ->orWhere('main_location', 'like', "%{$search}%");
            });
        }

        if ($filter === 'today') {
            $query->whereDate('event_date', Carbon::today());
        } elseif ($filter === 'upcoming' || $filter === 'all') {
            $query->whereDate('event_date', '>=', Carbon::today());
        }

        if ($userId) {
            $declinedIds = EventUserDeclines::where('user_id', $userId)->pluck('event_id');
            $query->whereNotIn('id', $declinedIds);
        }

        $events = $query->orderBy('event_date', 'asc')->paginate(12);

        return response()->json($events);
    }

    /**
     * API Store
     */
    public function apiStore(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            try {
                $validator = Validator::make($request->all(), [
                    'event_title' => 'required|string|max:255',
                    'event_description' => 'required|string',
                    'event_date' => 'required|date',
                    'main_location' => 'required|string',
                    'sub_location' => 'required|string',
                    'event_image' => 'required|image|max:2048',
                ]);

                if ($validator->fails()) {
                    return $this->validationError($validator->errors());
                }

                $institute = is_numeric($id) ? Institute::findOrFail($id) : Institute::where('slug', $id)->firstOrFail();
                $user = Auth::user();

                if ($user->role !== 'Institute' || !$user->institute || $user->institute->id != $institute->id) {
                    return $this->error('Unauthorized: You do not have permission to post for this institute.', 403);
                }

                $eventImagePath = ImageOptimiser::store($request->file('event_image'), 'event_images');
                $sanitizedDescription = Purifier::clean($request->event_description);

                $event = Event::create([
                    'institute_id' => $institute->id,
                    'event_title' => $request->event_title,
                    'event_description' => $sanitizedDescription,
                    'event_image' => $eventImagePath,
                    'event_date' => $request->event_date,
                    'main_location' => $request->main_location,
                    'sub_location' => $request->sub_location,
                    'is_active' => true
                ]);

                // Notifications
                $admins = User::where('role', 'Admin')->get();
                if ($admins->count() > 0) {
                    $notifications = $admins->map(fn($admin) => [
                        'user_id' => $admin->id,
                        'type' => 'event_new',
                        'title' => 'New Event Created',
                        'message' => "{$institute->institute_name} has created a new event: {$event->event_title}",
                        'data' => json_encode(['event_id' => $event->id, 'institute_id' => $institute->id]),
                        'is_read' => false,
                        'created_at' => now(),
                        'updated_at' => now()
                    ])->toArray();
                    AdminNotification::insert($notifications);
                }

                InstituteActivityLogger::log('Event Created', "Created a new event: \"{$event->event_title}\"", 'Content', 'Event', $event->id);

                return $this->success($event, 'Event created successfully!', 201);
            } catch (\Exception $e) {
                return $this->error('An error occurred during event creation.', 500, $e->getMessage());
            }
        });
    }

    /**
     * API Update
     */
    public function apiUpdate(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            try {
                $event = Event::findOrFail($id);

                $validator = Validator::make($request->all(), [
                    'event_title' => 'required|string|max:255',
                    'event_description' => 'required|string',
                    'event_date' => 'required|date',
                    'main_location' => 'required|string',
                    'sub_location' => 'required|string',
                    'event_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
                ]);

                if ($validator->fails()) {
                    return $this->validationError($validator->errors());
                }

                $user = Auth::user();
                if ($user->role !== 'Institute' || !$user->institute || $user->institute->id != $event->institute_id) {
                    return $this->error('Unauthorized: You do not have permission to update this event.', 403);
                }

                if ($request->hasFile('event_image')) {
                    if ($event->event_image) {
                        Storage::disk('public')->delete($event->event_image);
                    }
                    $event->event_image = ImageOptimiser::store($request->file('event_image'), 'event_images');
                }

                $sanitizedDescription = Purifier::clean($request->event_description);

                $event->update([
                    'event_title' => $request->event_title,
                    'event_description' => $sanitizedDescription,
                    'event_date' => $request->event_date,
                    'sub_location' => $request->sub_location,
                    'main_location' => $request->main_location,
                ]);

                return $this->success($event, 'Event updated successfully!');
            } catch (\Exception $e) {
                return $this->error('An error occurred during event update.', 500, $e->getMessage());
            }
        });
    }
}
