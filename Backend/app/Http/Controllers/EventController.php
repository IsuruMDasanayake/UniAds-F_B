<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Event;
use App\Models\EventView;
use App\Models\EventUserDeclines;
use App\Models\Institute;
use App\Models\User;
use App\Models\EventUserInterest;
use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\Notification;
use App\Models\AdminNotification;
use App\Services\InstituteActivityLogger;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use App\Services\AdminActivityLogger;
use Mews\Purifier\Facades\Purifier;


class EventController extends Controller
{

    // index removed




    // create removed


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

            // Handle the image upload
            $eventImagePath = $request->file('event_image')->store('event_images', 'public');

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



    // Show the edit event form and return the event data as JSON
    public function edit($id)
    {
        $event = Event::findOrFail($id); // Fetch the event by ID or fail if not found
        return response()->json($event); // Return the event data as JSON
    }





    // Update the event in the database
    public function update(Request $request, $id)
    {
        $event = Event::findOrFail($id);

        // Validate the request
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

        // Handle file upload
        if ($request->hasFile('event_image')) {
            $eventImagePath = $request->file('event_image')->store('event_images', 'public');
            $event->event_image = $eventImagePath;
        }

        // Save the event
        $event->save();

        return redirect()->back()->with('success', 'Event updated successfully.');
    }





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

        // Delete the associated image file if it exists
        if ($event->event_image && Storage::exists('public/' . $event->event_image)) {
            Storage::delete('public/' . $event->event_image);
        }

        // Delete the event
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
    // API METHODS FOR ADMIN DASHBOARD
    // ==========================================

    public function apiAdminIndex()
    {
        $events = Event::with('institute')->orderBy('created_at', 'desc')->get();
        return response()->json($events);
    }

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




    // Mark an event as interested by the user
    public function markInterest($eventId)
    {
        $userId = Auth::id();
        $event = Event::findOrFail($eventId);

        // Check if the user has already marked interest
        $interestRecord = EventUserInterest::where('user_id', $userId)
            ->where('event_id', $eventId)
            ->first();

        if ($interestRecord) {
            // Already interested -> UN-INTEREST (Toggle off)
            $interestRecord->delete();
            $event->decrement('interested_count');
            return response()->json(['status' => 'uninterested']);
        } else {
            // Not interested -> INTEREST (Toggle on)
            EventUserInterest::create([
                'user_id' => $userId,
                'event_id' => $eventId,
            ]);

            // Update interested count
            $event->increment('interested_count');

            // Trigger Notification
            Notification::create([
                'institute_id' => $event->institute_id,
                'user_id' => auth()->id(),
                'type' => 'event_interest',
                'title' => 'New Event Interest',
                'message' => auth()->user()->name . " is interested in your event: {$event->event_title}",
                'data' => [
                    'event_id' => $event->id,
                    'event_title' => $event->event_title,
                    'image' => $event->event_image
                ]
            ]);

            // Track view if not already viewed today
            $alreadyViewed = EventView::where('user_id', $userId)
                ->where('event_id', $eventId)
                ->where('created_at', '>=', now()->startOfDay())
                ->exists();

            if (!$alreadyViewed) {
                EventView::create([
                    'user_id' => $userId,
                    'event_id' => $eventId,
                    'viewed_at' => now(),
                ]);
                $event->increment('view_count');
            }

            return response()->json(['status' => 'interested']);
        }
    }

    //


    public function markDecline($eventId)
    {
        $userId = Auth::id();
        $event = Event::findOrFail($eventId);

        // Check if user has already declined this event
        $alreadyDeclined = EventUserDeclines::where('user_id', $userId)
            ->where('event_id', $eventId)
            ->exists();

        if (!$alreadyDeclined) {
            // Save to event_user_declines table
            EventUserDeclines::create([
                'user_id' => $userId,
                'event_id' => $eventId,
            ]);

            // Increment decline_count in events table
            $event->increment('decline_count');
        }

        return response()->json(['status' => 'declined']);
    }



