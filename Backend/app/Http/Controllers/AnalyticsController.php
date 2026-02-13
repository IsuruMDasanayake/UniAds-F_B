<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Institute;
use App\Models\Rating;
use App\Models\Post;
use App\Models\PostView;
use App\Models\EventView;
use App\Models\ApplyCase;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use App\Models\Follower;
use App\Models\Event;
use App\Models\Like;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use App\Models\Category;
use App\Models\Subscription;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;


class AnalyticsController extends Controller
{
    public function apiOverview(Request $request)
    {
        $user = auth()->user();
        $institute = $user->institute;

        if (!$institute) {
            return response()->json(['error' => 'Institute profile not found'], 404);
        }

        // Get period parameter (default 30 days)
        $period = (int) $request->query('period', 30);

        // Define date ranges
        $currentStart = Carbon::now()->subDays($period)->startOfDay();
        $currentEnd = Carbon::now()->endOfDay();
        $previousStart = Carbon::now()->subDays($period * 2)->startOfDay();
        $previousEnd = Carbon::now()->subDays($period)->endOfDay();

        // Helper function to calculate growth percentage
        $calculateGrowth = function ($current, $previous) {
            if ($previous == 0) {
                return $current > 0 ? 100 : 0;
            }
            return round((($current - $previous) / $previous) * 100, 1);
        };

        // 1. PROFILE VIEWS (using institute profile_views - total count)
        $currentProfileViews = $institute->profile_views ?? 0;
        // Note: Without historical tracking, we'll use 0 for previous
        $previousProfileViews = 0;
        $profileViewsChange = 0; // Cannot calculate without historical data

        // 2. POST VIEWS (from PostView table with date filtering)
        $currentPostViews = PostView::join('posts', 'post_views.post_id', '=', 'posts.id')
            ->where('posts.institute_id', $institute->id)
            ->whereBetween('post_views.viewed_at', [$currentStart, $currentEnd])
            ->count();

        $previousPostViews = PostView::join('posts', 'post_views.post_id', '=', 'posts.id')
            ->where('posts.institute_id', $institute->id)
            ->whereBetween('post_views.viewed_at', [$previousStart, $previousEnd])
            ->count();

        $postViewsChange = $calculateGrowth($currentPostViews, $previousPostViews);

        // 3. EVENT VIEWS (from EventView table with date filtering)
        $currentEventViews = EventView::join('events', 'event_views.event_id', '=', 'events.id')
            ->where('events.institute_id', $institute->id)
            ->whereBetween('event_views.viewed_at', [$currentStart, $currentEnd])
            ->count();

        $previousEventViews = EventView::join('events', 'event_views.event_id', '=', 'events.id')
            ->where('events.institute_id', $institute->id)
            ->whereBetween('event_views.viewed_at', [$previousStart, $previousEnd])
            ->count();

        $eventViewsChange = $calculateGrowth($currentEventViews, $previousEventViews);

        // 4. FOLLOWERS
        $currentFollowers = Follower::where('institute_id', $institute->id)
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->count();

        $previousFollowers = Follower::where('institute_id', $institute->id)
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->count();

        $followersChange = $calculateGrowth($currentFollowers, $previousFollowers);
        $totalFollowers = Follower::where('institute_id', $institute->id)->count();

        // 5. COURSE APPLICATIONS
        $currentApplications = ApplyCase::where('institute_id', $institute->id)
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->count();

        $previousApplications = ApplyCase::where('institute_id', $institute->id)
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->count();

        $applicationsChange = $calculateGrowth($currentApplications, $previousApplications);
        $totalApplications = ApplyCase::where('institute_id', $institute->id)->count();

        // 6. REVIEWS
        $totalReviews = Rating::where('institute_id', $institute->id)
            ->whereNotNull('comment')
            ->where('comment', '!=', '')
            ->count();

        // 7. AVERAGE RATING
        $currentRating = Rating::where('institute_id', $institute->id)
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->avg('rating');

        $previousRating = Rating::where('institute_id', $institute->id)
            ->whereBetween('created_at', [$previousStart, $previousEnd])
            ->avg('rating');

        $averageRating = Rating::where('institute_id', $institute->id)->avg('rating');
        $averageRating = $averageRating ? round($averageRating, 1) : 0;
        $ratingChange = $currentRating && $previousRating
            ? round($currentRating - $previousRating, 1)
            : 0;

        // 8. CONVERSION RATE
        $conversionRate = $currentPostViews > 0
            ? round(($currentApplications / $currentPostViews) * 100, 2)
            : 0;

        // 9. CONTENT HEALTH
        $totalCourses = Post::where('institute_id', $institute->id)->count();
        $activeCourses = Post::where('institute_id', $institute->id)
            ->where('status', 'active')
            ->count();
        $inactiveCourses = $totalCourses - $activeCourses;

        $upcomingEvents = Event::where('institute_id', $institute->id)
            ->where('event_date', '>', Carbon::now())
            ->count();

        $expiredEvents = Event::where('institute_id', $institute->id)
            ->where('event_date', '<', Carbon::now())
            ->count();

        // 10. PERFORMANCE SUMMARY
        $mostViewedCourse = Post::where('institute_id', $institute->id)
            ->orderBy('view_count', 'desc')
            ->first(['id', 'title', 'view_count']);

        $mostAppliedCourse = Post::where('institute_id', $institute->id)
            ->select('id', 'title')
            ->get()
            ->map(function ($post) {
                $post->applications_count = $post->applyCases()->count();
                return $post;
            })
            ->sortByDesc('applications_count')
            ->first();

        // 11. GENERATE INSIGHTS
        $insights = [];

        if ($postViewsChange > 10) {
            $insights[] = "Post views increased {$postViewsChange}% this period";
        } elseif ($postViewsChange < -10) {
            $insights[] = "Post views dropped {$postViewsChange}% - consider boosting content";
        }

        if ($inactiveCourses > 0) {
            $insights[] = "You have {$inactiveCourses} inactive course" . ($inactiveCourses > 1 ? 's' : '');
        }

        if ($followersChange < 0) {
            $insights[] = "Follower growth dropped compared to last period";
        } elseif ($followersChange > 20) {
            $insights[] = "Great follower growth of {$followersChange}%!";
        }

        if ($conversionRate > 0 && $conversionRate < 2) {
            $insights[] = "Low conversion rate. Consider improving course descriptions";
        } elseif ($conversionRate >= 5) {
            $insights[] = "Excellent conversion rate of {$conversionRate}%";
        }

        if ($upcomingEvents == 0) {
            $insights[] = "No upcoming events scheduled";
        }

        if ($ratingChange > 0.3) {
            $insights[] = "Rating improved by {$ratingChange} points";
        } elseif ($ratingChange < -0.3) {
            $insights[] = "Rating decreased - focus on service quality";
        }

        if (empty($insights)) {
            $insights[] = "Performance is stable. Keep up the good work!";
        }

        // 12. BUILD RESPONSE
        $overviewStats = [
            'metrics' => [
                'profile_views' => $currentProfileViews,
                'profile_views_change' => $profileViewsChange,
                'post_views' => $currentPostViews,
                'post_views_change' => $postViewsChange,
                'event_views' => $currentEventViews,
                'event_views_change' => $eventViewsChange,
                'followers' => $currentFollowers,
                'followers_change' => $followersChange,
                'total_followers' => $totalFollowers,
                'course_applications' => $currentApplications,
                'course_applications_change' => $applicationsChange,
                'total_applications' => $totalApplications,
                'reviews_count' => $totalReviews,
                'average_rating' => $averageRating,
                'rating_change' => $ratingChange,
            ],
            'conversion' => [
                'conversion_rate' => $conversionRate,
            ],
            'content_health' => [
                'total_courses' => $totalCourses,
                'active_courses' => $activeCourses,
                'inactive_courses' => $inactiveCourses,
                'upcoming_events' => $upcomingEvents,
                'expired_events' => $expiredEvents,
            ],
            'performance_summary' => [
                'most_viewed_course' => $mostViewedCourse ? [
                    'id' => $mostViewedCourse->id,
                    'title' => $mostViewedCourse->title,
                    'views' => $mostViewedCourse->view_count,
                ] : null,
                'most_applied_course' => $mostAppliedCourse ? [
                    'id' => $mostAppliedCourse->id,
                    'title' => $mostAppliedCourse->title,
                    'applications' => $mostAppliedCourse->applications_count ?? 0,
                ] : null,
                'followers_this_period' => $currentFollowers,
                'rating_change' => $ratingChange,
            ],
            'insights' => $insights,
        ];

        return response()->json(['overviewStats' => $overviewStats]);
    }

