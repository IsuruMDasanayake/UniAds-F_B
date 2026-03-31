<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Institute;
use App\Models\Notification;
use App\Models\AdminNotification;
use App\Providers\RouteServiceProvider;
use App\Http\Controllers\Auth\EmailVerificationController;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\Rules;
use App\Mail\WelcomeUserMail;
use App\Mail\WelcomeInstituteMail;
use Illuminate\View\View;
use App\Traits\ApiResponse;
use Mews\Purifier\Facades\Purifier;

class RegisteredUserController extends Controller
{
    use ApiResponse;
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
                return $this->error('The email has already been taken.', 422, ['email' => ['The email has already been taken.']]);
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

        return DB::transaction(function () use ($request) {
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

            // Send Welcome Email to User
            try {
                Mail::to($user->email)->send(new WelcomeUserMail($user));
            } catch (\Exception $e) {
                Log::error('Welcome email failed: ' . $e->getMessage());
            }

            // Login user with session (cookie-based)
            Auth::login($user);
            $request->session()->regenerate();

            return $this->success($user, 'Registration successful', 201);
        });
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
            // Sanitize description
            if ($request->has('description')) {
                $request->merge(['description' => Purifier::clean($request->description)]);
            }

            // Store pending registration data in session
            session([
                'pending_registration' => $request->all(),
                'pending_registration_type' => 'Institute'
            ]);

            // Ensure session is saved before returning
            session()->save();

            // Send verification OTP using a custom method for guests
            $otpController = new EmailVerificationController();
            return $otpController->sendOTPGuest($request->email, $request);
        } catch (\Exception $e) {
            return $this->error('Registration initiation failed. Please try again.', 500);
        }
    }
}

