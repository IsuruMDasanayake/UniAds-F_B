<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\PostView;
use App\Models\Category;
use App\Models\Institute;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Services\AdminActivityLogger;
use Illuminate\Support\Facades\Mail;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Models\ApplyCase;
use App\Models\Notification;
use App\Models\AdminNotification;
use App\Services\InstituteActivityLogger;
use Illuminate\Support\Facades\Storage;
use Mews\Purifier\Facades\Purifier;
use App\Services\ImageOptimiser;

class PostController extends Controller
{

    // store (blade) removed


    public function apiStore(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            try {
                // Validate the incoming data
                $validator = Validator::make($request->all(), [
                    'title' => 'required|string|max:255',
                    'description' => 'required|string',
                    'small_description' => 'required|string|max:200',
                    'course_name' => 'required|string',
                    'course_type' => 'required|string',
                    'location' => 'required|array',
                    'location.*' => 'string',
                    'duration' => 'required|string',
                    'course_format' => 'required|string',
                    'attendance_type' => 'required|string',
                    'image' => 'required|image|max:2048',
                ]);

                if ($validator->fails()) {
                    return $this->validationError($validator->errors());
                }

                $institute = is_numeric($id) ? Institute::findOrFail($id) : Institute::where('slug', $id)->firstOrFail();
                $id = $institute->id;
                $user = Auth::user();

                // Check if user belongs to this institute
                if ($user->role !== 'Institute' || !$user->institute || $user->institute->id != $id) {
                    return $this->error('Unauthorized: You do not have permission to post for this institute.', 403);
                }

                // Handle image upload with Optimization
                $imagePath = null;
                if ($request->hasFile('image')) {
                    $imagePath = ImageOptimiser::store($request->file('image'), 'post_images');
                }

                // Convert array of locations to comma-separated string
                $locations = implode(', ', $request->location);

                // Robust Sanitization using HTML Purifier
                $sanitizedDescription = Purifier::clean($request->description);
                $sanitizedSmallDescription = Purifier::clean($request->small_description);

                // Create a new post
                $post = Post::create([
                    'title' => $request->title,
                    'description' => $sanitizedDescription,
                    'small_description' => $sanitizedSmallDescription,
                    'course_name' => $request->course_name,
                    'course_type' => $request->course_type,
                    'location' => $locations,
                    'duration' => $request->duration,
                    'course_format' => $request->course_format,
                    'attendance_type' => $request->attendance_type,
                    'image' => $imagePath,
                    'institute_id' => $institute->id,
                    'status' => 'active'
                ]);

                // Notify Admins
                $admins = User::where('role', 'Admin')->get();
                if ($admins->count() > 0) {
                    $notifications = $admins->map(fn($admin) => [
                        'user_id' => $admin->id,
                        'type' => 'post_new',
                        'title' => 'New Post Created',
                        'message' => "{$institute->institute_name} has created a new post: {$post->title}",
                        'data' => json_encode([
                            'post_id' => $post->id,
                            'institute_id' => $institute->id
                        ]),
                        'is_read' => false,
                        'created_at' => now(),
                        'updated_at' => now()
                    ])->toArray();
                    
                    AdminNotification::insert($notifications);
                }

                InstituteActivityLogger::log(
                    'Post Created',
                    "Created a new post: \"{$post->title}\"",
                    'Content',
                    'Post',
                    $post->id
                );

                return $this->success($post, 'Post created successfully!', 201);
            } catch (\Exception $e) {
                return $this->error('An error occurred during post creation.', 500, $e->getMessage());
            }
        });
    }


    // showPostsProfile removed

    public function edit($id)
    {
        $post = Post::findOrFail($id);

        // Return the post data as JSON
        return $this->successResponse($post);
    }




    public function apiUpdate(Request $request, $id)
    {
        try {
            $post = Post::findOrFail($id);

            // Authentication check
            $user = Auth::user();
            if ($user->role !== 'Institute' || !$user->institute || $user->institute->id != $post->institute_id) {
                return $this->error('Unauthorized: You do not have permission to update this post.', 403);
            }

            // Validation
            $validator = Validator::make($request->all(), [
                'title' => 'required|string|max:255',
                'description' => 'required|string',
                'small_description' => 'required|string|max:200',
                'course_name' => 'required|string',
                'course_type' => 'required|string',
                'location' => 'required|array',
                'location.*' => 'string',
                'duration' => 'required|string',
                'course_format' => 'required|string',
                'attendance_type' => 'required|string',
                'image' => 'nullable|image|max:2048',
            ]);

            if ($validator->fails()) {
                return $this->validationError($validator->errors());
            }

            // Update with Image Optimization
            if ($request->hasFile('image')) {
                // Delete old image if exists
                if ($post->image) {
                    Storage::disk('public')->delete($post->image);
                }
                $post->image = ImageOptimiser::store($request->file('image'), 'post_images');
            }

            // Robust Sanitization using HTML Purifier
            $sanitizedDescription = Purifier::clean($request->description);
            $sanitizedSmallDescription = Purifier::clean($request->small_description);

            $post->update([
                'title' => $request->title,
                'description' => $sanitizedDescription,
                'small_description' => $sanitizedSmallDescription,
                'course_name' => $request->course_name,
                'course_type' => $request->course_type,
                'location' => implode(', ', $request->location),
                'duration' => $request->duration,
                'course_format' => $request->course_format,
                'attendance_type' => $request->attendance_type,
            ]);

            return $this->success($post, 'Post updated successfully!');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 500);
        }
    }


    public function apiDestroy($id)
    {
        return DB::transaction(function () use ($id) {
            try {
                $post = Post::findOrFail($id);
                $user = Auth::user();

                // Check if user belongs to this institute OR is Admin
                if ($user->role !== 'Admin' && ($user->role !== 'Institute' || !$user->institute || $user->institute->id != $post->institute_id)) {
                    return $this->error('Unauthorized', 403);
                }

                $postTitle = $post->title;
                $postId = $post->id;

                // Storage Cleanup: Delete associated image file
                if ($post->image) {
                    Storage::disk('public')->delete($post->image);
                }

                $post->delete();

                InstituteActivityLogger::log(
                    'Post Deleted',
                    "Deleted post: \"{$postTitle}\"",
                    'Content',
                    'Post',
                    $postId
                );

                return $this->success(null, 'Post deleted successfully!');
            } catch (\Exception $e) {
                return $this->error('Failed to delete post: ' . $e->getMessage(), 500);
            }
        });
    }




    //admin post
    // adminPost removed



    //like function
    public function toggleLike($postId)
    {
        $post = Post::findOrFail($postId);
        $userId = auth()->id(); // Get the logged-in user's ID

        return DB::transaction(function () use ($post, $userId) {
            // Check if the user has already liked the post
            $likedPost = $post->likes()->where('user_id', $userId)->first();

            if ($likedPost) {
                // If the user has liked the post, remove the like (decrease the like count)
                $likedPost->delete();
                $post->decrement('likes_count');
                $liked = false;
            } else {
                // If the user hasn't liked yet, add the like (increase the like count)
                $post->likes()->create(['user_id' => $userId]);
                $post->increment('likes_count');
                $liked = true;

                // Trigger Notification
                Notification::create([
                    'institute_id' => $post->institute_id,
                    'user_id' => $userId,
                    'type' => 'post_like',
                    'title' => 'New Like on Post',
                    'message' => auth()->user()->name . ' liked your post: ' . $post->title,
                    'data' => [
                        'post_id' => $post->id,
                        'post_title' => $post->title,
                        'image' => $post->image
                    ]
                ]);
            }

            // Return the updated like count and liked status
            return $this->success([
                'likes_count' => $post->likes_count,
                'is_liked_by_user' => $liked
            ], 'Status toggled');
        });
    }

    // filter removed


    public function apiFilter(Request $request, $filterType, $filterValue)
    {
        $page = $request->get('page', 1);
        $search = $request->get('search', '');
        $activeFilters = $request->get('filters', []); // e.g. ?filters[Location][]=Colombo
        
        $user = Auth::guard('sanctum')->user();
        $userId = $user ? $user->id : null;
        
        // Use a global cache key devoid of user-specific elements
        $cacheKey = 'api_filter_v1_' . md5(json_encode([
            $filterType, $filterValue, $page, $search, $activeFilters
        ]));

        $postsData = \Illuminate\Support\Facades\Cache::remember($cacheKey, 300, function () use ($filterType, $filterValue, $search, $activeFilters) {
            $query = Post::query()
                ->join('institutes', 'institutes.id', '=', 'posts.institute_id')
                ->select('posts.*')
                ->with(['institute', 'likes']) // We keep likes for global count if needed
                ->where('posts.status', 'active')
                ->where('posts.created_at', '>=', now()->subDays(365));

            $filterMap = [
                'Courses' => 'course_name',
                'Course Type' => 'course_type',
                'Location' => 'location',
                'Duration' => 'duration',
                'Course Format' => 'course_format',
                'Attendance Type' => 'attendance_type',
            ];

            // Primary Route Category Filter
            if (array_key_exists($filterType, $filterMap)) {
                if ($filterType === 'Location') {
                    $query->where('posts.location', 'LIKE', "%{$filterValue}%");
                } else {
                    $query->where("posts." . $filterMap[$filterType], $filterValue);
                }
            }

            // Secondary Search Query
            if (!empty($search)) {
                $scoutIds = \App\Models\Post::search($search)->take(1000)->keys();
                if ($scoutIds->isEmpty()) {
                    $query->whereRaw('1 = 0');
                } else {
                    $query->whereIn('posts.id', $scoutIds);
                }
            }

            // Secondary Checkbox Filters
            if (!empty($activeFilters) && is_array($activeFilters)) {
                foreach ($activeFilters as $category => $values) {
                    if (array_key_exists($category, $filterMap) && !empty($values) && is_array($values)) {
                        $column = 'posts.' . $filterMap[$category];
                        if ($filterMap[$category] === 'location') {
                            $query->where(function($q) use ($column, $values) {
                                foreach ($values as $val) {
                                    $q->orWhere($column, 'LIKE', "%{$val}%");
                                }
                            });
                        } else {
                            $query->whereIn($column, $values);
                        }
                    }
                }
            }

            return $query->orderByDesc('posts.score_cache')
                ->paginate(100);
        });

        // Inject user-specific boolean flags (likes/saves) dynamically outside of the cache
        if ($userId && $postsData->count() > 0) {
            $postIds = collect($postsData->items())->pluck('id');
            
            $likedPostIds = \App\Models\PostLike::where('user_id', $userId)
                                ->whereIn('post_id', $postIds)
                                ->pluck('post_id')
                                ->toArray();
                                
            $savedPostIds = \App\Models\SavedPost::where('student_id', $userId)
                                ->whereIn('post_id', $postIds)
                                ->pluck('post_id')
                                ->toArray();

            $postsData->getCollection()->transform(function($post) use ($likedPostIds, $savedPostIds) {
                $post->is_liked_by_user = in_array($post->id, $likedPostIds);
                $post->is_saved_by_user = in_array($post->id, $savedPostIds);
                return $post;
            });
        } else {
            $postsData->getCollection()->transform(function($post) {
                $post->is_liked_by_user = false;
                $post->is_saved_by_user = false;
                return $post;
            });
        }

        return $this->successResponse([
            'posts' => $postsData,
            'filterType' => $filterType,
            'filterValue' => $filterValue
        ]);
    }




    // Track Post Views
    public function trackView(Request $request, $id)
    {
        $post = Post::findOrFail($id);
        // Use sanctum guard explicitly to identify user even on public route
        $user = Auth::guard('sanctum')->user();
        $ip = $request->ip();
        $today = now()->toDateString();

        // Skip increment if the user is an institute AND owns the post
        if ($user && $user->role === 'Institute' && $user->institute && $post->institute_id === $user->institute->id) {
            return $this->success(null, 'Ignored own post view');
        }

        // Generate a unique key for the database to enforce daily uniqueness
        // Pattern: P:{post_id}:{U/G}:{id/ip}:{date}
        $uniqueKey = $user
            ? "P:{$post->id}:U:{$user->id}:{$today}"
            : "P:{$post->id}:G:{$ip}:{$today}";

        try {
            DB::transaction(function () use ($post, $user, $ip, $uniqueKey) {
                // Attempt to create the view record. 
                // DB unique constraint on unique_key will prevent duplicates.
                PostView::create([
                    'user_id' => $user ? $user->id : null,
                    'post_id' => $post->id,
                    'viewed_at' => now(),
                    'ip_address' => $ip,
                    'unique_key' => $uniqueKey
                ]);

                // If create succeeds, increment the main counter
                $post->increment('view_count');
            });

            return $this->success(null, 'View tracked');
        } catch (\Illuminate\Database\QueryException $e) {
            // Error code 23000 is for unique constraint violations in MySQL
            if ($e->getCode() == '23000') {
                return $this->success(null, 'Already viewed');
            }
            Log::error("Failed to track post view: " . $e->getMessage());
            return $this->error($e->getMessage(), 500);
        } catch (\Exception $e) {
            Log::error("General error in track post view: " . $e->getMessage());
            return $this->error($e->getMessage(), 500);
        }
    }




    //  // Recent Posts (Latest First)
    //  public function getRecentPosts()
    //  {
    //      $posts = Post::with('institute')->latest()->get();
    //      return response()->json($posts);
    //  }

    //  // Popular Posts (Most Liked First)
    //  public function getPopularPosts()
    //  {
    //      $posts = Post::with('institute')->orderBy('likes_count', 'desc')->get();
    //      return response()->json($posts);
    //  }

    //  // Most Viewed Posts (Most Viewed First)
    //  public function getMostViewedPosts()
    //  {
    //      $posts = Post::with('institute')->orderBy('views_count', 'desc')->get();
    //      return response()->json($posts);
    //  }

    //  // General Filter Function
    //  public function feedfilter($filterType)
    //  {
    //      switch ($filterType) {
    //          case 'recent':
    //              return $this->getRecentPosts();
    //          case 'popular':
    //              return $this->getPopularPosts();
    //          case 'most-viewed':
    //              return $this->getMostViewedPosts();
    //          default:
    //              return response()->json(['error' => 'Invalid filter type'], 400);
    //      }
    //  }










    // Toggle Save Post
    public function apiToggleSave($id)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        $result = $user->savedPosts()->toggle($id);
        $isSaved = count($result['attached']) > 0;

        return $this->success([
            'is_saved_by_user' => $isSaved
        ], 'Post saved status toggled');
    }

    // Get all Saved Posts for the authenticated user
    public function getSavedPosts()
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        if ($user->role !== 'User') {
            return $this->success(['posts' => []]);
        }

        $posts = $user->savedPosts()
            ->with(['institute', 'likes'])
            ->withExists(['likes as is_liked_by_user' => function($q) use ($user) {
                $q->where('user_id', $user->id);
            }])
            ->latest('saved_posts.created_at')
            ->paginate(10);

        // Map is_saved_by_user for consistency, though inherently true here
        $posts->getCollection()->transform(function($post) {
            $post->is_saved_by_user = true;
            return $post;
        });

        return $this->successResponse([
            'posts' => $posts
        ]);
    }



    // Get paginated posts API
    public function apiIndex()
    {
        $user = auth()->user();
        $userId = $user ? $user->id : null;

        /** @var \Illuminate\Pagination\LengthAwarePaginator $posts */
        $posts = Post::with(['institute', 'likes'])
            ->withExists(['likes as is_liked_by_user' => function($q) use ($userId) {
                $q->where('user_id', $userId);
            }])
            ->withExists(['savedBy as is_saved_by_user' => function($q) use ($user, $userId) {
                $q->where('student_id', $userId);
            }])
            ->where('status', 'active')
            ->latest()
            ->paginate(10);

        return $this->success($posts);
    }


    // ==========================================
    // API METHODS FOR ADMIN DASHBOARD
    // ==========================================

    public function apiAdminIndex()
    {
        $posts = Post::with('institute')->withCount('likes')->latest()->get();
        return $this->success($posts);
    }


    public function apiToggleStatus($id)
    {
        return DB::transaction(function () use ($id) {
            $post = Post::findOrFail($id);
            $post->status = $post->status === 'active' ? 'inactive' : 'active';
            $post->save();

            AdminActivityLogger::log(
                'Updated Post Status',
                'Post',
                $post->id,
                auth()->user()->name . " changed status of post \"{$post->title}\" to {$post->status}"
            );

            return $this->success(['status' => $post->status], 'Post status updated');
        });
    }


    public function showByShareLink($share_link)
    {
        try {
            $post = Post::where('share_link', $share_link)->with('institute')->firstOrFail();
            return $this->success($post);

        } catch (\Exception $e) {
            // Return 200 to prevent loud browser console network errors
            return $this->success(null, 'Post not found');
        }
    }

}
