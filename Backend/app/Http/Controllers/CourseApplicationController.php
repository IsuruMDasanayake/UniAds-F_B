<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Mail\CourseApplicationMail;
use Illuminate\Support\Facades\Mail;
use App\Models\Institute;
use App\Models\ApplyCase;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;

class CourseApplicationController extends Controller
{   

    public function showCategories()
{
    $posts = Post::with('institute')->get(); // eager load institute
    return view('frontend.categories', compact('posts'));
}



    public function apply(Request $request, $institute_id)
{
    // Validate form data
    $validated = $request->validate([
        'name' => 'required|string',
        'email' => 'required|email',
        'phone' => 'required|string',
        'message' => 'required|string',
        'course_title' => 'required|string',
    ]);

    // Get the institute by ID
    $institute = Institute::findOrFail($institute_id);

    // Send the mail to institute
    Mail::to($institute->email)->send(new CourseApplicationMail($validated));

    // Store application in apply_cases table
    $alreadyApplied = ApplyCase::where('user_id', Auth::id())
        ->where('institute_id', $institute_id)
        ->where('course_title', $request->course_title)
        ->exists();

    if (! $alreadyApplied) {
        ApplyCase::create([
            'user_id' => Auth::id(),
            'institute_id' => $institute_id,
            'course_title' => $request->course_title,
            'post_id' => $request->post_id, // Assuming post_id is passed in the request
            'applied_at' => now(),
        ]);
    }

    // If AJAX request, return JSON
    if ($request->expectsJson()) {
        return response()->json(['message' => 'Application sent successfully!']);
    }

    return back()->with('success', 'Your application has been sent successfully.');
}

}
