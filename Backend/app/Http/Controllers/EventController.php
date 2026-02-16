<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Event;
use App\Models\EventView;
use App\Models\EventUserDeclines;
use App\Models\Institute;
use App\Models\Notification;
use App\Models\User;
use App\Models\EventUserInterest;
use Illuminate\Http\Request;
use App\Models\Post;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Carbon;
use App\Services\AdminActivityLogger;


class EventController extends Controller
{

    // index removed




    // create removed


    public function store(Request $request, $id)
    {
        $request->validate([
            'event_title' => 'required|string|max:255',
            'event_image' => 'required|image|max:2048',
            'event_description' => 'required|string',
            'event_date' => 'required|date',
            'main_location' => 'required|string',
            'sub_location' => 'required|string',
        ]);

        // Get the logged-in user's institute ID
        $instituteId = Auth::user()->institute->id;

        // Handle the image upload
        $eventImagePath = $request->file('event_image')->store('event_images', 'public');

        // Store the event data
        Event::create([
            'institute_id' => $id,
            'event_title' => $request->event_title,
            'event_description' => $request->event_description,
            'event_image' => $eventImagePath,
            'event_date' => $request->event_date,
            'main_location' => $request->main_location,
            'sub_location' => $request->sub_location,
        ]);

        // Get the logged-in user's institute and ID
        $userInstituteId = Auth::user()->institute_id;
        $userId = Auth::id();



        // Create a single notification for the post (exclude the creator from receiving the notification)
        Notification::create([
            'title' => 'New Post Added',
            'message' => 'An institute has added a new post about their program.',
            'type' => 'event', // or 'event' for events
            'created_by' => $userId, // The ID of the user who uploaded the post
            'institute_id' => $instituteId, // Institute that added the post
        ]);



        return redirect()->route('profile.edit', ['id' => $id])->with('success', 'Event created successfully!');
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

        // Update fields individually
        $event->event_title = $request->event_title;
        $event->event_description = $request->event_description;
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

        AdminActivityLogger::log(
            'Deleted Event',
            'Event',
            $eventId,
            auth()->user()->name . " deleted event \"{$eventTitle}\""
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

            // Track view if not already viewed (Optional, but keeping for stats)
            $alreadyViewed = EventView::where('user_id', $userId)
                ->where('event_id', $eventId)
                ->exists();

            if (!$alreadyViewed) {
                EventView::create([
                    'user_id' => $userId,
                    'event_id' => $eventId,
                    'viewed_at' => now(),
                ]);
                $event->increment('view_count');
            }

            return response()->json(['status' => 'success']);
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
        Log::info("TrackView called for event $id by user " . (auth()->id() ?? 'guest'));

        $event = Event::findOrFail($id);
        $user = auth()->user();

        // Prevent owner from incrementing their own event views (optional)
        if ($user && $user->role === 'Institute' && $event->institute_id === $user->institute->id) {
            return response()->json(['status' => 'ignored_own_event']);
        }

        if ($user) {
            // Track unique views per user, if needed
            $alreadyViewed = EventView::where('user_id', $user->id)
                ->where('event_id', $event->id)
                ->exists();

            if (!$alreadyViewed) {
                $event->increment('view_count');
                EventView::create([
                    'user_id' => $user->id,
                    'event_id' => $event->id,
                    'viewed_at' => now(),
                ]);
            }
        } else {
            // Track via session for guests
            $viewedEvents = session()->get('viewed_events', []);
            if (!in_array($event->id, $viewedEvents)) {
                $event->increment('view_count');
                $viewedEvents[] = $event->id;
                session()->put('viewed_events', $viewedEvents);
            }
        }

        return response()->json(['status' => 'success']);
    }

    // Get paginated upcoming events API
    public function apiIndex()
    {
        $userId = Auth::id();

        $query = Event::with(['institute'])
            ->whereDate('event_date', '>=', Carbon::today())
            ->where('is_active', true);

        if ($userId) {
            $declinedIds = EventUserDeclines::where('user_id', $userId)->pluck('event_id');
            $query->whereNotIn('id', $declinedIds);
        }

        $events = $query->orderBy('event_date', 'asc')
            ->paginate(12);

        // Transformation on the collection to avoid Paginator::through issues if any
        $events->getCollection()->transform(function ($event) use ($userId) {
            $event->is_interested = $userId ? DB::table('event_user_interests')
                ->where('event_id', $event->id)
                ->where('user_id', $userId)
                ->exists() : false;
            return $event;
        });

        return response()->json($events);
    }
    // API: Store a new event
    public function apiStore(Request $request, $id)
    {
        try {
            $request->validate([
                'event_title' => 'required|string|max:255',
                'event_description' => 'required|string',
                'event_date' => 'required|date',
                'main_location' => 'required|string',
                'sub_location' => 'required|string',
                'event_image' => 'required|image|max:2048',
            ]);

            $institute = Institute::findOrFail($id);
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

            // Create a new event
            $event = Event::create([
                'institute_id' => $institute->id,
                'event_title' => $request->event_title,
                'event_description' => $request->event_description,
                'event_image' => $eventImagePath,
                'event_date' => $request->event_date,
                'main_location' => $request->main_location,
                'sub_location' => $request->sub_location,
                'is_active' => true
            ]);

            // Create a notification
            Notification::create([
                'title' => 'New Event Added',
                'message' => "{$institute->institute_name} has added a new event: {$request->event_title}.",
                'type' => 'event',
                'created_by' => $user->id,
                'institute_id' => $institute->id,
            ]);

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

            // Update fields individually
            $event->event_title = $request->event_title;
            $event->event_description = $request->event_description;
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
