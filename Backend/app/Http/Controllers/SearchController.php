<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Event;
use App\Models\Institute;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;


class SearchController extends Controller
{


    public function search(Request $request)
    {
        $query = trim($request->input('query'));

        if ($query === '') {
            return redirect()->back()->with('error', 'Please enter a search term.');
        }

        $posts = Post::where('title', 'LIKE', "%{$query}%")
            ->with('institute') // eager load
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
            ->join('institutes', 'institutes.id', '=', 'posts.institute_id')
            ->orderByDesc('priority')
            ->orderByDesc('posts.created_at')
            ->get();

        return view('frontend.search.course-results', compact('query', 'posts'));
    }

    /**
     * API Global Search
     */
    public function apiSearch(Request $request)
    {
        $query = trim($request->query('query'));

        if (strlen($query) < 2) {
            return response()->json([
                'posts' => [],
                'institutes' => [],
                'events' => []
            ]);
        }

        // Search Posts (Courses)
        $posts = Post::with('institute')
            ->where('title', 'LIKE', "%{$query}%")
            ->where('status', 'active')
            ->latest()
            ->take(5)
            ->get();

        // Search Institutes
        $institutes = Institute::where('institute_name', 'LIKE', "%{$query}%")
            ->where('status', 'approved')
            ->latest()
            ->take(5)
            ->get();

        // Search Events
        $events = Event::with('institute')
            ->where('event_title', 'LIKE', "%{$query}%")
            ->where('is_active', true)
            ->latest()
            ->take(5)
            ->get();

        return response()->json([
            'posts' => $posts,
            'institutes' => $institutes,
            'events' => $events
        ]);
    }
}
