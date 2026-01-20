<?php

namespace App\Http\Controllers;

use App\Models\Institute;
use App\Models\Post;
use App\Models\Category;
use App\Models\Event;
use App\Models\EventUserInterest;
use App\Models\EventUserDeclines;
use Carbon\Carbon;

use Illuminate\Http\Request;

class FrontendController extends Controller
{
    public function profile()
    {
        return view('frontend.profile');
    }

    public function feed()
    {
        $posts = Post::with('institute')->latest()->paginate(3);

        $categories = Category::whereIn('main_category', [
            "Course Type  - Bachelor's Degree",
            "Course Type -  Master's Degree",
            "Course Type  - Diploma"
        ])
            ->orderBy('name')
            ->get()
            ->groupBy('main_category')
            ->map(function ($group) {
                return $group->take(5);
            });

        $events = Event::with([
            'institute',
            'views' => function ($query) {
                $query->where('user_id', auth()->id());
            }
        ])
            ->where('is_active', true)
            ->whereDate('event_date', '>=', Carbon::today())
            ->latest()
            ->get();

        return view('frontend.feed.feed', compact('posts', 'categories', 'events'));
    }

    public function institutions()
    {
        return view('frontend.institutions.institutions');
    }
    public function showInstitutions()
    {
        $approvedInstitutes = Institute::where('status', 'approved')->get();
        return view('frontend.institutions.institutions', compact('approvedInstitutes'));
    }


    public function courses()
    {
        return view('frontend.courses.courses');
    }

    public function courselist()
    {
        return view('frontend.courses.courselist');
    }

    /**
     * API endpoint for feed data
     */
    public function feedApi()
    {
        $posts = Post::with(['institute', 'likes'])
            ->latest()
            ->paginate(10);

        $categories = Category::whereIn('main_category', [
            "Course Type  - Bachelor's Degree",
            "Course Type -  Master's Degree",
            "Course Type  - Diploma"
        ])
            ->orderBy('name')
            ->get()
            ->groupBy('main_category')
            ->map(function ($group) {
                return $group->take(5);
            });

        $events = Event::with(['institute'])
            ->where('is_active', true)
            ->whereDate('event_date', '>=', Carbon::today())
            ->whereDoesntHave('declinedByUsers', function ($query) {
                $query->where('user_id', auth()->id());
            })
            ->latest()
            ->take(10)
            ->get();

        $userId = auth()->id();
        $user = auth()->user();

        $posts->getCollection()->transform(function ($post) use ($user) {
            $post->is_liked_by_user = $user ? $post->likes()->where('user_id', $user->id)->exists() : false;
            $post->is_saved_by_user = ($user && $user->role === 'User') ? $user->savedPosts()->where('post_id', $post->id)->exists() : false;
            return $post;
        });

        $events->transform(function ($event) use ($userId) {
            $event->is_interested = $userId ? EventUserInterest::where('user_id', $userId)
                ->where('event_id', $event->id)
                ->exists() : false;
            return $event;
        });

        return response()->json([
            'posts' => $posts,
            'categories' => $categories,
            'events' => $events,
        ]);
    }
}
