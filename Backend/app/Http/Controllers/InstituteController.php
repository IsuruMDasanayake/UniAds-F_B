<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Institute;
use App\Models\Category;
use App\Models\Follower;
use Illuminate\Support\Facades\Hash;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use App\Mail\InstituteApprovedMail;
use App\Mail\InstituteUnapprovedMail;
use App\Models\InstituteProfileView;
use App\Models\Notification;
use App\Services\AdminActivityLogger;
use App\Services\InstituteActivityLogger;

class InstituteController extends Controller
{
    // institutesmanage removed




    // approve removed





    // instituteadd removed

    // store removed (truncated in previous chunk target, so this covers the rest of store and show)
    // show removed





    public function destroy($id)
    {
        $institute = Institute::findOrFail($id);
        $instituteName = $institute->institute_name;
        $instituteId = $institute->id;
        $institute->delete(); // Delete the institute

        AdminActivityLogger::log(
            'Deleted',
            'Institute',
            $instituteId,
            auth()->user()->name . " deleted institute \"{$instituteName}\""
        );

        return response()->json(['success' => true, 'message' => 'Institute deleted successfully!']);
    }




    public function update(Request $request, $id)
    {
        $institute = Institute::findOrFail($id);

        $validatedData = $request->validate([
            'institute_name' => 'required|string|max:255',
            'location' => 'required|string|max:255',
            'email' => 'required|email|unique:institutes,email,' . $id,
            'contact_number' => 'required|string|max:15',
            'gov_register_number' => 'required|string|max:255',
            'profile_photo' => 'nullable|image|max:2048',
            'cover_photo' => 'nullable|image|max:2048',
            'bio' => 'nullable|string',
            'website' => 'nullable|url',
            'is_premium' => 'nullable|boolean',

        ]);

        $institute->update($validatedData);

        if ($request->hasFile('profile_photo')) {
            $institute->profile_photo = $request->file('profile_photo')->store('profile_photos', 'public');
        }

        if ($request->hasFile('cover_photo')) {
            $institute->cover_photo = $request->file('cover_photo')->store('cover_photos', 'public');
        }

        $institute->save();

        return redirect()->back()->with('success', 'Institute updated successfully.');
    }



    // showInstitutions removed


    public function apiIndex()
    {
        $institutes = Institute::where('status', 'approved')
            ->orWhere('is_premium', true)
            ->orderBy('institute_name', 'asc')
            ->get();

        return response()->json($institutes);
    }






    // showProfile removed












    // instituteupdate removed




    //Courses on institute
    // showCourses removed




    //Followers
    public function toggleFollow($id)
    {
        $user = auth()->user();

        $institute = is_numeric($id) ? Institute::findOrFail($id) : Institute::where('slug', $id)->firstOrFail();
        $id = $institute->id;

        $follow = Follower::where('user_id', $user->id)
            ->where('institute_id', $id)
            ->first();

        if ($follow) {
            $follow->delete();
            $institute->decrement('followers_count');
            $status = 'unfollowed';
        } else {
            Follower::create([
                'user_id' => $user->id,
                'institute_id' => $id
            ]);
            $institute->increment('followers_count');

            // Trigger Notification
            Notification::create([
                'institute_id' => $id,
                'user_id' => $user->id,
                'type' => 'follower_new',
                'title' => 'New Follower',
                'message' => $user->name . ' started following your institute.',
                'data' => [
                    'user_id' => $user->id,
                    'user_name' => $user->name
                ]
            ]);

            $status = 'followed';
        }

        return response()->json([
            'status' => $status,
            'followers_count' => $institute->followers_count
        ]);
    }

    public function apiShowProfile($id)
    {
        // Fetch the institute by ID or Slug
        $institute = is_numeric($id) ? Institute::findOrFail($id) : Institute::where('slug', $id)->firstOrFail();
        $id = $institute->id; // Use numeric ID for subsequent queries like AboutSection
        $categories = Category::all();

        $posts = $institute->posts()
            ->latest()
            ->paginate(10); // 10 posts per page

        $user = auth('sanctum')->user();

        // Add liked/saved status for each post
        $posts->getCollection()->transform(function ($post) use ($user) {
            $post->is_liked_by_user = $user ? $post->likes()->where('user_id', $user->id)->exists() : false;
            $post->is_saved_by_user = ($user && $user->role === 'User') ? $user->savedPosts()->where('post_id', $post->id)->exists() : false;
            return $post;
        });

        $events = $institute->events()
            ->where('is_active', true)
            ->latest()
            ->paginate(10);

        $user = auth()->user();

        $aboutSection = \App\Models\AboutSection::where('institute_id', $institute->id)->first();

        // Track View similar to showProfile but adaptable for API if needed
        // For now, skipping view tracking or could implement same logic if request has IP

        // Check if the logged-in user is following this institute
        $isFollowing = false;
        if (Auth::check()) {
            $isFollowing = Follower::where('user_id', Auth::id())
                ->where('institute_id', $institute->id)
                ->exists();
        }

        return response()->json([
            'institute' => $institute,
            'posts' => $posts,
            'events' => $events,
            'categories' => $categories,
            'isFollowing' => $isFollowing,
            'about' => $aboutSection
        ]);
    }

