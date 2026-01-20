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

    public function index()
{   
    $instituteId = auth()->user()->institute->id;

    // Ensure the user has an institute profile
    $institute = auth()->user()->institute;
    if (!$institute) {
        return redirect()->route('home')->with('error', 'You must have an institute profile to access analytics.');
    }

    // Fetching overview stats
    $postViews = Post::where('institute_id', $institute->id)->sum('view_count');
    $courseApplications = ApplyCase::where('institute_id', $institute->id)->count();
    $reviewsWithCommentsCount = Rating::where('institute_id', $institute->id)
    ->whereNotNull('comment')
    ->where('comment', '!=', '')
    ->count();
    $eventViews = Event::where('institute_id', $institute->id)->sum('view_count');
    $activeCourses = Post::where('institute_id', $institute->id)
                                 ->where('status', 'active')
                                 ->count();
    $averageRating = Rating::where('institute_id', $institute->id)
                                       ->avg('rating');


    $overviewStats = [
        'profile_views' => $institute->profile_views ?? 0,
        'post_views'          => $postViews,
        'followers'         => $institute->followers_count ?? 0,
        'course_applications' => $courseApplications,
        'reviews_with_comments_count' => $reviewsWithCommentsCount,
        'event_views'         => $eventViews, 
        'active_courses'      => $activeCourses, 
        'average_rating'       => $averageRating ? round($averageRating, 1) : 'N/A',
    ];

    $posts = Post::withCount(['applyCases as applications_count'])
            ->where('institute_id', auth()->user()->institute->id)
            ->orderByDesc('created_at')
            ->get();

    $events = Event::where('institute_id', $instituteId)
        ->select('id', 'event_title', 'view_count', 'interested_count', 'is_active', 'created_at')
        ->orderByDesc('created_at')
        ->get();


    $ratings = Rating::where('institute_id', $institute->id)
        ->with('user') // Assuming you have a relationship defined
        ->latest()
        ->get();


    $subscription = $institute->subscription;

    return view('frontend.analytics.dashboard', compact('institute', 'overviewStats', 'posts', 'events', 'ratings', 'subscription'));
}



public function getPostViewsTrends(Request $request)
{
    $institute = auth()->user()->institute;
    $days = $request->query('days', 30); // default to 30

    $startDate = Carbon::now()->subDays($days)->startOfDay();

    $viewsData = PostView::select(DB::raw('DATE(viewed_at) as date'), DB::raw('count(*) as count'))
        ->join('posts', 'post_views.post_id', '=', 'posts.id')
        ->where('posts.institute_id', $institute->id)
        ->where('viewed_at', '>=', $startDate)
        ->groupBy('date')
        ->orderBy('date')
        ->get();

    $labels = [];
    $counts = [];

    $period = \Carbon\CarbonPeriod::create($startDate, Carbon::now());

    foreach ($period as $date) {
        $label = $date->format('Y-m-d');
        $labels[] = $label;
        $counts[] = $viewsData->firstWhere('date', $label)->count ?? 0;
    }

    return response()->json([
        'labels' => $labels,
        'counts' => $counts,
    ]);
}



public function eventViewTrend(Request $request)
{
    $days = $request->query('days', 30); // Default to last 30 days
    $user = auth()->user();
    $institute = $user->institute;

    $startDate = Carbon::now()->subDays($days)->startOfDay();

    $views = EventView::selectRaw('DATE(viewed_at) as date, COUNT(*) as count')
        ->where('viewed_at', '>=', $startDate)
        ->whereHas('event', function ($query) use ($institute) {
            $query->where('institute_id', $institute->id);
        })
        ->groupBy('date')
        ->orderBy('date')
        ->get();

    // Build labels and counts for the chart
    $labels = [];
    $counts = [];

    for ($i = 0; $i < $days; $i++) {
        $date = Carbon::now()->subDays($days - 1 - $i)->toDateString();
        $labels[] = Carbon::parse($date)->format('M j');
        $count = $views->firstWhere('date', $date)->count ?? 0;
        $counts[] = $count;
    }

    return response()->json([
        'labels' => $labels,
        'counts' => $counts,
    ]);
}


/**
     * 📊 Profile Views Over Time
     */
    public function profileViewsTrends(Request $request)
{
    $days = (int) $request->query('days', 30);
    $institute = auth()->user()->institute;

    // Step 1: Get raw view counts grouped by date
    $views = DB::table('institute_profile_views')
        ->select(DB::raw('DATE(viewed_at) as date'), DB::raw('count(*) as total'))
        ->where('institute_id', $institute->id)
        ->where('viewed_at', '>=', Carbon::now()->subDays($days))
        ->groupBy(DB::raw('DATE(viewed_at)'))
        ->orderBy('date')
        ->get();

    // Step 2: Convert to date => count map
    $countsMap = [];
    foreach ($views as $view) {
        $countsMap[$view->date] = $view->total;
    }

    // Step 3: Fill missing dates with 0
    $dateCounts = [];
    for ($i = $days - 1; $i >= 0; $i--) {
        $date = Carbon::today()->subDays($i)->format('Y-m-d');
        $dateCounts[$date] = $countsMap[$date] ?? 0;
    }

    return response()->json([
        'labels' => array_keys($dateCounts),
        'counts' => array_values($dateCounts),
    ]);
}

    /**
     * 📨 Course Applications Over Time
     */
    public function courseApplicationsTrends(Request $request)
    {
        $days = $request->query('days', 30);
        $institute = auth()->user()->institute;

        $applications = ApplyCase::select(DB::raw('DATE(applied_at) as date'), DB::raw('count(*) as total'))
            ->where('institute_id', $institute->id)
            ->where('applied_at', '>=', Carbon::now()->subDays($days))
            ->groupBy(DB::raw('DATE(applied_at)'))
            ->orderBy('date')
            ->get();

        $dateCounts = $this->fillDateCounts($applications, $days);

        return response()->json([
            'labels' => array_keys($dateCounts),
            'counts' => array_values($dateCounts),
        ]);
    }

    /**
     * 🧍 Followers Over Time
     */
    public function followersTrends(Request $request)
{
    $days = (int) $request->query('days', 30);
    $institute = auth()->user()->institute;

    if (!$institute) {
        return response()->json(['labels' => [], 'counts' => []]);
    }

    $followers = DB::table('followers')
        ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as total'))
        ->where('institute_id', $institute->id)
        ->where('created_at', '>=', Carbon::now()->subDays($days)->startOfDay())
        ->groupBy(DB::raw('DATE(created_at)'))
        ->orderBy('date')
        ->get();

    $dateCounts = $this->fillDateCounts($followers, $days);

    return response()->json([
        'labels' => array_keys($dateCounts),
        'counts' => array_values($dateCounts),
    ]);
}


    /**
     * 🧠 Utility: Fill in missing dates
     */
    protected function fillDateCounts($data, $days)
{
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
}


public function postAnalytics()
{
    $institute = auth()->user()->institute;

    $posts = Post::withCount(['applyCases'])
                ->where('institute_id', $institute->id)
                ->get();

    return view('frontend.analytics.dashboard', compact('posts'));
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



}

