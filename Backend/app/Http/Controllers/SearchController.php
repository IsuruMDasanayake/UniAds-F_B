<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Event;
use App\Models\Institute;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;


use App\Traits\ApiResponse;

class SearchController extends Controller
{
    use ApiResponse;


    public function search(Request $request)
    {
        $query = trim($request->input('query'));

        if ($query === '') {
            return redirect()->back()->with('error', 'Please enter a search term.');
        }

        // Use Scout/Meilisearch for searching and sorting
        $posts = Post::search($query)
            ->query(function ($builder) {
                // Eager load the institute relation for blade rendering
                $builder->with('institute');
            })
            ->orderBy('score_cache', 'desc')
            ->orderBy('created_at', 'desc')
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
            return $this->success([
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
            ->where('created_at', '>=', now()->subDays(60))
            ->first();

        if ($sharePost) {
            return $this->successResponse([
                'posts' => [$sharePost],
                'is_share_link_match' => true,
            ]);
        }

        // Normal search using Meilisearch!
        $posts = Post::search($query)
            ->where('status', 'active')
            ->where('created_at', '>=', now()->subDays(60)->timestamp)
            ->orderBy('is_premium_active', 'desc')
            ->orderBy('score_cache', 'desc')
            ->orderBy('created_at', 'desc')
            ->query(function ($builder) {
                $builder->with('institute');
            })
            ->paginate(15);

        return $this->successResponse([
            'posts' => $posts,
            'is_share_link_match' => false,
        ]);
    }
}
