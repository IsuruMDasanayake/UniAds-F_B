<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Institute;
use App\Models\Post;
use App\Models\Event;
use App\Http\Controllers\Controller;
use Validator;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class BackendController extends Controller
{
    public function admindash()
{
    // Redirect to login if not logged in
    if (!auth()->check()) {
        return redirect()->route('login');
    }

    // Only Admins can access
    if (auth()->user()->role !== 'Admin') {
        abort(403, 'Unauthorized access');
    }

    $days = 30; // default 30 days
    $labels = [];
    for ($i = $days - 1; $i >= 0; $i--) {
        $labels[] = Carbon::today()->subDays($i)->format('Y-m-d');
    }

    // Trend data
    $userCounts = [];
    $instituteCounts = [];
    $postCounts = [];
    $eventCounts = [];
    $siteViewsCounts = [];
    $followersCounts = [];
    $subscriptionsCounts = [];
    $applicationsCounts = [];
    $activeCoursesCounts = [];
    $ratingsCounts = [];
    $reviewsCounts = [];

    foreach ($labels as $date) {
        $userCounts[] = \DB::table('users')->whereDate('created_at', $date)->count();
        $instituteCounts[] = \DB::table('institutes')->whereDate('created_at', $date)->count();
        $postCounts[] = \DB::table('posts')->whereDate('created_at', $date)->count();
        $eventCounts[] = \DB::table('events')->whereDate('created_at', $date)->count();
        $siteViewsCounts[] = \DB::table('post_views')->whereDate('created_at', $date)->count();
        $followersCounts[] = \DB::table('followers')->whereDate('created_at', $date)->count();
        $subscriptionsCounts[] = \DB::table('subscriptions')->whereDate('created_at', $date)->count();
        $applicationsCounts[] = \DB::table('apply_cases')->whereDate('created_at', $date)->count();
        $activeCoursesCounts[] = \DB::table('posts')->where('status', 'active')->whereDate('created_at', $date)->count();
        $ratingsCounts[] = \DB::table('ratings')->whereDate('created_at', $date)->avg('rating') ?? 0;
        $reviewsCounts[] = \DB::table('ratings')->whereDate('created_at', $date)->count();
    }

    // Site-wide stats
    $userCount = User::count();
    $instituteCount = Institute::count();
    $postCount = Post::count();
    $eventCount = Event::count();
    $siteViews = \App\Models\PostView::count();
    $followersCount = \App\Models\Follower::count();
    $subscriptionsCount = \App\Models\Subscription::count();
    $courseApplications = \App\Models\ApplyCase::count();
    $activeCourses = Post::where('status', 'active')->count();
    $averageRating = \App\Models\Rating::avg('rating');
    $reviewsCount = \App\Models\Rating::count();

    return view('admin.admindash', compact(
        'userCount', 'instituteCount', 'postCount', 'eventCount',
        'siteViews', 'followersCount', 'subscriptionsCount', 'courseApplications',
        'activeCourses', 'averageRating', 'reviewsCount',
        'labels', 'userCounts', 'instituteCounts', 'postCounts', 'eventCounts',
        'siteViewsCounts', 'followersCounts', 'subscriptionsCounts',
        'applicationsCounts', 'activeCoursesCounts', 'ratingsCounts', 'reviewsCounts'
    ));
}



    public function index()
    {
        // Redirect to login if not logged in
        if (!auth()->check()) {
            return redirect()->route('login');
        }
        
        if (auth()->user()->role !== 'Admin') {
            abort(403, 'Unauthorized access');
        }
        $users = User::all(); // Fetch all users from the database
        return view('admin.users', compact('users')); // Pass users to the view
    }



    // Method to update user data
    public function update(Request $request)
    {

        // Validate the request data
        $validator = Validator::make($request->all(), [
            'id' => 'required|exists:users,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,' . $request->id,
            'role' => 'required|string|in:Admin,User,Institute',
        ]);

        // Check if validation fails
        if ($validator->fails()) {
            return response()->json(['success' => false, 'message' => $validator->errors()->first()]);
        }

        // Find the user by ID and update their details
        $user = User::find($request->id);
        if ($user) {
            $user->name = $request->name;
            $user->email = $request->email;
            $user->role = $request->role;
            $user->save();

            // Return a success response
            return response()->json(['success' => true, 'user' => $user]);
        }

        // Return failure response if user is not found
        return response()->json(['success' => false, 'message' => 'User not found']);
    }

    public function destroy($id)
    {

        try {
            $user = User::findOrFail($id);
            $user->delete();

            return redirect()->route('admin.users')->with('success', 'User deleted successfully.');
        } catch (\Exception $e) {
            return redirect()->route('admin.users')->with('error', 'Failed to delete user.');
        }
    }



    public function store(Request $request)
    {
        if (auth()->user()->role !== 'Admin') {
            abort(403, 'Unauthorized access');
        }
        $validatedData = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'role' => 'required|string',
            'password' => 'required|string|min:8',
        ]);

        $user = User::create([
            'name' => $validatedData['name'],
            'email' => $validatedData['email'],
            'role' => $validatedData['role'],
            'password' => bcrypt($validatedData['password']),
        ]);

        return response()->json(['success' => true, 'user' => $user]);
    }







}

