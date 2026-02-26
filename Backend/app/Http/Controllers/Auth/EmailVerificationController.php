<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Institute;
use App\Models\Notification;
use App\Models\AdminNotification;
use App\Mail\OTPVerificationMail;
use App\Mail\WelcomeInstituteMail;
use App\Mail\WelcomeUserMail;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Auth\Events\Registered;
use Carbon\Carbon;

class EmailVerificationController extends Controller
{
    /**
     * Send OTP to the authenticated user's email.
     */
    public function sendOTP(Request $request)
    {
        $user = Auth::user();

        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        return $this->sendOTPGuest($user->email, $request);
    }

    /**
     * Send OTP to a guest email (pre-registration).
     */
    public function sendOTPGuest($email, Request $request)
    {
        // Generate 6-digit OTP
        $otp = rand(100000, 999999);

        // Store OTP and timestamp in session
        session([
            'verification_otp' => $otp,
            'verification_otp_time' => now(),
            'verification_email' => $email
        ]);

        try {
            Mail::to($email)->send(new OTPVerificationMail($otp));

            // Explicitly save session to ensure persistence in API context
            $request->session()->save();
        } catch (\Exception $e) {
            Log::error('Mail sending failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send verification email. Please try again.'
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Verification code sent to your email.',
            'verification_required' => true
        ]);
    }

    /**
     * Verify the provided OTP.
     */
    public function verifyOTP(Request $request)
    {
        $request->validate([
            'otp' => 'required|numeric',
        ]);

        $sessionOtp = session('verification_otp');
        $otpTime = session('verification_otp_time');
        $email = session('verification_email');

        if (!$sessionOtp || !$otpTime) {
            return response()->json([
                'success' => false,
                'message' => 'No verification code found. Please request a new one.'
            ], 422);
        }

        // Check expiration (2 minutes)
        if (now()->diffInMinutes($otpTime) >= 2) {
            $this->clearOTPSession();
            return response()->json([
                'success' => false,
                'message' => 'The verification code has expired.'
            ], 422);
        }

        if ($request->otp != $sessionOtp) {
            return response()->json([
                'success' => false,
                'message' => 'Invalid verification code.'
            ], 422);
        }

        // Handle Pending Registration
        if (session()->has('pending_registration')) {
            return $this->processPendingRegistration(session('pending_registration'), $request);
        }

        // Handle regular authenticated user verification
        $user = Auth::user();
        if (!$user && $email) {
            $user = User::where('email', $email)->first();
        }

        if ($user) {
            $user->email_verified_at = now();
            $user->save();

            $this->clearOTPSession();

            return response()->json([
                'success' => true,
                'message' => 'Email verified successfully!',
                'redirect' => '/feed'
            ]);
        }

        return response()->json(['message' => 'User not found or session expired'], 404);
    }

    /**
     * Process pending registration after successful OTP verification.
     */
    private function processPendingRegistration($data, Request $request)
    {
        try {
            DB::beginTransaction();

            // Create User
            $user = User::create([
                'name' => $data['institute_name'] ?? ($data['name'] ?? 'User'),
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
                'role' => session('pending_registration_type', 'User'),
            ]);

            $user->email_verified_at = now();
            $user->save();

            // Create Institute if applicable
            if (session('pending_registration_type') === 'Institute') {
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
                    Mail::to($user->email)->send(new WelcomeInstituteMail($institute));
                } catch (\Exception $e) {
                    Log::error('Welcome email failed: ' . $e->getMessage());
                }
            } else {
                // Regular User Welcome Email
                try {
                    Mail::to($user->email)->send(new WelcomeUserMail($user));
                } catch (\Exception $e) {
                    Log::error('Welcome email failed: ' . $e->getMessage());
                }
            }

            event(new Registered($user));
            DB::commit();

            // Clear session and log user in
            $this->clearOTPSession();
            session()->forget(['pending_registration', 'pending_registration_type']);

            Auth::login($user);
            $request->session()->regenerate();

            return response()->json([
                'success' => true,
                'message' => 'Account created and email verified successfully!',
                'redirect' => '/feed',
                'user' => $user
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Post-verification registration failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Verification succeeded but account creation failed. Please contact support.',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Resend the OTP.
     */
    public function resendOTP(Request $request)
    {
        // Try to get email from Auth, Session, or Request
        $email = Auth::user() ? Auth::user()->email : (session('verification_email') ?: $request->email);

        if (!$email) {
            Log::warning('Resend OTP failed: No email found in session or request.', [
                'session_all' => session()->all(),
                'request_has_email' => $request->has('email')
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Session expired. Please try registering again.'
            ], 422);
        }

        return $this->sendOTPGuest($email, $request);
    }

    /**
     * Clear OTP related session data.
     */
    private function clearOTPSession()
    {
        session()->forget([
            'verification_otp',
            'verification_otp_time',
            'verification_email'
        ]);
    }
}
