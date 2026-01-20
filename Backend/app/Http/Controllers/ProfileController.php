<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use App\Models\Institute;
use App\Models\Category;
use App\Models\Post;
use App\Models\Event;
use App\Models\Follower;


class ProfileController extends Controller
{

    public function edit()
    {
        $user = Auth::user();
        $categories = Category::all();
        $posts = collect(); // Default empty collection for posts
        $events = collect(); // Default empty collection for events
        $instituteId = Auth::user();

        // Check if the logged-in user is an institute
        if ($user->role === 'Institute') {
            $institute = Institute::where('email', $user->email)->first();

            // Get posts and events for the institute
            // Use paginate() for posts and events
            $posts = $institute->posts()->latest()->paginate(10); // 10 posts per page
            $events = $institute->events()->where('is_active', true)->latest()->paginate(10); // 10 events per page

            return view('frontend.profile.institute-edit', compact('institute', 'posts', 'events', 'categories'));
        }

        // Normal user profile view - no posts or events
        return view('frontend.profile.user-edit', compact('user', 'posts', 'events'));
    }




    public function update(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->role === 'Institute') {
            // Institute-specific update logic
            $request->validate([
                'institute_name' => 'required|string|max:255',
                'location' => 'nullable|string|max:255',
                'email' => 'required|email|unique:users,email,' . $user->id,
                'bio' => 'nullable|string|max:255',
                'profile_photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
                'cover_photo' => 'nullable|image|mimes:jpeg,png,jpg|max:2048',
            ]);

            $institute = Institute::where('email', $user->email)->first();
            $institute->update($request->only(['institute_name', 'location', 'bio']));

            if ($request->hasFile('profile_photo')) {
                if ($institute->profile_photo) {
                    Storage::delete('public/' . $institute->profile_photo);
                }
                $institute->profile_photo = $request->file('profile_photo')->store('profile_photos', 'public');
            }

            if ($request->hasFile('cover_photo')) {
                if ($institute->cover_photo) {
                    Storage::delete('public/' . $institute->cover_photo);
                }
                $institute->cover_photo = $request->file('cover_photo')->store('cover_photos', 'public');
            }

            $institute->save();
        } else {
            // Normal user-specific update logic
            $request->validate([
                'name' => 'required|string|max:255',
                'email' => 'required|email|unique:users,email,' . $user->id,
                'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg|max:4096',
            ]);

            $user->update($request->only(['name', 'email']));

            if ($request->hasFile('profile_picture')) {
                // Delete old profile picture from storage if exists
                if ($user->profile_picture && Storage::exists('public/' . $user->profile_picture)) {
                    Storage::delete('public/' . $user->profile_picture);
                }

                // Store the new profile picture
                $path = $request->file('profile_picture')->store('profile_pictures', 'public');
                $user->profile_picture = $path; // Save the path in the database
            }

            $user->save();
        }

        return redirect()->route('profile.edit')->with('success', 'Profile updated successfully.');
    }

    public function updatePassword(Request $request)
    {
        // Validate input fields
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|confirmed|min:8',
        ]);

        // If validation fails, return errors
        if ($validator->fails()) {
            return back()->withErrors($validator)->withInput();
        }

        // Check if the current password matches the logged-in user's password
        if (!Hash::check($request->current_password, Auth::user()->password)) {
            // If the current password is wrong
            return back()->withErrors(['current_password' => 'The current password is incorrect.'])->withInput();
        }

        // Check if new password and confirm password match
        if ($request->new_password !== $request->new_password_confirmation) {
            // If new password and confirmation do not match
            return back()->withErrors(['new_password' => 'The new password and confirmation password do not match.'])->withInput();
        }

        // Update password
        $user = Auth::user();
        $user->password = Hash::make($request->new_password);
        $user->save();

        // Redirect with success message
        return back()->with('success', 'Password updated successfully!');
    }


    public function destroy()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if ($user->profile_picture) {
            Storage::delete('public/' . $user->profile_picture);
        }
        $user->delete();

        return redirect()->route('home')->with('success', 'Account deleted successfully.');
    }






    public function show($id)
    {
        $institute = Institute::findOrFail($id);

        $isFollowing = false;
        if (auth()->check() && auth()->user()->role !== 'Institute') {
            $isFollowing = Follower::where('user_id', auth()->id())
                ->where('institute_id', $id)
                ->exists();
        }

        return view('frontend.profile.institute-view', compact('institute', 'isFollowing'));
    }

    public function apiEdit()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $categories = Category::all();

        $data = [
            'user' => $user,
            'role' => $user->role,
        ];

        // Check if the logged-in user is an institute
        if ($user->role === 'Institute') {
            $institute = Institute::where('email', $user->email)->first();

            // Get posts and events for the institute
            $posts = $institute->posts()->latest()->paginate(10);
            $events = $institute->events()->where('is_active', true)->latest()->paginate(10);

            $data['institute'] = $institute;
            $data['posts'] = $posts;
            $data['events'] = $events;
            $data['categories'] = $categories;

            // [NEW] Fetch About Section
            $aboutSection = \App\Models\AboutSection::where('institute_id', $institute->id)->first();
            $data['about'] = $aboutSection;
        } else {
            // Load savedPosts for User
            $user->load('savedPosts');
            $data['savedPosts'] = $user->savedPosts;
        }

        return response()->json($data);
    }

    public function apiUpdate(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        if ($user->role === 'Institute') {
            $request->validate([
                'institute_name' => 'required|string|max:255',
                'location' => 'nullable|string|max:255',
                'bio' => 'nullable|string|max:1000',
            ]);

            $institute = Institute::where('email', $user->email)->first();
            $institute->update($request->only(['institute_name', 'location', 'bio']));
            $institute->save();
        } else {
            $request->validate([
                'name' => 'required|string|max:255',
                'gender' => 'required|in:Male,Female',
                'birthday' => 'required|date|before_or_equal:today',
                'district' => 'required|string',
                'education_level' => 'required|string',
            ]);

            $user->update($request->only(['name', 'gender', 'birthday', 'district', 'education_level']));
            $user->save();
        }

        return response()->json([
            'message' => 'Profile updated successfully',
            'user' => $user->fresh($user->role === 'Institute' ? 'institute' : 'savedPosts')
        ]);
    }

    public function apiUpdatePassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'current_password' => 'required|string',
            'new_password' => 'required|string|confirmed|min:8',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        if (!Hash::check($request->current_password, Auth::user()->password)) {
            return response()->json(['errors' => ['current_password' => ['The current password is incorrect.']]], 422);
        }

        $user = Auth::user();
        $user->password = Hash::make($request->new_password);
        $user->save();

        return response()->json(['message' => 'Password updated successfully!']);
    }
    public function apiUpdatePicture(Request $request)
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();

        $request->validate([
            'profile_picture' => 'required|image|mimes:jpeg,png,jpg,gif|max:4096',
        ]);

        if ($request->hasFile('profile_picture')) {
            // Delete old profile picture if exists
            if ($user->profile_picture && Storage::disk('public')->exists($user->profile_picture)) {
                Storage::disk('public')->delete($user->profile_picture);
            }

            // Store new picture
            $path = $request->file('profile_picture')->store('profile_pictures', 'public');
            $user->profile_picture = $path;
            $user->save();

            return response()->json([
                'message' => 'Profile picture updated successfully',
                'profile_picture' => $path
            ]);
        }

        return response()->json(['message' => 'No file uploaded'], 400);
    }
}
