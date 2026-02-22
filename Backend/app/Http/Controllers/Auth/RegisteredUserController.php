<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Institute;
use App\Models\Notification;
use App\Models\AdminNotification;
use App\Providers\RouteServiceProvider;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rules;
use Illuminate\View\View;

class RegisteredUserController extends Controller
{
    // create removed


    /**
     * Handle an incoming registration request.
     *
     * @throws \Illuminate\Validation\ValidationException
     */
    public function store(Request $request)
    {
        if (User::where('email', $request->email)->exists()) {
            if ($request->wantsJson()) {
                return response()->json([
                    'message' => 'The email has already been taken.',
                    'errors' => ['email' => ['The email has already been taken.']]
                ], 422);
            }
            return back()->withInput()->with('email_exists', true);
        }

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'gender' => ['required', 'in:Male,Female'],
            'birthday' => ['required', 'date', 'before_or_equal:today'],
            'district' => ['required', 'string'],
            'education_level' => ['required', 'string'],
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'gender' => $request->gender,
            'birthday' => $request->birthday,
            'district' => $request->district,
            'education_level' => $request->education_level,
            'role' => 'User',
        ]);

        // Notify Admins about the new user registration
        $admins = User::where('role', 'Admin')->get();
        foreach ($admins as $admin) {
            AdminNotification::create([
                'user_id' => $admin->id,
                'type' => 'new_user_registration',
                'title' => 'New User Registered',
                'message' => "A new user \"{$user->name}\" has registered on the platform.",
                'data' => [
                    'user_id' => $user->id,
                    'user_name' => $user->name
                ]
            ]);
        }

        event(new Registered($user));

        // Login user with session (cookie-based)
        Auth::login($user);
        $request->session()->regenerate();

        return response()->json([
            'message' => 'Registration successful',
            'user' => $user,
        ], 201);
    }

    /**
     * Handle an incoming institute registration request.
     */
    public function storeInstitute(Request $request)
    {
        $request->validate([
            // Institute fields
            'institute_name' => ['required', 'string', 'max:255'],
            'institute_type' => ['required', 'string', 'in:University,Higher Education Institute,College,Institute,Training Center,Vocational Training Center,Technical Institute,Professional Institute,Academy,Government Institute,International Institute'],
            'email' => ['required', 'email', 'unique:users,email'],
            'location' => ['required', 'string'],
            'contact_number' => ['required', 'string'],
            'gov_register_number' => ['nullable', 'string'],
            'website' => ['nullable', 'url'],
            'description' => ['nullable', 'string', 'max:1000'],  // Maps to bio column
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
        ]);

        try {
            DB::beginTransaction();

            // Create User with Institute role (use institute_name as user name)
            $user = User::create([
                'name' => $request->institute_name,  // Use institute name as user name
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'Institute',
            ]);

            // Create Institute linked to User
            $institute = Institute::create([
                'user_id' => $user->id,
                'institute_name' => $request->institute_name,
                'institute_type' => $request->institute_type,
                'email' => $request->email,
                'location' => $request->location,
                'contact_number' => $request->contact_number,
                'gov_register_number' => $request->gov_register_number,
                'website' => $request->website,
                'bio' => $request->description,  // Map description to bio column
            ]);

            // Trigger Welcome Notification
            Notification::create([
                'institute_id' => $institute->id,
                'type' => 'system',
                'title' => 'Welcome to UniAds!',
                'message' => 'Congratulations on joining our platform! You can now start posting courses and events to reach more students.',
                'data' => [
                    'welcome' => true
                ]
            ]);

            // Notify Admins about the new registration
            $admins = User::where('role', 'Admin')->get();
            foreach ($admins as $admin) {
                AdminNotification::create([
                    'user_id' => $admin->id,
                    'type' => 'new_institute_registration',
                    'title' => 'New Institute Registered',
                    'message' => "A new institute \"{$request->institute_name}\" has registered and is pending approval.",
                    'data' => [
                        'institute_id' => $institute->id,
                        'institute_name' => $request->institute_name
                    ]
                ]);
            }

            event(new Registered($user));

            DB::commit();

            // Login user with session (cookie-based)
            Auth::login($user);
            $request->session()->regenerate();

            return response()->json([
                'message' => 'Institute registration successful',
                'user' => $user,
                'institute' => $institute,
            ], 201);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Registration failed. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