    public function apiTrends(Request $request)
    {
        $days = (int) $request->query('range', 30); // Default to 30 days
        $institute = auth()->user()->institute;

        // Helper to fill dates
        $fillDateCounts = function ($data) use ($days) {
            $dateCounts = [];
            $startDate = Carbon::now()->subDays($days)->startOfDay();

            for ($i = 0; $i <= $days; $i++) {
                $date = $startDate->copy()->addDays($i)->format('Y-m-d');
                $dateCounts[$date] = 0;
            }

            foreach ($data as $row) {
                $dateCounts[$row->date] = $row->total;
            }
            return $dateCounts;
        };

        // 1. Post Views
        $postViewsData = PostView::select(DB::raw('DATE(viewed_at) as date'), DB::raw('count(*) as total'))
            ->join('posts', 'post_views.post_id', '=', 'posts.id')
            ->where('posts.institute_id', $institute->id)
            ->where('viewed_at', '>=', Carbon::now()->subDays($days)->startOfDay())
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        $postViewsProcessed = $fillDateCounts($postViewsData);


        // 2. Event Views
        $eventViewsData = EventView::selectRaw('DATE(viewed_at) as date, COUNT(*) as total')
            ->where('viewed_at', '>=', Carbon::now()->subDays($days)->startOfDay())
            ->whereHas('event', function ($query) use ($institute) {
                $query->where('institute_id', $institute->id);
            })
            ->groupBy('date')
            ->orderBy('date')
            ->get();
        $eventViewsProcessed = $fillDateCounts($eventViewsData);


        // 3. Profile Views
        $profileViewsData = DB::table('institute_profile_views')
            ->select(DB::raw('DATE(viewed_at) as date'), DB::raw('count(*) as total'))
            ->where('institute_id', $institute->id)
            ->where('viewed_at', '>=', Carbon::now()->subDays($days)->startOfDay())
            ->groupBy(DB::raw('DATE(viewed_at)'))
            ->orderBy('date')
            ->get();
        $profileViewsProcessed = $fillDateCounts($profileViewsData);


        // 4. Followers Growth
        $followersData = DB::table('followers')
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as total'))
            ->where('institute_id', $institute->id)
            ->where('created_at', '>=', Carbon::now()->subDays($days)->startOfDay())
            ->groupBy(DB::raw('DATE(created_at)'))
            ->orderBy('date')
            ->get();
        // For followers, we might want cumulative, but for now stick to daily growth as requested by charts
        $followersProcessed = $fillDateCounts($followersData);


        // 5. Course Applications
        $applicationsData = ApplyCase::select(DB::raw('DATE(applied_at) as date'), DB::raw('count(*) as total'))
            ->where('institute_id', $institute->id)
            ->where('applied_at', '>=', Carbon::now()->subDays($days)->startOfDay())
            ->groupBy(DB::raw('DATE(applied_at)'))
            ->orderBy('date')
            ->get();
        $applicationsProcessed = $fillDateCounts($applicationsData);

        return response()->json([
            'postViews' => ['labels' => array_keys($postViewsProcessed), 'data' => array_values($postViewsProcessed)],
            'eventViews' => ['labels' => array_keys($eventViewsProcessed), 'data' => array_values($eventViewsProcessed)],
            'profileViews' => ['labels' => array_keys($profileViewsProcessed), 'data' => array_values($profileViewsProcessed)],
            'followers' => ['labels' => array_keys($followersProcessed), 'data' => array_values($followersProcessed)],
            'applications' => ['labels' => array_keys($applicationsProcessed), 'data' => array_values($applicationsProcessed)],
        ]);
    }

