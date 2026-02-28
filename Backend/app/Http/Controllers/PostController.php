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

class PostController extends Controller
{

    // store (blade) removed


    public function apiStore(Request $request, $id)
    {
        try {
            // Validate the incoming data
            $request->validate([
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

            $institute = is_numeric($id) ? Institute::findOrFail($id) : Institute::where('slug', $id)->firstOrFail();
            $id = $institute->id; // Ensure numeric ID for subsequent comparisons
            $user = Auth::user();

            // Check if user belongs to this institute
            if ($user->role !== 'Institute' || !$user->institute || $user->institute->id != $id) {
                return response()->json([
                    'message' => 'Unauthorized: You do not have permission to post for this institute.',
                    'debug_info' => [
                        'user_role' => $user->role,
                        'has_institute' => !!$user->institute,
                        'user_institute_id' => $user->institute?->id,
                        'request_id' => $id
                    ]
                ], 403);
            }

            // Handle image upload
            $imagePath = null;
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('post_images', 'public');
            }

            // Convert array of locations to comma-separated string
            $locations = implode(', ', $request->location);

            // Create a new post
            $post = Post::create([
                'title' => $request->title,
                'description' => $request->description,
                'small_description' => $request->small_description,
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
            foreach ($admins as $admin) {
                AdminNotification::create([
                    'user_id' => $admin->id,
                    'type' => 'post_new',
                    'title' => 'New Post Created',
                    'message' => "{$institute->institute_name} has created a new post: {$post->title}",
                    'data' => [
                        'post_id' => $post->id,
                        'institute_id' => $institute->id
                    ]
                ]);
            }

            InstituteActivityLogger::log(
                'Post Created',
                "Created a new post: \"{$post->title}\"",
                'Content',
                'Post',
                $post->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Post created successfully!',
                'post' => $post
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


    // showPostsProfile removed

    public function edit($id)
    {
        $post = Post::findOrFail($id);

        // Return the post data as JSON
        return response()->json($post);
    }




    public function apiUpdate(Request $request, $id)
    {
        try {
            $post = Post::findOrFail($id);
            $user = Auth::user();

            // Check if user belongs to this institute
            if ($user->role !== 'Institute' || !$user->institute || $user->institute->id != $post->institute_id) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $request->validate([
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

            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('post_images', 'public');
                $post->image = $imagePath;
            }

            // Convert array of locations to comma-separated string
            $locations = implode(', ', $request->location);

            $post->update([
                'title' => $request->title,
                'description' => $request->description,
                'small_description' => $request->small_description,
                'course_name' => $request->course_name,
                'course_type' => $request->course_type,
                'location' => $locations,
                'duration' => $request->duration,
                'course_format' => $request->course_format,
                'attendance_type' => $request->attendance_type,
            ]);

            InstituteActivityLogger::log(
                'Post Updated',
                "Updated post: \"{$post->title}\"",
                'Content',
                'Post',
                $post->id
            );

            return response()->json([
                'success' => true,
                'message' => 'Post updated successfully!',
                'post' => $post
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
        }
    }

    public function apiDestroy($id)
    {
        try {
            $post = Post::findOrFail($id);
            $user = Auth::user();

            // Check if user belongs to this institute OR is Admin
            if ($user->role !== 'Admin' && ($user->role !== 'Institute' || !$user->institute || $user->institute->id != $post->institute_id)) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }

            $postTitle = $post->title;
            $postId = $post->id;
            $post->delete();

            InstituteActivityLogger::log(
                'Post Deleted',
                "Deleted post: \"{$postTitle}\"",
                'Content',
                'Post',
                $postId
            );

            return response()->json([
                'success' => true,
                'message' => 'Post deleted successfully!'
            ]);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete post: ' . $e->getMessage()
            ], 500);
        }
    }



    //admin post
    // adminPost removed



    //like function
    public function toggleLike($postId)
    {
        $post = Post::findOrFail($postId);
        $userId = auth()->id(); // Get the logged-in user's ID

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
        return response()->json([
            'status' => 'success',
            'likes_count' => $post->likes_count,
            'liked' => $liked
        ]);
    }

    // filter removed


    public function apiFilter($filterType, $filterValue)
    {
        $query = Post::query()
            ->with('institute')
            ->select('posts.*')
            ->addSelect(DB::raw("
            (
                CASE
                    WHEN institutes.is_premium = 1
                        AND posts.created_at >= NOW() - INTERVAL 10 DAY
                    THEN 2
                    ELSE 0
                END
                + institutes.followers_count * 0.01
            ) as priority
        "))
            ->join('institutes', 'institutes.id', '=', 'posts.institute_id');

        $filterMap = [
            'Courses' => 'course_name',
            'Course Type' => 'course_type',
            'Location' => 'location',
            'Duration' => 'duration',
            'Course Format' => 'course_format',
            'Attendance Type' => 'attendance_type',
        ];

        if (array_key_exists($filterType, $filterMap)) {
            if ($filterType === 'Location') {
                $query->where('posts.location', 'LIKE', "%{$filterValue}%");
            } else {
                $query->where("posts." . $filterMap[$filterType], $filterValue);
            }
        }

        $posts = $query->orderByDesc('priority')
            ->orderByDesc('posts.created_at')
            ->get();

        return response()->json([
            'posts' => $posts,
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
            return response()->json(['status' => 'ignored_own_post']);
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

            return response()->json(['status' => 'success']);
        } catch (\Illuminate\Database\QueryException $e) {
            // Error code 23000 is for unique constraint violations in MySQL
            if ($e->getCode() == '23000') {
                return response()->json(['status' => 'already_viewed']);
            }
            Log::error("Failed to track post view: " . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
        } catch (\Exception $e) {
            Log::error("General error in track post view: " . $e->getMessage());
            return response()->json(['status' => 'error', 'message' => $e->getMessage()], 500);
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
    public function apiToggleSave($postId)
    {
        $post = Post::findOrFail($postId);
        /** @var \App\Models\User $user */
        $user = auth()->user();

        if ($user->role !== 'User') {
            return response()->json(['message' => 'Only students can save posts'], 403);
        }

        $result = $user->savedPosts()->toggle($postId);
        $isSaved = count($result['attached']) > 0;

        return response()->json([
            'status' => 'success',
            'saved' => $isSaved,
            'is_saved_by_user' => $isSaved // For consistency
        ]);
    }

    // Get all Saved Posts for the authenticated user
    public function getSavedPosts()
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        if ($user->role !== 'User') {
            return response()->json(['posts' => []]);
        }

        $posts = $user->savedPosts()
            ->with(['institute', 'likes'])
            ->latest('saved_posts.created_at')
            ->paginate(10);

        return response()->json([
            'posts' => $posts
        ]);
    }



    // Get paginated posts API
    public function apiIndex()
    {
        $user = auth()->user();
        /** @var \Illuminate\Pagination\LengthAwarePaginator $posts */
        $posts = Post::with(['institute', 'likes'])
            ->where('status', 'active')
            ->latest()
            ->paginate(10);

        // Apply user-specific liked and saved status
        $userId = $user ? $user->id : null;
        /** @var \App\Models\User $user */
        $posts->getCollection()->transform(function ($post) use ($userId, $user) {
            $post->is_liked_by_user = $user ? $post->likes()->where('user_id', $user->id)->exists() : false;
            $post->is_saved_by_user = ($user && $user->role === 'User') ? $user->savedPosts()->where('post_id', $post->id)->exists() : false;
            return $post;
        });

        return response()->json($posts);
    }

    // ==========================================
    // API METHODS FOR ADMIN DASHBOARD
    // ==========================================

    public function apiAdminIndex()
    {
        $posts = Post::with('institute')->withCount('likes')->latest()->get();
        return response()->json($posts);
    }

    public function apiToggleStatus($id)
    {
        $post = Post::findOrFail($id);
        $post->status = $post->status === 'active' ? 'inactive' : 'active';
        $post->save();

        AdminActivityLogger::log(
            'Updated Post Status',
            'Post',
            $post->id,
            auth()->user()->name . " changed status of post \"{$post->title}\" to {$post->status}"
        );

        return response()->json(['success' => true, 'message' => 'Post status updated', 'status' => $post->status]);
    }

    public function showByShareLink($share_link)
    {
        try {
            $post = Post::where('share_link', $share_link)->with('institute')->firstOrFail();
            return response()->json($post);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Post not found'], 404);
        }
    }
}
