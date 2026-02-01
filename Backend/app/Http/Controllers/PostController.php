<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Models\PostView;
use App\Models\Category;
use App\Models\Institute;
use App\Models\Notification;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Pagination\LengthAwarePaginator;
use App\Models\ApplyCase;

class PostController extends Controller
{

    public function store(Request $request, $id)
    {
        // ... (existing store code for Blade)
        // Note: keeping existing store for Blade compatibility
    }

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

            $institute = Institute::findOrFail($id);
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



    // public function showProfile($id)
    // {
    //     $institute = Institute::findOrFail($id);
    //     return view('frontend.profile.institute-edit', compact('institute'));
    // }

    // public function showFeed()
    // {
    //     $posts = Post::with('institute')->latest()->paginate(3); // Loads first 6 posts
    //     return view('frontend.feed.feed', compact('posts'));
    // }

    public function loadMore(Request $request)
    {
        $page = $request->input('page', 1);

        $posts = Post::with('institute')
            ->orderBy('created_at', 'desc')
            ->paginate(3, ['*'], 'page', $page);

        return response()->json([
            'html' => view('frontend.feed.post_partial', compact('posts'))->render(),
            'next_page' => $posts->currentPage() + 1,
            'has_more' => $posts->hasMorePages(),
        ]);
    }



    public function showPostsProfile()
    {
        $posts = Post::with('institute')->latest()->get();
        foreach ($posts as $post) {
            Log::info($post->institute); // Log institute data for debugging
        }

        return view('frontend.profile.institute-edit', compact('posts'));
    }



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

            return response()->json([
                'success' => true,
                'message' => 'Post updated successfully!',
                'post' => $post
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return response()->json(['message' => 'Validation failed', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            return response()->json(['message' => 'An error occurred', 'error' => $e->getMessage()], 500);
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

            $post->delete();

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
    public function adminPost()
    {
        // Redirect to login if not logged in
        if (!auth()->check()) {
            return redirect()->route('login');
        }

        if (auth()->user()->role !== 'Admin') {
            abort(403, 'Unauthorized access');
        }
        $posts = Post::all();
        return view('admin.posts', compact('posts'));
    }


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
        }

        // Return the updated like count and liked status
        return response()->json([
            'status' => 'success',
            'likes_count' => $post->likes_count,
            'liked' => $liked
        ]);
    }

    public function filter($filterType, $filterValue)
    {
        $query = Post::query()
            ->with('institute') // eager load relation
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

        // Map filterType to the corresponding column in the database
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
                // Use LIKE to match posts with multiple locations
                $query->where('posts.location', 'LIKE', "%{$filterValue}%");
            } else {
                $query->where("posts." . $filterMap[$filterType], $filterValue);
            }
        }

        // Apply priority-based sorting
        $posts = $query->orderByDesc('priority')
            ->orderByDesc('posts.created_at')
            ->get();

        return view('frontend.courses.categories', compact('posts', 'filterType', 'filterValue'));
    }

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
        $user = auth()->user();

        // Skip increment if the user is an institute AND owns the post
        if ($user && $user->role === 'Institute') {
            // Assuming Post model has institute_id and User has institute id relation
            // Adjust this if your relationship is different
            if ($post->institute_id === $user->institute->id) {
                // Don't count own post views
                return response()->json(['status' => 'ignored_own_post']);
            }
        }

        if ($user) {
            $alreadyViewed = PostView::where('user_id', $user->id)
                ->where('post_id', $post->id)
                ->exists();

            if (!$alreadyViewed) {
                $post->increment('view_count');
                PostView::create([
                    'user_id' => $user->id,
                    'post_id' => $post->id,
                    'viewed_at' => now(),
                ]);
            }
        } else {
            $viewedPosts = session()->get('viewed_posts', []);
            if (!in_array($post->id, $viewedPosts)) {
                $post->increment('view_count');
                $viewedPosts[] = $post->id;
                session()->put('viewed_posts', $viewedPosts);
            }
        }

        return response()->json(['status' => 'success']);
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

    // Submit Course Application
    // Submit Course Application
    public function apiApply(Request $request, $instituteId)
    {
        Log::info("Entering apiApply for institute: " . $instituteId);

        $request->validate([
            'post_id' => 'required|exists:posts,id',
            'course_title' => 'required|string',
            'name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'required|string',
            'message' => 'required|string',
            'privacy_consent' => 'accepted'
        ]);

        try {
            // Log the full application details (since ApplyCase currently stores limited info)
            Log::info("New Course Application: ", $request->all());

            ApplyCase::create([
                'user_id' => auth()->id(),
                'institute_id' => $instituteId,
                'post_id' => $request->post_id,
                'course_title' => $request->course_title,
                'applied_at' => now(),
            ]);

            // Send Email to Institute
            $institute = Institute::findOrFail($instituteId);
            $emailData = [
                'course_title' => $request->course_title,
                'name' => $request->name,
                'email' => $request->email,
                'phone' => $request->phone,
                'message' => $request->message,
            ];

            Mail::send('emails.course_application', ['data' => $emailData], function ($message) use ($institute, $request) {
                $message->to($institute->email)
                    ->subject('New Course Application: ' . $request->course_title)
                    ->from($request->email, $request->name);
            });

            return response()->json(['message' => 'Application submitted successfully']);
        } catch (\Exception $e) {
            Log::error("Application Submission Error: " . $e->getMessage());
            return response()->json(['message' => 'Failed to submit application: ' . $e->getMessage()], 500);
        }
    }

    // Get paginated posts API
    public function apiIndex()
    {
        $user = auth()->user();
        $posts = Post::with(['institute', 'likes'])
            ->where('status', 'active')
            ->latest()
            ->paginate(10);

        // Apply user-specific liked and saved status
        $userId = $user ? $user->id : null;
        $posts->through(function ($post) use ($userId, $user) {
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

        return response()->json(['success' => true, 'message' => 'Post status updated', 'status' => $post->status]);
    }
}