    public function apiUpdateProfile(Request $request, $id)
    {
        try {
            $institute = is_numeric($id) ? Institute::findOrFail($id) : Institute::where('slug', $id)->firstOrFail();
            $id = $institute->id; // Ensure we have the numeric ID for subsequent logic
            $user = Auth::user();

            // Check if user belongs to this institute
            if ($user->role !== 'Institute' || !$user->institute || $user->institute->id != $id) {
                return response()->json([
                    'message' => 'Unauthorized: You do not have permission to update this institute.',
                ], 403);
            }

            // Validate inputs
            $request->validate([
                'institute_name' => 'sometimes|required|string|max:255',
                'institute_type' => 'sometimes|required|string|in:University,Higher Education Institute,College,Institute,Training Center,Vocational Training Center,Technical Institute,Professional Institute,Academy,Government Institute,International Institute',
                'location' => 'sometimes|required|string|max:255',
                'email' => [
                    'sometimes',
                    'required',
                    'email',
                    Rule::unique('institutes', 'email')->ignore($id),
                    Rule::unique('users', 'email')->ignore($institute->user_id),
                ],
                'contact_number' => 'sometimes|required|string|max:15',
                'website' => 'nullable|url',
                'bio' => 'nullable|string|max:1000',
                'profile_photo' => 'nullable|image|max:2048',
                'cover_photo' => 'nullable|image|max:2048',
                'slug' => [
                    'nullable',
                    'string',
                    'max:255',
                    Rule::unique('institutes', 'slug')->ignore($id),
                ],
                'latitude' => 'nullable|numeric|between:-90,90',
                'longitude' => 'nullable|numeric|between:-180,180',
                'followers_enabled' => 'nullable|string|in:0,1,true,false',
                'reviews_enabled' => 'nullable|string|in:0,1,true,false',
                'chat_enabled' => 'nullable|string|in:0,1,true,false',
                'inquiries_enabled' => 'nullable|string|in:0,1,true,false',
                'applications_enabled' => 'nullable|string|in:0,1,true,false',
            ]);

            // Update profile photo
            if ($request->hasFile('profile_photo')) {
                if ($institute->profile_photo) {
                    Storage::delete('public/' . $institute->profile_photo);
                }
                $institute->profile_photo = $request->file('profile_photo')->store('institute_photos', 'public');
            }

            // Update cover photo
            if ($request->hasFile('cover_photo')) {
                if ($institute->cover_photo) {
                    Storage::delete('public/' . $institute->cover_photo);
                }
                $institute->cover_photo = $request->file('cover_photo')->store('institute_covers', 'public');
            }

            // Update fields conditionally to prevent partial updates from nulling existing data
            if ($request->has('institute_name')) {
                $institute->institute_name = $request->institute_name;
            }
            if ($request->has('institute_type')) {
                $institute->institute_type = $request->institute_type;
            }
            if ($request->has('location')) {
                $institute->location = $request->location;
            }
            if ($request->has('email')) {
                $institute->email = $request->email;
            }
            if ($request->has('contact_number')) {
                $institute->contact_number = $request->contact_number;
            }
            if ($request->has('website')) {
                $institute->website = $request->website;
            }
            if ($request->has('bio')) {
                $institute->bio = $request->bio;
            }

            if ($request->has('slug') && !empty($request->slug)) {
                $institute->slug = \Illuminate\Support\Str::slug($request->slug);
            }

            if ($request->has('latitude')) {
                $institute->latitude = $request->latitude;
            }
            if ($request->has('longitude')) {
                $institute->longitude = $request->longitude;
            }

            // Premium toggles logic
            if ($institute->is_premium) {
                if ($request->has('followers_enabled')) {
                    $institute->followers_enabled = filter_var($request->followers_enabled, FILTER_VALIDATE_BOOLEAN);
                }
                if ($request->has('reviews_enabled')) {
                    $institute->reviews_enabled = filter_var($request->reviews_enabled, FILTER_VALIDATE_BOOLEAN);
                }
                if ($request->has('chat_enabled')) {
                    $institute->chat_enabled = filter_var($request->chat_enabled, FILTER_VALIDATE_BOOLEAN);
                }
                if ($request->has('inquiries_enabled')) {
                    $institute->inquiries_enabled = filter_var($request->inquiries_enabled, FILTER_VALIDATE_BOOLEAN);
                }
                if ($request->has('applications_enabled')) {
                    $institute->applications_enabled = filter_var($request->applications_enabled, FILTER_VALIDATE_BOOLEAN);
                }
            }

            $institute->save();

            // Update user record
            $userRecord = User::find($institute->user_id);
            if ($userRecord) {
                $userRecord->name = $request->institute_name;
                $userRecord->email = $request->email;
                if ($institute->profile_photo) {
                    $userRecord->profile_picture = $institute->profile_photo;
                }
                $userRecord->save();
            }

            InstituteActivityLogger::log(
                'Profile Updated',
                "Updated institute profile and preferences.",
                'Account'
            );

            return response()->json([
                'success' => true,
                'message' => 'Profile updated successfully!',
                'institute' => $institute->fresh()
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'An error occurred during update',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    // --- Institute About Section API Methods ---

    public function apiStoreAbout(Request $request, $id)
    {
        $institute = is_numeric($id) ? Institute::findOrFail($id) : Institute::where('slug', $id)->firstOrFail();
        $id = $institute->id;

        // Authorization check
        $user = Auth::user();
        if (!$user || $user->role !== 'Institute' || !$user->institute || $user->institute->id != $institute->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Validate
        // Note: Validation rules can be extensive, skipping detailed validation for brevity as user requested "working logics"
        // But basics should be validated.

        $data = $request->except(['chancellor_photo', 'vice_chancellor_photo', 'academic_images', 'programs_images', 'partnerships_images', 'life_images', 'sports_images', 'upcoming_images', 'campus_images']);
        $data['institute_id'] = $institute->id;

        // Handle File Uploads
        $imageFields = [
            'chancellor_photo',
            'vice_chancellor_photo', // Single
            'academic_images',
            'programs_images',
            'partnerships_images',
            'life_images',
            'sports_images',
            'upcoming_images',
            'campus_images' // Multi
        ];

        foreach ($imageFields as $field) {
            if ($request->hasFile($field)) {
                if (in_array($field, ['chancellor_photo', 'vice_chancellor_photo'])) {
                    // Single file
                    $data[$field] = $request->file($field)->store('institute_about', 'public');
                } else {
                    // Multi file
                    $paths = [];
                    foreach ($request->file($field) as $file) {
                        $paths[] = $file->store('institute_about', 'public');
                    }
                    $data[$field] = json_encode($paths);
                }
            }
        }

        $about = \App\Models\AboutSection::create($data);

        return response()->json(['message' => 'About section created successfully', 'about' => $about]);
    }

    public function apiUpdateAbout(Request $request, $id)
    {
        $institute = is_numeric($id) ? Institute::findOrFail($id) : Institute::where('slug', $id)->firstOrFail();
        // and using $id for rest of local logic
        $id = $institute->id; // Ensure we use numeric ID for query
        $about = \App\Models\AboutSection::where('institute_id', $id)->firstOrFail();

        // Authorization check
        $user = Auth::user();
        if (!$user || $user->role !== 'Institute' || !$user->institute || $user->institute->id != $institute->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $data = $request->except(['removed_academic_images', 'removed_programs_images', 'removed_partnerships_images', 'removed_life_images', 'removed_sports_images', 'removed_upcoming_images', 'removed_campus_images', 'chancellor_photo', 'vice_chancellor_photo', 'academic_images', 'programs_images', 'partnerships_images', 'life_images', 'sports_images', 'upcoming_images', 'campus_images']);

        // Handle Image Removals first
        // User sends 'removed_field' => JSON array of paths to remove
        $multiImageFields = ['academic_images', 'programs_images', 'partnerships_images', 'life_images', 'sports_images', 'upcoming_images', 'campus_images'];

        foreach ($multiImageFields as $field) {
            $removedKey = 'removed_' . $field;
            if ($request->has($removedKey)) {
                $removedPaths = json_decode($request->input($removedKey), true);
                $currentPaths = $about->$field ? json_decode($about->$field, true) : [];

                if ($removedPaths && is_array($removedPaths)) {
                    foreach ($removedPaths as $path) {
                        // Remove from storage
                        if (Storage::disk('public')->exists($path)) {
                            Storage::disk('public')->delete($path);
                        }
                        // Remove from array
                        $currentPaths = array_values(array_diff($currentPaths, [$path]));
                    }
                    $data[$field] = json_encode($currentPaths);
                    // Update model immediately so subsequent adds work on clean state? 
                    // Or just keep accumulating logic.
                    // Better to just update $data[$field] with kept paths.
                    // BUT, we need to pass this kept list to the next step (additions).
                    // So let's actually update $about->$field in memory for now?
                }
            } else {
                // Even if no removal, we need existing paths if we are just appending?
                // Wait, if no removal, we keep existing logic unless overridden?
                // The standard logic is: get current, remove deleted, add new.
                $data[$field] = $about->$field; // Keep existing by default if not modified
            }
        }


        // Handle New File Uploads
        // Single Photos
        if ($request->hasFile('chancellor_photo')) {
            if ($about->chancellor_photo) Storage::disk('public')->delete($about->chancellor_photo);
            $data['chancellor_photo'] = $request->file('chancellor_photo')->store('institute_about', 'public');
        }
        if ($request->hasFile('vice_chancellor_photo')) {
            if ($about->vice_chancellor_photo) Storage::disk('public')->delete($about->vice_chancellor_photo);
            $data['vice_chancellor_photo'] = $request->file('vice_chancellor_photo')->store('institute_about', 'public');
        }

        // Multi Photos (Appending)
        foreach ($multiImageFields as $field) {
            // Retrieve current paths (either from DB or from the removal step above)
            // Only if we haven't set it in data yet?
            // Actually, the removal logic above sets $data[$field].
            // So we decode that to get the base array.

            $currentPaths = isset($data[$field]) && $data[$field] ? json_decode($data[$field], true) : [];
            if (!is_array($currentPaths)) $currentPaths = [];

            if ($request->hasFile($field)) {
                foreach ($request->file($field) as $file) {
                    $currentPaths[] = $file->store('institute_about', 'public');
                }
                $data[$field] = json_encode($currentPaths);
            }
        }

        $about->update($data);

        return response()->json(['message' => 'About section updated', 'about' => $about]);
    }

    public function apiDestroyAbout($id)
    {
        $institute = is_numeric($id) ? Institute::findOrFail($id) : Institute::where('slug', $id)->firstOrFail();
        $id = $institute->id;
        $about = \App\Models\AboutSection::where('institute_id', $id)->firstOrFail();

        // Authorization check
        $user = Auth::user();
        if (!$user || $user->role !== 'Institute' || !$user->institute || $user->institute->id != $institute->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Delete all images
        $imageFields = [
            'chancellor_photo',
            'vice_chancellor_photo',
            'academic_images',
            'programs_images',
            'partnerships_images',
            'life_images',
            'sports_images',
            'upcoming_images',
            'campus_images'
        ];

        foreach ($imageFields as $field) {
            if ($about->$field) {
                if (in_array($field, ['chancellor_photo', 'vice_chancellor_photo'])) {
                    Storage::disk('public')->delete($about->$field);
                } else {
                    $paths = json_decode($about->$field, true);
                    if (is_array($paths)) {
                        foreach ($paths as $path) {
                            Storage::disk('public')->delete($path);
                        }
                    }
                }
            }
        }

        $about->delete();

        return response()->json(['message' => 'About info deleted successfully']);
    }

    // ==========================================
    // API METHODS FOR ADMIN DASHBOARD
    // ==========================================

    public function apiAdminIndex()
    {
        $institutes = Institute::orderBy('created_at', 'desc')->get();
        return response()->json($institutes);
    }

    public function apiApprove($id)
    {
        $institute = Institute::findOrFail($id);
        $institute->status = 'approved';
        $institute->save();

        // Send Approval Email
        try {
            if ($institute->email) {
                Mail::to($institute->email)->send(new InstituteApprovedMail($institute));
            }
        } catch (\Exception $e) {
            // Log error but don't fail the request
            \Illuminate\Support\Facades\Log::error('Failed to send approval email: ' . $e->getMessage());
        }

        AdminActivityLogger::log(
            'Approved',
            'Institute',
            $institute->id,
            auth()->user()->name . " approved institute \"{$institute->institute_name}\" via API"
        );

        return response()->json(['success' => true, 'message' => 'Institute approved successfully']);
    }

    public function apiUnapprove($id)
    {
        $institute = Institute::findOrFail($id);
        $institute->status = 'unapproved';
        $institute->save();

        // Send Unapproval Email
        try {
            if ($institute->email) {
                Mail::to($institute->email)->send(new InstituteUnapprovedMail($institute));
            }
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Failed to send unapproval email: ' . $e->getMessage());
        }

        AdminActivityLogger::log(
            'Unapproved',
            'Institute',
            $institute->id,
            auth()->user()->name . " unapproved institute \"{$institute->institute_name}\""
        );

        return response()->json(['success' => true, 'message' => 'Institute unapproved successfully']);
    }

    public function apiTogglePremium(Request $request, $id)
    {
        $institute = Institute::findOrFail($id);

        $institute->is_premium = !$institute->is_premium;

        if ($institute->is_premium) {
            // Set default expiry to 1 month if not provided or just enable it
            // If request has expiry, use it.
            if ($request->has('expires_at')) {
                $institute->premium_expires_at = $request->expires_at;
            } else {
                // Default logic if enabling without specific date: maybe null (forever) or set 30 days
                // For toggle, let's just enable. If admin wants specific date, they use update.
                // Or maybe default to null (active indefinitely until changed) if not set.
            }
        } else {
            $institute->premium_expires_at = null;
        }

        $institute->save();

        AdminActivityLogger::log(
            'Update Premium',
            'Institute',
            $institute->id,
            auth()->user()->name . " changed premium status of \"{$institute->institute_name}\" to " . ($institute->is_premium ? 'Premium' : 'Basic')
        );

        return response()->json([
            'success' => true,
            'message' => 'Premium status updated',
            'is_premium' => $institute->is_premium
        ]);
    }

    public function apiAdminUpdate(Request $request, $id)
    {
        $institute = Institute::findOrFail($id);

        $validatedData = $request->validate([
            'institute_name' => 'required|string|max:255',
            'institute_type' => 'required|string|in:University,Higher Education Institute,College,Institute,Training Center,Vocational Training Center,Technical Institute,Professional Institute,Academy,Government Institute,International Institute',
            'location' => 'required|string|max:255',
            'email' => 'required|email|unique:institutes,email,' . $id,
            'contact_number' => 'required|string|max:15',
            'gov_register_number' => 'required|string|max:255',
            'website' => 'nullable|url',
            'bio' => 'nullable|string',
            'is_premium' => 'boolean',
            'premium_expires_at' => 'nullable|date',
        ]);

        $institute->update($validatedData);

        // Sync with User model if name or email changed
        $user = User::find($institute->user_id);
        if ($user) {
            $user->name = $institute->institute_name;
            $user->email = $institute->email;
            $user->save();
        }

        AdminActivityLogger::log(
            'Updated',
            'Institute',
            $institute->id,
            auth()->user()->name . " updated details for institute \"{$institute->institute_name}\""
        );

        return response()->json(['success' => true, 'message' => 'Institute updated successfully', 'institute' => $institute->fresh()]);
    }
    // Track Institute Profile Views
    public function trackView(Request $request, $id)
    {
        $institute = is_numeric($id) ? Institute::findOrFail($id) : Institute::where('slug', $id)->firstOrFail();
        // Use sanctum guard explicitly to identify user even on public route
        $user = Auth::guard('sanctum')->user();
        $ip = $request->ip();
        $today = now()->toDateString();

        // Prevent owner from incrementing their own profile views
        if ($user && $user->role === 'Institute' && $user->institute && $institute->id === $user->institute->id) {
            return response()->json(['status' => 'ignored_own_profile']);
        }

        // Generate a unique key for the database to enforce daily uniqueness
        // Pattern: I:{inst_id}:{U/G}:{id/ip}:{date}
        $uniqueKey = $user
            ? "I:{$institute->id}:U:{$user->id}:{$today}"
            : "I:{$institute->id}:G:{$ip}:{$today}";

        try {
            DB::transaction(function () use ($institute, $user, $ip, $uniqueKey) {
                // Attempt to create the view record.
                // DB unique constraint on unique_key will prevent duplicates.
                InstituteProfileView::create([
                    'user_id' => $user ? $user->id : null,
                    'institute_id' => $institute->id,
                    'viewed_at' => now(),
                    'ip_address' => $ip,
                    'unique_key' => $uniqueKey
                ]);

                // If create succeeds, increment the main counter
                $institute->increment('profile_views');
            });
            return response()->json(['status' => 'success']);
        } catch (\Illuminate\Database\QueryException $e) {
            // Error code 23000 is for unique constraint violations in MySQL
            if ($e->getCode() == '23000') {
                return response()->json(['status' => 'already_viewed']);
            }
            Log::error("Failed to track profile view: " . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        } catch (\Exception $e) {
            Log::error("General error in track profile view: " . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        }
    }
}
