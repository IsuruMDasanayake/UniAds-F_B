<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\PendingRegistration;
use App\Models\User;
use App\Models\Institute;
use App\Models\Notification;
use App\Models\AdminNotification;
use App\Mail\OTPVerificationMail;
use App\Mail\WelcomeInstituteMail;
use App\Mail\WelcomeUserMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Auth\Events\Registered;
use Carbon\Carbon;
use App\Traits\ApiResponse;

class EmailVerificationController extends Controller
{
    use ApiResponse;
    /**
     * Send OTP to the authenticated user's email.
     */
    public function sendOTP(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return $this->error('Unauthorized', 401);
        }

        return $this->sendOTPGuest($user->email, $request);
    }

    /**
     * Send OTP to a guest email (pre-registration).
     */
    public function sendOTPGuest($email, Request $request)
    {
        // Generate 6-digit OTP
        $otp = random_int(100000, 999999);

        // Store OTP in Cache (2 minutes TTL)
        Cache::put("otp_verification:{$email}", $otp, 120);

        // Backup in session as fallback for now
        session([
            'verification_email' => $email
        ]);

        try {
            Mail::to($email)->queue(new OTPVerificationMail($otp));

            // Explicitly save session to ensure persistence in API context
            $request->session()->save();
        } catch (\Exception $e) {
            Log::error('Mail sending failed: ' . $e->getMessage());
            return $this->error('Failed to send verification email. Please try again.', 500);
        }

        return $this->success(['verification_required' => true], 'Verification code sent to your email.');
    }

    /**
     * Verify the provided OTP.
     */
    public function verifyOTP(Request $request)
    {
        $request->validate([
            'otp' => 'required|numeric',
        ]);

        $email = $request->email ?? session('verification_email');
        
        if (!$email) {
            return $this->error('Missing email address for verification.', 422);
        }

        $cachedOtp = Cache::get("otp_verification:{$email}");

        if (!$cachedOtp) {
            return $this->error('Verification code has expired or was not found. Please request a new one.', 422);
        }

        // Anti-Brute Force: Track attempts for this specific OTP
        $attemptsKey = "otp_attempts:{$email}";
        $attempts = Cache::get($attemptsKey, 0);

        if ($attempts >= 5) {
            $this->clearOTPCache($email);
            return $this->error('Too many incorrect attempts. Please request a new verification code for security purposes.', 429);
        }

        if ((int)$request->otp !== (int)$cachedOtp) {
            Cache::put($attemptsKey, $attempts + 1, 120);
            
            $remaining = 5 - ($attempts + 1);
            $msg = 'The verification code you entered is incorrect.';
            if ($remaining > 0) {
                $msg .= " You have {$remaining} attempts remaining.";
            }

            return $this->error($msg, 422);
        }

        // Clear attempts on success
        Cache::forget($attemptsKey);

        // Handle Pending Registration
        // FIX: Read from the DB-backed pending_registrations table, not the PHP session.
        // The session approach was unsafe across multiple tabs and unreliable under memory pressure.
        $pendingRegistration = PendingRegistration::findValidByEmail($email);
        if ($pendingRegistration) {
            return $this->processPendingRegistration(
                $pendingRegistration->data,
                $pendingRegistration->type,
                $request
            );
        }

        // Handle regular authenticated user verification
        $user = Auth::user();
        if (!$user && $email) {
            $user = User::where('email', $email)->first();
        }

        if ($user) {
            $user->email_verified_at = now();
            $user->save();

            $this->clearOTPCache($email);

            return $this->success(['redirect' => '/feed'], 'Email verified successfully!');
        }

        return $this->error('User not found or session expired', 404);
    }

    /**
     * Process pending registration after successful OTP verification.
     */
    private function processPendingRegistration(array $data, string $type, Request $request)
    {
        try {
            DB::beginTransaction();

            // Create User
            // NOTE: The password stored in $data may already be hashed (bcrypt) if it was
            // pre-hashed before being written to the pending_registrations table.
            // Check the flag to avoid double-hashing, which would make the password invalid.
            $password = !empty($data['password_already_hashed'])
                ? $data['password']
                : Hash::make($data['password']);

            $user = User::create([
                'name'     => $data['institute_name'] ?? ($data['name'] ?? 'User'),
                'email'    => $data['email'],
                'password' => $password,
                'role'     => $type,
            ]);

            $user->email_verified_at = now();
            $user->save();

            // Create Institute if applicable
            if ($type === 'Institute') {
                $institute = Institute::create([
                    'user_id' => $user->id,
                    'institute_name' => $data['institute_name'],
                    'institute_type' => $data['institute_type'],
                    'email' => $data['email'],
                    'location' => $data['location'],
                    'contact_number' => $data['contact_number'],
                    'gov_register_number' => $data['gov_register_number'] ?? null,
                    'website' => $data['website'] ?? null,
                    'bio' => $data['description'] ?? null,
                ]);

                // Welcome Notification
                Notification::create([
                    'institute_id' => $institute->id,
                    'type' => 'system',
                    'title' => 'Welcome to UniAds!',
                    'message' => 'Congratulations on joining our platform! Your profile is pending approval.',
                ]);

                // Notify Admins
                $admins = User::where('role', 'Admin')->get();
                foreach ($admins as $admin) {
                    AdminNotification::create([
                        'user_id' => $admin->id,
                        'type' => 'new_institute_registration',
                        'title' => 'New Institute Registered',
                        'message' => "A new institute \"{$institute->institute_name}\" has registered.",
                    ]);
                }

                // Welcome Email
                try {
                    Mail::to($user->email)->queue(new WelcomeInstituteMail($institute));
                } catch (\Exception $e) {
                    Log::error('Welcome email failed: ' . $e->getMessage());
                }
            } else {
                // Regular User Welcome Email
                try {
                    Mail::to($user->email)->queue(new WelcomeUserMail($user));
                } catch (\Exception $e) {
                    Log::error('Welcome email failed: ' . $e->getMessage());
                }
            }

            event(new Registered($user));
            DB::commit();

            // Clear OTP cache and the pending_registrations DB record on success
            $this->clearOTPCache($data['email']);
            PendingRegistration::clearForEmail($data['email']);

            Auth::login($user);
            $request->session()->regenerate();

            return $this->success([
                'user' => $user,
                'redirect' => '/feed'
            ], 'Account created and email verified successfully!');

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Post-verification registration failed: ' . $e->getMessage());
            return $this->error('Verification succeeded but account creation failed. Please contact support.', 500);
        }
    }

    /**
     * Resend the OTP.
     */
    public function resendOTP(Request $request)
    {
        // Try to get email from Auth, Session, or Request
        $email = Auth::user() ? Auth::user()->email : (session('verification_email') ?: $request->email);

        // Standardized response to prevent email enumeration. 
        // We always return success as long as a valid email format is provided,
        // suggesting that "if" the account exists, a code was sent.
        if (!$email || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            return $this->success(['verification_required' => true], 'If the email provided is valid and registered, a new verification code has been sent.');
        }

        return $this->sendOTPGuest($email, $request);
    }

    /**
     * Clear OTP related data from Cache and Session.
     */
    private function clearOTPCache($email)
    {
        Cache::forget("otp_verification:{$email}");
        Cache::forget("otp_attempts:{$email}");
        session()->forget([
            'verification_email'
        ]);
    }
}

