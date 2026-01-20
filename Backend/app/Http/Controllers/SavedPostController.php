<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\SavedPost;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use App\Models\User;

class SavedPostController extends Controller
{
    public function toggleSave($postId)
{
    $user = auth()->user();
    
    if (!$user) {
        return redirect()->route('login')->with('error', 'Please log in to save posts.');
    }

    $isSaved = $user->savedPosts()->where('post_id', $postId)->exists();

    if ($isSaved) {
        $user->savedPosts()->detach($postId);
        return response()->json(['status' => 'unsaved']);
    } else {
        $user->savedPosts()->attach($postId);
        return response()->json(['status' => 'saved']);
    }
}

public function viewSaved()
{
    $user = auth()->user();

    if (!$user || $user->role !== 'User') {
        abort(403, 'Unauthorized access.');
    }

    $posts = $user->savedPosts()->with('institute')->get();

    return view('frontend.saved-posts', compact('posts'));
}
}