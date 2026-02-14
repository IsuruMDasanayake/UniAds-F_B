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

        // Get period parameter (default 30 days) - ONLY for Performance Highlights
        $period = (int) $request->query('period', 30);

        // Date ranges for period-specific data (Performance Highlights)
        $currentEnd = Carbon::now()->endOfDay();
        $currentStart = Carbon::now()->subDays($period)->startOfDay();
        $previousEnd = Carbon::now()->subDays($period)->endOfDay();
        $previousStart = Carbon::now()->subDays($period * 2)->startOfDay();

        // 1. ALL-TIME METRICS (Always Lifetime)
        $totalProfileViews = $institute->profile_views ?? 0;

        $totalPostViews = Post::where('institute_id', $institute->id)->sum('view_count');

        $totalEventViews = Event::where('institute_id', $institute->id)->sum('view_count');

        $totalFollowers = $institute->followers_count ?? 0;

        $totalApplications = ApplyCase::where('institute_id', $institute->id)->count();

        $totalPostLikes = Post::where('institute_id', $institute->id)->sum('likes_count');

        $totalEventInterests = DB::table('event_user_interests')
            ->join('events', 'event_user_interests.event_id', '=', 'events.id')
            ->where('events.institute_id', $institute->id)
            ->count();

        $totalRatings = Rating::where('institute_id', $institute->id)->count();

        $averageRating = Rating::where('institute_id', $institute->id)->avg('rating');
        $averageRating = $averageRating ? round($averageRating, 1) : 0;

        // 2. PERIOD-SPECIFIC DATA (For Performance Highlights)
        $followersInPeriod = Follower::where('institute_id', $institute->id)
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->count();

        $newRatingsInPeriod = Rating::where('institute_id', $institute->id)
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->count();

        // Top viewed course IN PERIOD
        $topViewedData = PostView::join('posts', 'post_views.post_id', '=', 'posts.id')
            ->where('posts.institute_id', $institute->id)
            ->whereBetween('post_views.created_at', [$currentStart, $currentEnd])
            ->select('post_id', DB::raw('count(*) as views_count'))
            ->groupBy('post_id')
            ->orderByDesc('views_count')
            ->first();

        $topViewedCourseInPeriod = null;
        if ($topViewedData) {
            $post = Post::find($topViewedData->post_id);
            if ($post) {
                $topViewedCourseInPeriod = (object)[
                    'id' => $post->id,
                    'title' => $post->title,
                    'views' => $topViewedData->views_count
                ];
            }
        }

        // Most applied course IN PERIOD
        $mostAppliedData = ApplyCase::where('institute_id', $institute->id)
            ->whereBetween('created_at', [$currentStart, $currentEnd])
            ->select('post_id', DB::raw('count(*) as apps_count'))
            ->groupBy('post_id')
            ->orderByDesc('apps_count')
            ->first();

        $mostAppliedCourseInPeriod = null;
        if ($mostAppliedData) {
            $post = Post::find($mostAppliedData->post_id);
            if ($post) {
                $mostAppliedCourseInPeriod = (object)[
                    'id' => $post->id,
                    'title' => $post->title,
                    'applications' => $mostAppliedData->apps_count
                ];
            }
        }

        // 3. CONVERSION & HEALTH (Lifetime)
        $lifetimeConversionRate = $totalPostViews > 0
            ? round(($totalApplications / $totalPostViews) * 100, 2)
            : 0;

        $totalCourses = Post::where('institute_id', $institute->id)->count();
        $activeCourses = Post::where('institute_id', $institute->id)->where('status', 'active')->count();
        $inactiveCourses = $totalCourses - $activeCourses;

        $upcomingEvents = Event::where('institute_id', $institute->id)
            ->where('event_date', '>', Carbon::now())
            ->count();
        $expiredEvents = Event::where('institute_id', $institute->id)
            ->where('event_date', '<', Carbon::now())
            ->count();

        // 4. INSIGHTS & CTA (Based on Lifetime/All-Time)
        $insights = [];
        if ($inactiveCourses > 0) $insights[] = "You have {$inactiveCourses} inactive course" . ($inactiveCourses > 1 ? 's' : '');
        if ($lifetimeConversionRate > 0 && $lifetimeConversionRate < 2) $insights[] = "Overall conversion is low. Consider optimizing course pages.";
        if ($upcomingEvents == 0) $insights[] = "No upcoming events scheduled to drive traffic";
        if ($totalFollowers > 100) $insights[] = "Your institute has a strong community of {$totalFollowers} followers!";

        if (empty($insights)) $insights[] = "Performance is stable. Keep growing your presence!";

        // CTA Logic (All-Time based)
        $hasPositiveGrowth = $totalApplications > 0;
        $ctaMessage = $hasPositiveGrowth
            ? "Your institute has generated {$totalApplications} total applications. Review your top-performing courses to maximize results!"
            : "No applications recorded yet. Try creating more engaging posts or events to attract potential students.";

        // 5. BUILD RESPONSE
        return response()->json([
            'overviewStats' => [
                'metrics' => [
                    'profile_views' => $totalProfileViews,
                    'post_views' => $totalPostViews,
                    'event_views' => $totalEventViews,
                    'followers' => $totalFollowers,
                    'course_applications' => $totalApplications,
                    'post_likes' => $totalPostLikes,
                    'event_interests' => $totalEventInterests,
                    'ratings_count' => $totalRatings,
                    'average_rating' => $averageRating,
                ],
                'performance_summary' => [
                    'most_viewed_course' => $topViewedCourseInPeriod ? [
                        'id' => $topViewedCourseInPeriod->id,
                        'title' => $topViewedCourseInPeriod->title,
                        'views' => $topViewedCourseInPeriod->views,
                    ] : null,
                    'most_applied_course' => $mostAppliedCourseInPeriod ? [
                        'id' => $mostAppliedCourseInPeriod->id,
                        'title' => $mostAppliedCourseInPeriod->title,
                        'applications' => $mostAppliedCourseInPeriod->applications,
                    ] : null,
                    'followers_this_period' => $followersInPeriod,
                    'new_ratings' => $newRatingsInPeriod,
                ],
                'conversion' => [
                    'conversion_rate' => $lifetimeConversionRate,
                ],
                'content_health' => [
                    'total_courses' => $totalCourses,
                    'active_courses' => $activeCourses,
                    'inactive_courses' => $inactiveCourses,
                    'upcoming_events' => $upcomingEvents,
                    'expired_events' => $expiredEvents,
                ],
                'insights' => $insights,
                'cta' => [
                    'hasPositiveGrowth' => $hasPositiveGrowth,
                    'message' => $ctaMessage
                ]
            ]
        ]);
    }

    public function apiTrends(Request $request)
    {
        $periodParam = $request->query('range', 'all');
        $isAllTime = $periodParam === 'all';
        $institute = auth()->user()->institute;
        $days = $isAllTime ? (int) Carbon::parse($institute->created_at)->diffInDays(Carbon::now()) : (int) $periodParam;

        $compare = $request->query('compare', 'false') === 'true';
        if ($isAllTime) $compare = false; // Cannot compare all time with anything

        // Define periods
        $currentEnd = Carbon::now()->endOfDay();
        $currentStart = $isAllTime ? Carbon::create(2000, 1, 1) : Carbon::now()->subDays($days)->startOfDay();

        $previousEnd = Carbon::now()->subDays($days)->endOfDay();
        $previousStart = Carbon::now()->subDays($days * 2)->startOfDay();

        // Helper to fill dates with zero if missing
        $fillDateCounts = function ($data, $start, $daysCount) {
            $dateCounts = [];
            $startDate = $start->copy();

            for ($i = 0; $i <= $daysCount; $i++) {
                $date = $startDate->copy()->addDays($i)->format('Y-m-d');
                $dateCounts[$date] = 0;
            }

            foreach ($data as $row) {
                $dateCounts[$row->date] = $row->total;
            }
            return $dateCounts;
        };

        // Query Helper
        $fetchTrend = function ($query, $start, $end) {
            return $query->whereBetween('viewed_at', [$start, $end])
                ->groupBy(DB::raw('DATE(viewed_at)'))
                ->orderBy(DB::raw('DATE(viewed_at)'))
                ->get([
                    DB::raw('DATE(viewed_at) as date'),
                    DB::raw('count(*) as total')
                ]);
        };

        $calculateChange = function ($current, $previous) {
            if ($previous == 0) return $current > 0 ? 100 : 0;
            return round((($current - $previous) / $previous) * 100, 1);
        };

        // 1. Post Views
        $postViewQuery = PostView::join('posts', 'post_views.post_id', '=', 'posts.id')
            ->where('posts.institute_id', $institute->id);

        $currentPostViews = $fetchTrend(clone $postViewQuery, $currentStart, $currentEnd);
        $previousPostViews = $fetchTrend(clone $postViewQuery, $previousStart, $previousEnd);

        $curPostViewsTotal = $isAllTime ? (Post::where('institute_id', $institute->id)->sum('view_count')) : array_sum(array_values($fillDateCounts($currentPostViews, $currentStart, $days)));
        $prevPostViewsTotal = array_sum(array_values($fillDateCounts($previousPostViews, $previousStart, $days)));

        $postViewsProcessed = [
            'labels' => array_keys($fillDateCounts($currentPostViews, $currentStart, $days)),
            'data' => array_values($fillDateCounts($currentPostViews, $currentStart, $days)),
            'previous_data' => $compare ? array_values($fillDateCounts($previousPostViews, $previousStart, $days)) : null
        ];

        // 2. Event Views
        $eventViewQuery = EventView::join('events', 'event_views.event_id', '=', 'events.id')
            ->where('events.institute_id', $institute->id);

        $currentEventViews = $fetchTrend(clone $eventViewQuery, $currentStart, $currentEnd);
        $previousEventViews = $fetchTrend(clone $eventViewQuery, $previousStart, $previousEnd);

        $curEventViewsTotal = $isAllTime ? (Event::where('institute_id', $institute->id)->sum('view_count')) : array_sum(array_values($fillDateCounts($currentEventViews, $currentStart, $days)));
        $prevEventViewsTotal = array_sum(array_values($fillDateCounts($previousEventViews, $previousStart, $days)));

        $eventViewsProcessed = [
            'labels' => $postViewsProcessed['labels'],
            'data' => array_values($fillDateCounts($currentEventViews, $currentStart, $days)),
            'previous_data' => $compare ? array_values($fillDateCounts($previousEventViews, $previousStart, $days)) : null
        ];

        // 3. Profile Views
        $profileViewQuery = DB::table('institute_profile_views')
            ->where('institute_id', $institute->id);

        $currentProfileViews = $fetchTrend(clone $profileViewQuery, $currentStart, $currentEnd);
        $previousProfileViews = $fetchTrend(clone $profileViewQuery, $previousStart, $previousEnd);

        $curProfileViewsTotal = $isAllTime ? ($institute->profile_views ?? 0) : array_sum(array_values($fillDateCounts($currentProfileViews, $currentStart, $days)));
        $prevProfileViewsTotal = array_sum(array_values($fillDateCounts($previousProfileViews, $previousStart, $days)));

        $profileViewsProcessed = [
            'labels' => $postViewsProcessed['labels'],
            'data' => array_values($fillDateCounts($currentProfileViews, $currentStart, $days)),
            'previous_data' => $compare ? array_values($fillDateCounts($previousProfileViews, $previousStart, $days)) : null
        ];

        // 4. Followers
        $followerQuery = Follower::where('institute_id', $institute->id);

        $fetchFollowerTrend = function ($q, $s, $e) {
            return $q->whereBetween('created_at', [$s, $e])
                ->groupBy(DB::raw('DATE(created_at)'))
                ->orderBy(DB::raw('DATE(created_at)'))
                ->get([DB::raw('DATE(created_at) as date'), DB::raw('count(*) as total')]);
        };

        $currentFollowers = $fetchFollowerTrend(clone $followerQuery, $currentStart, $currentEnd);
        $previousFollowers = $fetchFollowerTrend(clone $followerQuery, $previousStart, $previousEnd);

        $curFollowersTotal = $isAllTime ? ($institute->followers_count ?? 0) : array_sum(array_values($fillDateCounts($currentFollowers, $currentStart, $days)));
        $prevFollowersTotal = array_sum(array_values($fillDateCounts($previousFollowers, $previousStart, $days)));

        $followersProcessed = [
            'labels' => $postViewsProcessed['labels'],
            'data' => array_values($fillDateCounts($currentFollowers, $currentStart, $days)),
            'previous_data' => $compare ? array_values($fillDateCounts($previousFollowers, $previousStart, $days)) : null
        ];

        // 5. Applications
        $applicationQuery = ApplyCase::where('institute_id', $institute->id);

        $fetchAppTrend = function ($q, $s, $e) {
            return $q->whereBetween('created_at', [$s, $e])
                ->groupBy(DB::raw('DATE(created_at)'))
                ->orderBy(DB::raw('DATE(created_at)'))
                ->get([DB::raw('DATE(created_at) as date'), DB::raw('count(*) as total')]);
        };

        $currentApplications = $fetchAppTrend(clone $applicationQuery, $currentStart, $currentEnd);
        $previousApplications = $fetchAppTrend(clone $applicationQuery, $previousStart, $previousEnd);

        $curAppsTotal = array_sum(array_values($fillDateCounts($currentApplications, $currentStart, $days)));
        $prevAppsTotal = array_sum(array_values($fillDateCounts($previousApplications, $previousStart, $days)));

        $applicationsProcessed = [
            'labels' => $postViewsProcessed['labels'],
            'data' => array_values($fillDateCounts($currentApplications, $currentStart, $days)),
            'previous_data' => $compare ? array_values($fillDateCounts($previousApplications, $previousStart, $days)) : null
        ];

        // 6. Demographics
        // Get unique users who interacted with the institute (Followers + Applicants)
        $userIds = array_unique(array_merge(
            Follower::where('institute_id', $institute->id)->pluck('user_id')->toArray(),
            ApplyCase::where('institute_id', $institute->id)->pluck('user_id')->toArray()
        ));

        $users = User::whereIn('id', $userIds)->get(['gender', 'birthday', 'district', 'education_level']);

        // Gender Distribution
        $genderDistrib = $users->groupBy('gender')->map(function ($group) {
            return count($group);
        });

        // Age Distribution
        $ageGroups = [
            'Under 18' => 0,
            '18-22' => 0,
            '23-30' => 0,
            '30+' => 0
        ];
        foreach ($users as $user) {
            if ($user->birthday) {
                $age = Carbon::parse($user->birthday)->age;
                if ($age < 18) $ageGroups['Under 18']++;
                elseif ($age <= 22) $ageGroups['18-22']++;
                elseif ($age <= 30) $ageGroups['23-30']++;
                else $ageGroups['30+']++;
            }
        }

        // District Distribution (Top 10)
        $districtDistrib = $users->whereNotNull('district')->countBy('district')->sortDesc()->take(10);

        // Education Level Distribution
        $eduDistrib = $users->whereNotNull('education_level')->countBy('education_level');

        $demographics = [
            'gender' => $genderDistrib,
            'age_groups' => $ageGroups,
            'districts' => $districtDistrib,
            'education_levels' => $eduDistrib
        ];

        // 7. Totals for Stat Cards
        $totals = [
            'postViews' => [
                'value' => $curPostViewsTotal,
                'change' => $calculateChange($curPostViewsTotal, $prevPostViewsTotal)
            ],
            'eventViews' => [
                'value' => $curEventViewsTotal,
                'change' => $calculateChange($curEventViewsTotal, $prevEventViewsTotal)
            ],
            'profileViews' => [
                'value' => $curProfileViewsTotal,
                'change' => $calculateChange($curProfileViewsTotal, $prevProfileViewsTotal)
            ],
            'applications' => [
                'value' => $curAppsTotal,
                'change' => $calculateChange($curAppsTotal, $prevAppsTotal)
            ],
            'followers' => [
                'value' => $curFollowersTotal,
                'change' => $calculateChange($curFollowersTotal, $prevFollowersTotal)
            ],
        ];

        // 8. Insights & Summary Calculation
        $totalViews = $curPostViewsTotal + $curEventViewsTotal + $curProfileViewsTotal;

        // Find peak day
        $peakViews = 0;
        $peakDate = 'N/A';
        $postDates = $fillDateCounts($currentPostViews, $currentStart, $days);
        $eventDates = $fillDateCounts($currentEventViews, $currentStart, $days);
        $profileDates = $fillDateCounts($currentProfileViews, $currentStart, $days);

        foreach ($postDates as $date => $count) {
            $dayTotal = $count + ($eventDates[$date] ?? 0) + ($profileDates[$date] ?? 0);
            if ($dayTotal > $peakViews) {
                $peakViews = $dayTotal;
                $peakDate = Carbon::parse($date)->format('M d');
            }
        }

        $summary = [
            'total_views' => $totalViews,
            'total_applications' => $curAppsTotal,
            'followers_gained' => $curFollowersTotal,
            'avg_daily_views' => round($totalViews / ($days ?: 1), 1),
            'peak_day' => "$peakDate ($peakViews)"
        ];

        $insights = [];
        if ($totals['postViews']['change'] > 10) $insights[] = "Post engagement is up by {$totals['postViews']['change']}% compared to last period.";
        if ($totals['applications']['change'] > 5) $insights[] = "Course applications are trending upwards (+{$totals['applications']['change']}%).";
        if ($curFollowersTotal > $prevFollowersTotal) $insights[] = "Community growth is accelerating with new followers this period.";
        if ($peakViews > ($totalViews / ($days ?: 1)) * 2) $insights[] = "Significant traffic spike detected on $peakDate.";
        if (empty($insights)) $insights[] = "Maintain your current posting frequency to keep engagement stable.";

        return response()->json([
            'postViews' => $postViewsProcessed,
            'eventViews' => $eventViewsProcessed,
            'profileViews' => $profileViewsProcessed,
            'applications' => $applicationsProcessed,
            'followers' => $followersProcessed,
            'demographics' => $demographics,
            'totals' => $totals,
            'summary' => $summary,
            'insights' => $insights
        ]);
    }

    public function apiPosts(Request $request)
    {
        $instituteId = auth()->user()->institute->id;

        // Base query for current page results (with filters)
        $query = Post::withCount(['applyCases as applications_count'])
            ->where('institute_id', $instituteId);

        // Apply Search
        if ($request->has('search') && !empty($request->get('search'))) {
            $search = $request->get('search');
            $query->where('title', 'like', "%{$search}%");
        }

        // Apply Status Filter
        if ($request->has('status') && $request->get('status') !== 'all') {
            $query->where('status', $request->get('status'));
        }

        // Pagination
        $posts = $query->orderByDesc('created_at')->paginate(10);

        // Stats for cards (Global for the institute)
        $stats = [
            'total_posts' => Post::where('institute_id', $instituteId)->count(),
            'active_posts' => Post::where('institute_id', $instituteId)->where('status', 'active')->count(),
            'total_views' => (int) Post::where('institute_id', $instituteId)->sum('view_count'),
            'total_applications' => ApplyCase::where('institute_id', $instituteId)->count(),
        ];

        return response()->json([
            'posts' => $posts,
            'stats' => $stats
        ]);
    }

    public function apiEvents(Request $request)
    {
        $instituteId = auth()->user()->institute->id;
        $now = now();

        $query = Event::where('institute_id', $instituteId)
            ->select('id', 'event_title', 'event_image', 'event_date', 'event_description', 'main_location', 'sub_location', 'view_count', 'interested_count', 'decline_count', 'is_active', 'created_at');

        // Stats calculation
        $stats = [
            'total_events' => Event::where('institute_id', $instituteId)->count(),
            'total_interests' => Event::where('institute_id', $instituteId)->sum('interested_count'),
            'total_declines' => Event::where('institute_id', $instituteId)->sum('decline_count'),
            'total_views' => Event::where('institute_id', $instituteId)->sum('view_count'),
            'upcoming_events' => Event::where('institute_id', $instituteId)->where('event_date', '>', $now)->count(),
            'past_events' => Event::where('institute_id', $instituteId)->where('event_date', '<', $now)->count(),
        ];

        // Search
        if ($request->has('search')) {
            $search = $request->get('search');
            $query->where('event_title', 'like', "%{$search}%");
        }

        // Status Filtering
        if ($request->has('status') && $request->status !== 'all') {
            $status = $request->status;
            switch ($status) {
                case 'active':
                    $query->where('is_active', true);
                    break;
                case 'deactive':
                    $query->where('is_active', false);
                    break;
                case 'upcoming':
                    $query->where('event_date', '>', $now);
                    break;
                case 'past':
                    $query->where('event_date', '<', $now);
                    break;
                case 'expired':
                    // Assuming expired means past AND inactive? Or just past.
                    // Let's go with past.
                    $query->where('event_date', '<', $now);
                    break;
            }
        }

        $events = $query->orderByRaw('event_date < ? ASC', [$now])
            ->orderByRaw('ABS(TIMESTAMPDIFF(SECOND, event_date, ?)) ASC', [$now])
            ->paginate(10);

        return response()->json([
            'data' => $events->items(),
            'current_page' => $events->currentPage(),
            'last_page' => $events->lastPage(),
            'total' => $events->total(),
            'stats' => $stats,
        ]);
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

    public function deletePost($id)
    {
        $post = Post::where('institute_id', auth()->user()->institute->id)->findOrFail($id);
        $post->delete();

        return response()->json([
            'success' => true,
            'message' => 'Post deleted successfully'
        ]);
    }

    public function deleteEvent($id)
    {
        $event = Event::where('institute_id', auth()->user()->institute->id)->findOrFail($id);
        $event->delete();

        return response()->json([
            'success' => true,
            'message' => 'Event deleted successfully'
        ]);
    }
}
