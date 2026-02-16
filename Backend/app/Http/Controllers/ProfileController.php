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

    // edit removed





    // update removed (use apiUpdate)


    // updatePassword removed (use apiUpdatePassword)



    public function destroy()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        if ($user->profile_picture) {
            Storage::delete('public/' . $user->profile_picture);
        }
        $user->delete();

        return response()->json(['message' => 'Account deleted successfully.']);
    }






    // show removed


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
            $rules = [
                'name' => 'required|string|max:255',
                'gender' => 'required|in:Male,Female',
                'birthday' => 'required|date|before_or_equal:today',
                'district' => 'required|string',
                'education_level' => 'required|string',
            ];

            // Relax validation for Admin role
            if ($user->role === 'Admin') {
                $rules['gender'] = 'nullable|in:Male,Female';
                $rules['birthday'] = 'nullable|date|before_or_equal:today';
                $rules['district'] = 'nullable|string';
                $rules['education_level'] = 'nullable|string';
            }

            $request->validate($rules);

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