    public function apiPosts(Request $request)
    {
        $query = Post::withCount(['applyCases as applications_count'])
            ->where('institute_id', auth()->user()->institute->id);

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('title', 'like', "%{$search}%");
        }

        $posts = $query->orderByDesc('created_at')->paginate(10);

        return response()->json($posts);
    }

    public function apiEvents(Request $request)
    {
        $query = Event::where('institute_id', auth()->user()->institute->id)
            ->select('id', 'event_title', 'view_count', 'interested_count', 'is_active', 'created_at');

        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('event_title', 'like', "%{$search}%");
        }

        $events = $query->orderByDesc('created_at')->paginate(10);

        return response()->json($events);
    }

    public function apiRatings(Request $request)
    {
        try {
            $ratings = Rating::where('institute_id', auth()->user()->institute->id)
                ->with(['user:id,name,profile_picture'])
                ->latest()
                ->paginate(10);

            return response()->json($ratings);
        } catch (\Exception $e) {
            Log::error('Ratings API Error: ' . $e->getMessage());
            return response()->json(['error' => $e->getMessage()], 500);
        }
    }

    public function apiReportRating(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string',
        ]);

        $rating = Rating::where('institute_id', auth()->user()->institute->id)
            ->findOrFail($id);

        $rating->is_reported = true;
        $rating->report_reason = $request->reason;
        $rating->save();

        return response()->json(['message' => 'Review reported successfully']);
    }

    public function apiSubscription()
    {
        $institute = auth()->user()->institute;
        $subscription = $institute->subscription;

        return response()->json([
            'plan' => $subscription ? ucfirst($subscription->plan) : 'Free',
            'status' => $subscription ? $subscription->status : ($institute->is_trial_used ? 'Expired' : 'Trial'),
            'started_at' => $subscription ? $subscription->created_at : null,
            'ends_at' => $subscription ? $subscription->ends_at : $institute->trial_ends_at,
            'is_trial' => !$subscription && !$institute->is_trial_used,
        ]);
    }

    public function toggleStatus($id)
    {
        $post = Post::findOrFail($id);
        $post->status = $post->status === 'active' ? 'inactive' : 'active';
        $post->save();

        return response()->json([
            'success' => true,
            'new_status' => $post->status
        ]);
    }

    public function toggleEventStatus($id)
    {
        $event = Event::findOrFail($id);
        $event->is_active = !$event->is_active;
        $event->save();

        return response()->json([
            'success' => true,
            'is_active' => $event->is_active
        ]);
    }
}
