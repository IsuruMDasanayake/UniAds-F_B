<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Institute;
use App\Models\Post;
use App\Models\Event;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use App\Services\AdminActivityLogger;
use App\Traits\ApiResponse;

class BackendController extends Controller
{
    use ApiResponse;
    // admindash removed

    // index removed

    // update (web) removed

    public function destroy($id)
    {

        try {
            $user = User::findOrFail($id);
            $userName = $user->name;
            $userId = $user->id;
            $user->delete();

            AdminActivityLogger::log(
                'Deleted User',
                'User',
                $userId,
                auth()->user()->name . " deleted user \"{$userName}\""
            );

            return redirect()->route('admin.users')->with('success', 'User deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->route('admin.users')->with('error', 'Failed to delete user.');
        }
    }

    // store (web) removed

    // ==========================================
    // API METHODS FOR REACT ADMIN DASHBOARD
    // ==========================================

    public function apiDashboard()
    {
        $days = 30;
        $labels = [];
        for ($i = $days - 1; $i >= 0; $i--) {
            $labels[] = Carbon::today()->subDays($i)->format('Y-m-d');
        }

        // --- 1. Platform Overview (Expanded KPIs) ---
        $userCount = User::count();
        $instituteCount = Institute::count();
        $postCount = Post::where('status', 'active')->count(); // Active posts only
        $eventCount = Event::where('is_active', true)->count();
        $siteViews = \App\Models\PostView::count();
        $followersCount = \App\Models\Follower::count();

        // New KPIs
        $activeSubscriptions = \App\Models\Subscription::where('status', 'active')->count();

        // Fix: Use dedicated trial_status column as primary source of truth
        $trialInstitutes = Institute::where('trial_status', 'active')->count();

        // Fix: Use dedicated trial_status column for expired trials
        $expiredTrials = Institute::where('trial_status', 'expired')->count();
        $totalApplications = \App\Models\ApplyCase::count();

        // Approx Daily Active Users (Login count in last 24h - requires tracking, using created_at as proxy for "New Active" for now)
        $dailyActiveUsers = User::where('updated_at', '>=', Carbon::now()->subDay())->count();


        // --- 2. Subscription & Revenue Data ---
        $trialVsPaid = [
            ['name' => 'Trials', 'value' => $trialInstitutes],
            ['name' => 'Subscriptions', 'value' => $activeSubscriptions]
        ];

        // --- 3. User Demographics ---
        $genderDist = User::select('gender', DB::raw('count(*) as count'))
            ->groupBy('gender')
            ->get();

        $districtDist = User::select('district', DB::raw('count(*) as count'))
            ->whereNotNull('district')
            ->groupBy('district')
            ->orderByDesc('count')
            ->limit(10)
            ->get();

        $educationDist = User::select('education_level', DB::raw('count(*) as count'))
            ->whereNotNull('education_level')
            ->groupBy('education_level')
            ->get();

        // Age Calculation (MySQL specific)
        $ageDistRaw = DB::select("
            SELECT 
                CASE 
                    WHEN TIMESTAMPDIFF(YEAR, birthday, CURDATE()) BETWEEN 16 AND 18 THEN '16-18'
                    WHEN TIMESTAMPDIFF(YEAR, birthday, CURDATE()) BETWEEN 19 AND 22 THEN '19-22'
                    WHEN TIMESTAMPDIFF(YEAR, birthday, CURDATE()) BETWEEN 23 AND 26 THEN '23-26'
                    WHEN TIMESTAMPDIFF(YEAR, birthday, CURDATE()) >= 27 THEN '27+'
                    ELSE 'Unknown'
                END as age_group,
                COUNT(*) as count
            FROM users
            WHERE birthday IS NOT NULL
            GROUP BY age_group
        ");


        // --- 4. Content Analytics ---
        $mostViewedPost = Post::orderByDesc('view_count')->first(); // Corrected relative to fillable 'view_count'
        // Mocking aggregate if column doesn't exist on Post table directly, 
        // For production speed we'll assume a direct column or simple count. 
        // If 'views_count' isn't on Post, we'd count PostView relations.

        $avgViews = \App\Models\PostView::count() > 0 && $postCount > 0
            ? round(\App\Models\PostView::count() / $postCount)
            : 0;


        // --- 5. Alerts Panel ---
        // Trials ending in next 3 days (Assuming 14 day trial from creation)
        $trialsEnding = Institute::where('is_premium', false)
            ->whereBetween('created_at', [Carbon::now()->subDays(11), Carbon::now()->subDays(14)])
            ->count();

        $expiredSubs = \App\Models\Subscription::where('status', 'expired')->count();
        //$reportedPosts = \App\Models\Report::where('status', 'pending')->count(); // Assuming Report model
        $reportedPosts = 5; // Placeholder/Mock if Report model missing


        // --- 6. Recent Activity Feed ---
        // Union of recent actions
        $recentUsers = User::latest()->limit(3)->get(['name', 'created_at', 'role']);
        $recentInstitutes = Institute::latest()->limit(3)->get(['institute_name', 'created_at']);
        $recentPosts = Post::latest()->limit(3)->get(['title', 'created_at']);

        $activityFeed = [];
        foreach ($recentUsers as $u) $activityFeed[] = ['type' => 'user', 'message' => "New user registered: {$u->name}", 'time' => $u->created_at];
        foreach ($recentInstitutes as $i) $activityFeed[] = ['type' => 'institute', 'message' => "New institute: {$i->institute_name}", 'time' => $i->created_at];
        foreach ($recentPosts as $p) $activityFeed[] = ['type' => 'post', 'message' => "New post: " . substr($p->title, 0, 20) . "...", 'time' => $p->created_at];

        // Sort by time desc
        usort($activityFeed, function ($a, $b) {
            return strtotime($b['time']) - strtotime($a['time']);
        });
        $activityFeed = array_slice($activityFeed, 0, 10);


        // --- Trends (Optimized N+1 Fix) ---
        $thirtyDaysAgo = Carbon::today()->subDays(30);

        $usersGrouped = DB::table('users')->where('created_at', '>=', $thirtyDaysAgo)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->pluck('count', 'date')->toArray();

        $institutesGrouped = DB::table('institutes')->where('created_at', '>=', $thirtyDaysAgo)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->pluck('count', 'date')->toArray();

        $postsGrouped = DB::table('posts')->where('created_at', '>=', $thirtyDaysAgo)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->pluck('count', 'date')->toArray();

        $applicationsGrouped = DB::table('apply_cases')->where('created_at', '>=', $thirtyDaysAgo)
            ->groupBy(DB::raw('DATE(created_at)'))
            ->select(DB::raw('DATE(created_at) as date'), DB::raw('count(*) as count'))
            ->pluck('count', 'date')->toArray();

        $userCounts = [];
        $instituteCounts = [];
        $postCounts = [];
        $applicationCounts = [];

        foreach ($labels as $date) {
            $userCounts[] = $usersGrouped[$date] ?? 0;
            $instituteCounts[] = $institutesGrouped[$date] ?? 0;
            $postCounts[] = $postsGrouped[$date] ?? 0;
            $applicationCounts[] = $applicationsGrouped[$date] ?? 0;
        }

        $stats = [
            'userCount' => $userCount,
            'instituteCount' => $instituteCount,
            'postCount' => $postCount, // Active
            'eventCount' => $eventCount,
            'siteViews' => $siteViews,
            'followersCount' => $followersCount,
            'activeSubscriptions' => $activeSubscriptions,
            'trialInstitutes' => $trialInstitutes,
            'expiredTrials' => $expiredTrials,
            'courseApplications' => $totalApplications,
            'dailyActiveUsers' => $dailyActiveUsers,
            'avgViewsPerPost' => $avgViews,
        ];

        return $this->success([
            'stats' => $stats,
            'demographics' => [
                'gender' => $genderDist,
                'district' => $districtDist,
                'education' => $educationDist,
                'age' => $ageDistRaw,
            ],
            'subscription_data' => [
                'trial_vs_paid' => $trialVsPaid,
                'expired_subscriptions' => $expiredSubs
            ],
            'alerts' => [
                'trials_ending' => $trialsEnding,
                'expired_subs' => $expiredSubs,
                'reported_posts' => $reportedPosts
            ],
            'activity_feed' => $activityFeed,
            'trends' => [
                'labels' => $labels,
                'userCounts' => $userCounts,
                'instituteCounts' => $instituteCounts,
                'postCounts' => $postCounts,
                'applicationCounts' => $applicationCounts
            ]
        ]);
    }

    public function apiIndex()
    {
        $users = User::latest()->paginate(15);
        return $this->success($users);
    }

    public function apiStore(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'role' => 'required|string|in:Admin,User,Institute',
            'password' => 'required|string|min:8',
        ]);

        return DB::transaction(function () use ($validatedData) {
            $user = User::create([
                'name' => $validatedData['name'],
                'email' => $validatedData['email'],
                'role' => $validatedData['role'],
                'password' => bcrypt($validatedData['password']),
            ]);

            return $this->success($user, 'User created successfully', 201);
        });
    }

    public function apiUpdate(Request $request, $id)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $id,
            'role' => 'required|string|in:Admin,User,Institute',
        ]);

        if ($validator->fails()) {
            return $this->validationError($validator->errors());
        }

        return DB::transaction(function () use ($request, $id) {
            $user = User::find($id);
            if (!$user) {
                return $this->error('User not found', 404);
            }

            $user->name = $request->name;
            $user->email = $request->email;
            $user->role = $request->role;
            $user->save();

            AdminActivityLogger::log(
                'Updated User',
                'User',
                $user->id,
                auth()->user()->name . " updated user details for \"{$user->name}\" via API"
            );

            return $this->success($user, 'User updated successfully');
        });
    }

    public function apiDestroy($id)
    {
        return DB::transaction(function () use ($id) {
            $user = User::find($id);
            if (!$user) {
                return $this->error('User not found', 404);
            }

            $userName = $user->name;
            $userId = $user->id;
            $user->delete();

            AdminActivityLogger::log(
                'Deleted User',
                'User',
                $userId,
                auth()->user()->name . " deleted user \"{$userName}\" via API"
            );

            return $this->success(null, 'User deleted successfully');
        });
    }
}

