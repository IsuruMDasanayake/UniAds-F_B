<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\Institute;
use App\Models\Category;
use App\Models\Follower;
use App\Models\Message; // Added this line
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

use Mews\Purifier\Facades\Purifier;
use App\Services\ImageOptimiser;
use App\Traits\ApiResponse;

class InstituteController extends Controller
{
    use ApiResponse;

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

        return $this->success(null, 'Institute deleted successfully!');
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
        
        // Use ImageOptimiser for optimized storage and ensure old files are deleted (MED-10)
        if ($request->hasFile('profile_photo')) {
            if ($institute->profile_photo) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($institute->profile_photo);
            }
            $institute->profile_photo = \App\Services\ImageOptimiser::store($request->file('profile_photo'), 'institute_photos');
        }

        if ($request->hasFile('cover_photo')) {
            if ($institute->cover_photo) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($institute->cover_photo);
            }
            $institute->cover_photo = \App\Services\ImageOptimiser::store($request->file('cover_photo'), 'institute_covers');
        }

        $institute->save();

        return redirect()->back()->with('success', 'Institute updated successfully.');
    }



    // showInstitutions removed


    public function apiIndex(Request $request)
    {
        $query = $request->query('query');
        $location = $request->query('location');
        $perPage = $request->query('per_page', 12);

        $institutes = Institute::where('status', 'approved')
            // Optionally filter by premium if requested, otherwise show all approved
            ->when($request->query('is_premium'), function ($q) {
                $q->where('is_premium', true);
            })
            ->when($query, function ($q) use ($query) {
                $q->where('institute_name', 'LIKE', "%{$query}%")
                  ->orWhere('location', 'LIKE', "%{$query}%");
            })
            ->when($location, function ($q) use ($location) {
                $q->where('location', 'LIKE', "%{$location}%");
            })
            ->orderBy('is_premium', 'desc')
            ->orderBy('institute_name', 'asc')
            ->paginate($perPage);

        return $this->successResponse($institutes);

    }






    // showProfile removed












    // instituteupdate removed




    //Courses on institute
    // showCourses removed




    //Followers
    public function toggleFollow($id)
    {
        return DB::transaction(function () use ($id) {
            /** @var \App\Models\User $user */
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

            return $this->success([
                'followers_count' => $institute->followers_count,
                'status' => $status
            ], $status === 'followed' ? 'Followed successfully' : 'Unfollowed successfully');
        });
    }


    public function apiShowProfile(Request $request, $id)
    {
        // Fetch the institute by ID or Slug with aggregates
        $query = Institute::withAvg('ratings', 'rating')->withCount('ratings');
        $institute = is_numeric($id) ? $query->findOrFail($id) : $query->where('slug', $id)->firstOrFail();
        $id = $institute->id; // Use numeric ID for subsequent queries like AboutSection
        $categories = Category::all();
        $perPage = $request->query('per_page', 12);

        $posts = $institute->posts()
            ->latest()
            ->paginate($perPage); 

        $user = auth('sanctum')->user();

        // Add liked/saved status for each post
        $userId = $user ? $user->id : null;

        // Inject liked/saved booleans (standardized logic)
        if ($userId && $posts->count() > 0) {
            $postIds = $posts->pluck('id')->toArray();
            $likedPostIds = \App\Models\PostLike::where('user_id', $userId)->whereIn('post_id', $postIds)->pluck('post_id')->toArray();
            $savedPostIds = \App\Models\SavedPost::where('student_id', $userId)->whereIn('post_id', $postIds)->pluck('post_id')->toArray();

            $posts->getCollection()->transform(function($post) use ($likedPostIds, $savedPostIds) {
                $post->is_liked_by_user = in_array($post->id, $likedPostIds);
                $post->is_saved_by_user = in_array($post->id, $savedPostIds);
                return $post;
            });
        } else {
            $posts->getCollection()->transform(function($post) {
                $post->is_liked_by_user = false;
                $post->is_saved_by_user = false;
                return $post;
            });
        }

        $events = $institute->events()
            ->where('is_active', true)
            ->latest()
            ->paginate($perPage);

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

        return $this->successResponse([
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
        return DB::transaction(function () use ($request, $id) {
            try {
                $institute = is_numeric($id) ? Institute::findOrFail($id) : Institute::where('slug', $id)->firstOrFail();
                $id = $institute->id;
                $user = Auth::user();

                // Check if user belongs to this institute
                if ($user->role !== 'Institute' || !$user->institute || $user->institute->id != $id) {
                    return $this->error('Unauthorized: You do not have permission to update this institute.', 403);
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
                    'logo' => 'nullable|image|max:2048',
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

                // Update profile photo with Optimization
                if ($request->hasFile('profile_photo')) {
                    if ($institute->profile_photo) {
                        Storage::delete('public/' . $institute->profile_photo);
                    }
                    $institute->profile_photo = ImageOptimiser::store($request->file('profile_photo'), 'institute_photos');
                }

                // Update cover photo with Optimization
                if ($request->hasFile('cover_photo')) {
                    if ($institute->cover_photo) {
                        Storage::delete('public/' . $institute->cover_photo);
                    }
                    $institute->cover_photo = ImageOptimiser::store($request->file('cover_photo'), 'institute_covers');
                }

                // Update logo with Optimization
                if ($request->hasFile('logo')) {
                    if ($institute->logo) {
                        Storage::delete('public/' . $institute->logo);
                    }
                    $institute->logo = ImageOptimiser::store($request->file('logo'), 'institute_logos');
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
                    $institute->bio = Purifier::clean($request->bio);
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
                    $userRecord->name = $institute->institute_name;
                    $userRecord->email = $institute->email;
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

                return $this->success($institute->fresh(), 'Profile updated successfully!');
            } catch (\Illuminate\Validation\ValidationException $e) {
                return $this->validationError($e->errors());
            } catch (\Exception $e) {
                return $this->error($e->getMessage(), 500);
            }
        });
    }

    // --- Institute About Section API Methods ---

    public function apiStoreAbout(Request $request, $id)
    {
        $institute = is_numeric($id) ? Institute::findOrFail($id) : Institute::where('slug', $id)->firstOrFail();
        $id = $institute->id;

        // Authorization check
        $user = Auth::user();
        if (!$user || $user->role !== 'Institute' || !$user->institute || $user->institute->id != $institute->id) {
            return $this->error('Unauthorized', 403);
        }

        return DB::transaction(function () use ($request, $institute) {
            // Validate
            $request->validate([
                'institute_overview' => 'nullable|string',
                'mission' => 'nullable|string',
                'vision' => 'nullable|string',
                // Add other basic fields as needed
            ]);

            $data = $request->except(['chancellor_photo', 'vice_chancellor_photo', 'academic_images', 'programs_images', 'partnerships_images', 'life_images', 'sports_images', 'upcoming_images', 'campus_images']);
            $data['institute_id'] = $institute->id;

            // Sanitize long-form fields
            $richTextFields = ['institute_overview', 'mission', 'vision', 'accreditations', 'facilities', 'chancellor_bio', 'vice_chancellor_bio'];
            foreach ($richTextFields as $field) {
                if ($request->has($field)) {
                    $data[$field] = Purifier::clean($request->input($field));
                }
            }


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

            return $this->success($about, 'About section created successfully');
        });
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
            return $this->error('Unauthorized', 403);
        }

        return DB::transaction(function () use ($request, $about) {
            $data = $request->except(['removed_academic_images', 'removed_programs_images', 'removed_partnerships_images', 'removed_life_images', 'removed_sports_images', 'removed_upcoming_images', 'removed_campus_images', 'chancellor_photo', 'vice_chancellor_photo', 'academic_images', 'programs_images', 'partnerships_images', 'life_images', 'sports_images', 'upcoming_images', 'campus_images']);
            $data['institute_id'] = $about->institute_id; // Fix mass assignment vulnerability

            // Sanitize long-form fields
            $richTextFields = ['institute_overview', 'mission', 'vision', 'accreditations', 'facilities', 'chancellor_bio', 'vice_chancellor_bio'];
            foreach ($richTextFields as $field) {
                if ($request->has($field)) {
                    $data[$field] = Purifier::clean($request->input($field));
                }
            }


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

            return $this->success($about, 'About section updated successfully');
        });
    }


    public function apiDestroyAbout($id)
    {
        $institute = is_numeric($id) ? Institute::findOrFail($id) : Institute::where('slug', $id)->firstOrFail();
        $id = $institute->id;
        $about = \App\Models\AboutSection::where('institute_id', $id)->firstOrFail();

        // Authorization check
        $user = Auth::user();
        if (!$user || $user->role !== 'Institute' || !$user->institute || $user->institute->id != $institute->id) {
            return $this->error('Unauthorized', 403);
        }

        return DB::transaction(function () use ($about) {
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

            return $this->success(null, 'About info deleted successfully');
        });
    }



    // ==========================================
    // API METHODS FOR ADMIN DASHBOARD
    // ==========================================

    public function apiAdminIndex()
    {
        $institutes = Institute::withAvg('ratings', 'rating')
            ->withCount('ratings')
            ->orderBy('created_at', 'desc')
            ->paginate(50);
        return $this->successResponse($institutes);
    }


    public function apiApprove($id)
    {
        return DB::transaction(function () use ($id) {
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

            // Create Internal Notification for the Institute
            Notification::create([
                'institute_id' => $institute->id,
                'type' => 'system',
                'title' => 'Profile Approved!',
                'message' => 'Your institute profile has been approved! You can now post courses and events.',
            ]);

            AdminActivityLogger::log(
                'Approved',
                'Institute',
                $institute->id,
                auth()->user()->name . " approved institute \"{$institute->institute_name}\" via API"
            );

            return $this->success(null, 'Institute approved successfully');
        });
    }


    public function apiUnapprove($id)
    {
        return DB::transaction(function () use ($id) {
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

            // Create Internal Notification for the Institute
            Notification::create([
                'institute_id' => $institute->id,
                'type' => 'system',
                'title' => 'Status Updated',
                'message' => 'Your institute status has been updated to pending/unapproved. Please contact admin for details.',
            ]);

            AdminActivityLogger::log(
                'Unapproved',
                'Institute',
                $institute->id,
                auth()->user()->name . " unapproved institute \"{$institute->institute_name}\""
            );

            return $this->success(null, 'Institute unapproved successfully');
        });
    }


    public function apiTogglePremium(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $institute = Institute::findOrFail($id);

            $institute->is_premium = !$institute->is_premium;

            if ($institute->is_premium) {
                if ($request->has('expires_at')) {
                    $institute->premium_expires_at = $request->expires_at;
                } else {
                    $institute->premium_expires_at = now()->addYear();
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

            return $this->success(['is_premium' => $institute->is_premium], 'Premium status updated successfully');
        });
    }


    public function apiAdminUpdate(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
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

            // Sanitize bio
            if (isset($validatedData['bio'])) {
                $validatedData['bio'] = Purifier::clean($validatedData['bio']);
            }

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

            return $this->success($institute->fresh(), 'Institute updated successfully');
        });
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
            return $this->success(['status' => 'ignored_own_profile']);
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
            return $this->success(['status' => 'success']);

        } catch (\Illuminate\Database\QueryException $e) {
            // Error code 23000 is for unique constraint violations in MySQL
            if ($e->getCode() == '23000') {
                return $this->success(null, 'Already viewed');
            }

            Log::error("Failed to track profile view: " . $e->getMessage());
            return $this->error($e->getMessage(), 500);
        } catch (\Exception $e) {
            Log::error("General error in track profile view: " . $e->getMessage());
            return $this->error($e->getMessage(), 500);
        }
    }

    public function getPartners()
    {
        $partners = Institute::whereNotNull('logo')
            ->where('status', 'approved')
            ->select('id', 'institute_name', 'logo', 'slug')
            ->get();
            
        return $this->successResponse($partners);
    }

}
