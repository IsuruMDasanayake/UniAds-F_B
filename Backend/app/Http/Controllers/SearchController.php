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
                'is_share_link_match' => false,
            ]);
        }

        // Try to extract UUID if it's a full URL or contains a UUID
        $searchKey = $query;
        if (preg_match('/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i', $query, $matches)) {
            $searchKey = $matches[1];
        }

        // Check if the query matches a share_link (shareable post link)
        $sharePost = Post::with('institute')
            ->where('share_link', $searchKey)
            ->where('status', 'active')
            ->first();

        if ($sharePost) {
            return response()->json([
                'posts' => [$sharePost],
                'is_share_link_match' => true,
            ]);
        }

        // Normal title search
        $posts = Post::with('institute')
            ->where('title', 'LIKE', "%{$query}%")
            ->where('status', 'active')
            ->latest()
            ->paginate(15);

        return response()->json([
            'posts' => $posts,
            'is_share_link_match' => false,
        ]);
    }
}
