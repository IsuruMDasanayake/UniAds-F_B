<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use App\Mail\PasswordResetMail;

class ForgotPasswordController extends Controller
{
    // Show the form to request a reset code
    public function showLinkRequestForm()
    {
        return view('auth.forgot-password');
    }

    // Send the reset code to the user's email
    public function sendResetCode(Request $request)
    {
        // Validate the email input
        $request->validate(['email' => 'required|email|exists:users,email']);

        // Store the email in session
        session(['email' => $request->email]);

        // Generate a random reset code
        $resetCode = rand(100000, 999999);

        // Store the reset code and its timestamp in the session
        session(['reset_code' => $resetCode, 'reset_code_time' => now()]);

        // Send the reset code via email
        $user = User::where('email', $request->email)->first();
        try {
            Mail::to($user->email)->send(new PasswordResetMail($resetCode));
        } catch (\Exception $e) {
            \Log::error('Mail sending failed: ' . $e->getMessage());
            return back()->withErrors(['email' => 'Failed to send email. Please try again.']);
        }

        // Redirect to confirm the reset code form
        return redirect()->route('confirm.passwordForm')->with('status', 'A reset code has been sent to your email!');
    }

    // API version - Send the reset code to the user's email (returns JSON)
    public function apiSendResetCode(Request $request)
    {
        // Validate the email input
        $request->validate(['email' => 'required|email|exists:users,email']);

        // Store the email in session
        session(['email' => $request->email]);

        // Generate a random reset code
        $resetCode = rand(100000, 999999);

        // Store the reset code and its timestamp in the session
        session(['reset_code' => $resetCode, 'reset_code_time' => now()]);

        // Send the reset code via email
        $user = User::where('email', $request->email)->first();
        try {
            Mail::to($user->email)->send(new PasswordResetMail($resetCode));
        } catch (\Exception $e) {
            \Log::error('Mail sending failed: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Failed to send email. Please try again.'
            ], 500);
        }

        // Return JSON response for API
        return response()->json([
            'success' => true,
            'message' => 'A reset code has been sent to your email!'
        ]);
    }

    // Show the form to reset the password
    public function showResetForm()
    {
        return view('auth.forgot-password');
    }

    // Handle password reset
    public function resetPassword(Request $request)
    {
        // Validate the reset code and the new password
        $request->validate([
            'reset_code' => 'required|integer',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Check if the entered reset code matches the one in session and if it hasn't expired
        if (now()->diffInMinutes(session('reset_code_time')) > 2) {
            session()->forget('reset_code');
            session()->forget('reset_code_time');
            return back()->withErrors(['reset_code' => 'The reset code has expired.']);
        }

        // Check if the entered reset code matches the one in session
        if ($request->reset_code != session('reset_code')) {
            return back()->withErrors(['reset_code' => 'The reset code is invalid.']);
        }

        // Retrieve the user based on the email stored in the session
        $user = User::where('email', session('email'))->first();

        if (!$user) {
            return back()->withErrors(['email' => 'No user found with that email address.']);
        }

        // Update the user's password
        $user->password = Hash::make($request->password);
        $user->save();

        // Clear the reset code from the session after resetting the password
        session()->forget('reset_code');
        session()->forget('reset_code_time');
        session()->forget('email'); // Clear the email from session

        // Redirect to the home page with a success message
        return redirect()->route('home')->with('status', 'Your password has been successfully reset!');
    }

    // API version - Handle password reset (returns JSON)
    public function apiResetPassword(Request $request)
    {
        // Validate the reset code and the new password
        $request->validate([
            'reset_code' => 'required|integer',
            'password' => 'required|string|min:8|confirmed',
        ]);

        // Check if the entered reset code matches the one in session and if it hasn't expired
        if (now()->diffInMinutes(session('reset_code_time')) > 2) {
            session()->forget('reset_code');
            session()->forget('reset_code_time');
            return response()->json([
                'success' => false,
                'message' => 'The reset code has expired.'
            ], 422);
        }

        // Check if the entered reset code matches the one in session
        if ($request->reset_code != session('reset_code')) {
            return response()->json([
                'success' => false,
                'message' => 'The reset code is invalid.'
            ], 422);
        }

        // Retrieve the user based on the email stored in the session
        $user = User::where('email', session('email'))->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'No user found with that email address.'
            ], 404);
        }

        // Update the user's password
        $user->password = Hash::make($request->password);
        $user->save();

        // Clear the reset code from the session after resetting the password
        session()->forget('reset_code');
        session()->forget('reset_code_time');
        session()->forget('email');

        // Return JSON response for API
        return response()->json([
            'success' => true,
            'message' => 'Your password has been successfully reset!'
        ]);
    }

    // Show the form to confirm the reset code
    public function showConfirmForm()
    {
        return view('auth.reset-password');
    }
}
