<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Institute;
use App\Models\Notification;
use App\Models\PendingRegistration;
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


        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'gender' => ['required', 'in:Male,Female'],
            'birthday' => ['required', 'date', 'before_or_equal:today'],
            'district' => ['required', 'string'],
            'education_level' => ['required', 'string'],
        ]);

        // FIX: Auth::login() and session()->regenerate() are SESSION side-effects
        // that must run OUTSIDE the DB transaction. If the transaction were to roll
        // back (e.g. AdminNotification insert fails), the session would already have
        // been written — leaving the user "logged in" with no corresponding DB row.
        $user = DB::transaction(function () use ($request) {
            try {
                $user = User::create([
                    'name'            => $request->name,
                    'email'           => $request->email,
                    'password'        => Hash::make($request->password),
                    'gender'          => $request->gender,
                    'birthday'        => $request->birthday,
                    'district'        => $request->district,
                    'education_level' => $request->education_level,
                    'role'            => 'User',
                ]);
            } catch (\Illuminate\Database\QueryException $e) {
                // Handle race condition where email is taken between validation and creation
                if ($e->getCode() == '23000' || str_contains($e->getMessage(), 'Duplicate entry')) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'email' => ['This email address is already registered. Please try logging in.'],
                    ]);
                }
                throw $e;
            }

            // Notify Admins about the new user registration
            $admins = User::where('role', 'Admin')->get();
            foreach ($admins as $admin) {
                AdminNotification::create([
                    'user_id' => $admin->id,
                    'type'    => 'new_user_registration',
                    'title'   => 'New User Registered',
                    'message' => "A new user \"{$user->name}\" has registered on the platform.",
                    'data'    => [
                        'user_id'   => $user->id,
                        'user_name' => $user->name,
                    ],
                ]);
            }

            event(new Registered($user));

            return $user;
        });

        // Send Welcome Email — queued so SMTP failure does not break registration
        try {
            Mail::to($user->email)->queue(new WelcomeUserMail($user));
        } catch (\Exception $e) {
            Log::error('Welcome email failed: ' . $e->getMessage());
        }

        // Session side-effects run AFTER the transaction has fully committed
        Auth::login($user);
        $request->session()->regenerate();

        return $this->success($user, 'Registration successful', 201);
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
            // Sanitize description before storing
            $payload = $request->all();
            if (!empty($payload['description'])) {
                $payload['description'] = Purifier::clean($payload['description']);
            }
            // Never persist the raw password — store only the hash so the DB record
            // is safe even if it somehow leaks.
            $payload['password'] = bcrypt($payload['password']);
            $payload['password_already_hashed'] = true;
            // Remove the confirmation field — not needed after validation
            unset($payload['password_confirmation']);

            // FIX: Store pending registration in the database instead of the PHP session.
            // Session storage is unsafe because:
            //   1. A second browser tab overwrites the session key, losing the first tab's data.
            //   2. Session drivers may flush under memory pressure before the user verifies.
            // The DB record is keyed by email (updateOrCreate), so a resend OTP request
            // from a second tab simply refreshes the TTL on the same record.
            PendingRegistration::upsertForEmail($request->email, 'Institute', $payload);

            // Send verification OTP using a custom method for guests
            $otpController = new EmailVerificationController();
            return $otpController->sendOTPGuest($request->email, $request);
        } catch (\Exception $e) {
            Log::error('Institute registration initiation failed: ' . $e->getMessage());
            return $this->error('Registration initiation failed. Please try again.', 500);
        }
    }
}