    // Track event views
    public function trackView(Request $request, $id)
    {
        $event = Event::findOrFail($id);
        // Use sanctum guard explicitly to identify user even on public route
        $user = Auth::guard('sanctum')->user();
        $ip = $request->ip();
        $today = now()->toDateString();

        // Prevent owner from incrementing their own event views
        if ($user && $user->role === 'Institute' && $user->institute && $event->institute_id === $user->institute->id) {
            return response()->json(['status' => 'ignored_own_event']);
        }

        // Generate a unique key for the database to enforce daily uniqueness
        // Pattern: E:{event_id}:{U/G}:{id/ip}:{date}
        $uniqueKey = $user
            ? "E:{$event->id}:U:{$user->id}:{$today}"
            : "E:{$event->id}:G:{$ip}:{$today}";

        try {
            DB::transaction(function () use ($event, $user, $ip, $uniqueKey) {
                // Attempt to create the view record.
                // DB unique constraint on unique_key will prevent duplicates.
                EventView::create([
                    'user_id' => $user ? $user->id : null,
                    'event_id' => $event->id,
                    'viewed_at' => now(),
                    'ip_address' => $ip,
                    'unique_key' => $uniqueKey
                ]);

                // If create succeeds, increment the main counter
                $event->increment('view_count');
            });
            return response()->json(['status' => 'success']);
        } catch (\Illuminate\Database\QueryException $e) {
            // Error code 23000 is for unique constraint violations in MySQL
            if ($e->getCode() == '23000') {
                return response()->json(['status' => 'already_viewed']);
            }
            Log::error("Failed to track event view: " . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        } catch (\Exception $e) {
            Log::error("General error in track event view: " . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }

    // Get paginated upcoming events API
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

        // Apply Search
        if ($search) {
            $query->where(function ($q) use ($search) {
                $q->where('event_title', 'like', "%{$search}%")
                  ->orWhere('sub_location', 'like', "%{$search}%")
                  ->orWhere('main_location', 'like', "%{$search}%");
            });
        }

        // Apply Filter
        if ($filter === 'today') {
            $query->whereDate('event_date', Carbon::today());
        } elseif ($filter === 'upcoming' || $filter === 'all') {
            $query->whereDate('event_date', '>=', Carbon::today());
        }

        if ($userId) {
            $declinedIds = EventUserDeclines::where('user_id', $userId)->pluck('event_id');
            $query->whereNotIn('id', $declinedIds);
        }

        /** @var \Illuminate\Pagination\LengthAwarePaginator $events */
        $events = $query->orderBy('event_date', 'asc')
            ->paginate(12);

        return response()->json($events);
    }
    public function apiStore(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            try {
                $request->validate([
                    'event_title' => 'required|string|max:255',
                    'event_description' => 'required|string',
                    'event_date' => 'required|date',
                    'main_location' => 'required|string',
                    'sub_location' => 'required|string',
                    'event_image' => 'required|image|max:2048',
                ]);

                $institute = is_numeric($id) ? Institute::findOrFail($id) : Institute::where('slug', $id)->firstOrFail();
                $id = $institute->id; 
                $user = Auth::user();

                // Check if user belongs to this institute
                if ($user->role !== 'Institute' || !$user->institute || $user->institute->id != $id) {
                    return response()->json([
                        'message' => 'Unauthorized: You do not have permission to post for this institute.',
                    ], 403);
                }

                // Handle image upload
                $eventImagePath = null;
                if ($request->hasFile('event_image')) {
                    $eventImagePath = $request->file('event_image')->store('event_images', 'public');
                }

                // Sanitize event description
                $sanitizedDescription = Purifier::clean($request->event_description);

                // Create a new event
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

                // Notify Admins
                $admins = User::where('role', 'Admin')->get();
                if ($admins->count() > 0) {
                    $notifications = $admins->map(fn($admin) => [
                        'user_id' => $admin->id,
                        'type' => 'event_new',
                        'title' => 'New Event Created',
                        'message' => "{$institute->institute_name} has created a new event: {$event->event_title}",
                        'data' => json_encode([
                            'event_id' => $event->id,
                            'institute_id' => $institute->id
                        ]),
                        'is_read' => false,
                        'created_at' => now(),
                        'updated_at' => now()
                    ])->toArray();

                    AdminNotification::insert($notifications);
                }

                InstituteActivityLogger::log(
                    'Event Created',
                    "Created a new event: \"{$event->event_title}\"",
                    'Content',
                    'Event',
                    $event->id
                );

                return response()->json([
                    'success' => true,
                    'message' => 'Event created successfully!',
                    'event' => $event
                ], 201);
            } catch (\Illuminate\Validation\ValidationException $e) {
                return response()->json([
                    'message' => 'Validation failed',
                    'errors' => $e->errors()
                ], 422);
            } catch (\Exception $e) {
                return response()->json([
                    'message' => 'An error occurred',
                    'error' => $e->getMessage()
                ], 500);
            }
        });
    }
    public function apiUpdate(Request $request, $id)
    {
        try {
            $event = Event::findOrFail($id);
            $user = Auth::user();

            // Authorization check
            if ($user->role !== 'Institute' || !$user->institute || $event->institute_id !== $user->institute->id) {
                return response()->json([
                    'message' => 'Unauthorized operation.'
                ], 403);
            }

            // Validate the request
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

            // Handle file upload
            if ($request->hasFile('event_image')) {
                // Delete old image if exists
                if ($event->event_image && Storage::exists('public/' . $event->event_image)) {
                    Storage::delete('public/' . $event->event_image);
                }

                $eventImagePath = $request->file('event_image')->store('event_images', 'public');
                $event->event_image = $eventImagePath;
            }

            // Save the event
            $event->save();

            InstituteActivityLogger::log(
                'Event Updated',
                "Updated event: \"{$event->event_title}\"",
                'Content',
                'Event',
                $event->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Event updated successfully.',
                'event' => $event
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Event Update Error: ' . $e->getMessage());
            return response()->json([
                'message' => 'An error occurred while updating the event.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
