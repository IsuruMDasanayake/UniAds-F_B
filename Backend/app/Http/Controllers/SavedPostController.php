<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SavedPost;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Traits\ApiResponse;

class SavedPostController extends Controller
{
    use ApiResponse;

    public function toggleSave($postId)
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        if (!$user) {
            return $this->error('Please log in to save posts.', 401);
        }

        $isSaved = $user->savedPosts()->where('post_id', $postId)->exists();

        if ($isSaved) {
            $user->savedPosts()->detach($postId);
            return $this->success(['status' => 'unsaved']);
        } else {
            $user->savedPosts()->attach($postId);
            return $this->success(['status' => 'saved']);
        }
    }

    public function viewSaved()
    {
        /** @var \App\Models\User $user */
        $user = auth()->user();

        if (!$user || $user->role !== 'User') {
            abort(403, 'Unauthorized access.');
        }

        $posts = $user->savedPosts()->with('institute')->get();

        return view('frontend.saved-posts', compact('posts'));
    }
}