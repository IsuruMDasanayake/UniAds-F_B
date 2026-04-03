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
use App\Traits\ApiResponse;

class FrontendController extends Controller
{
    use ApiResponse;
    // profile removed

    // feed removed

    // institutions removed

    // showInstitutions removed

    // courses removed

    // courselist removed

    /**
     * API endpoint for feed data
     */
    public function feedApi()
    {
        $userId = auth()->id();
        $user = auth()->user();

        $posts = Post::with(['institute', 'likes'])
            ->where('status', 'active')
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

        // Inject liked/saved booleans (standardized logic)
        if ($userId && $posts->count() > 0) {
            $postIds = $posts->pluck('id')->toArray();
            $likedPostIds = \App\Models\PostLike::where('user_id', $userId)->whereIn('post_id', $postIds)->pluck('post_id')->toArray();
            $savedPostIds = \App\Models\SavedPost::where('student_id', $userId)->whereIn('post_id', $postIds)->pluck('post_id')->toArray();

            $posts->transform(function($post) use ($likedPostIds, $savedPostIds) {
                // Security: Hide sensitive institute/user data
                if ($post->institute) {
                    $post->institute->makeHidden(['email', 'contact_number', 'gov_register_number', 'status', 'trial_status', 'followers_count']);
                }
                $post->is_liked_by_user = in_array($post->id, $likedPostIds);
                $post->is_saved_by_user = in_array($post->id, $savedPostIds);
                return $post;
            });
        } else {
            $posts->transform(function($post) {
                if ($post->institute) {
                    $post->institute->makeHidden(['email', 'contact_number', 'gov_register_number', 'status', 'trial_status', 'followers_count']);
                }
                $post->is_liked_by_user = false;
                $post->is_saved_by_user = false;
                return $post;
            });
        }

        // Performance: Fix N+1 for Event Interests
        if ($userId && $events->count() > 0) {
            $eventIds = $events->pluck('id')->toArray();
            $interestedEventIds = EventUserInterest::where('user_id', $userId)
                ->whereIn('event_id', $eventIds)
                ->pluck('event_id')
                ->toArray();
            
            $events->transform(function ($event) use ($interestedEventIds) {
                $event->is_interested = in_array($event->id, $interestedEventIds);
                if ($event->institute) {
                    $event->institute->makeHidden(['email', 'contact_number', 'gov_register_number', 'status', 'trial_status', 'followers_count']);
                }
                return $event;
            });
        } else {
            $events->transform(function ($event) {
                $event->is_interested = false;
                if ($event->institute) {
                    $event->institute->makeHidden(['email', 'contact_number', 'gov_register_number', 'status', 'trial_status', 'followers_count']);
                }
                return $event;
            });
        }

        return $this->success([
            'posts' => $posts,
            'categories' => $categories,
            'events' => $events,
        ]);
    }
}

