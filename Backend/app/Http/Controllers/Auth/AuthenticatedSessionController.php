<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Providers\RouteServiceProvider;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\View\View;

use App\Services\AdminActivityLogger;

class AuthenticatedSessionController extends Controller
{
    // create removed


    /**
     * Handle an incoming authentication request.
     */
    public function store(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required|min:6',
        ]);

        // Manual authentication for SPA (cookie-based)
        if (!Auth::attempt($request->only('email', 'password'))) {
            return response()->json([
                'message' => 'Invalid credentials'
            ], 422);
        }

        $user = Auth::user();

        // Log Admin Login
        if ($user->role === 'Admin') {
            AdminActivityLogger::log(
                'Logged In',
                'User',
                $user->id,
                "Administrator {$user->name} logged into the system."
            );
        }

        // Regenerate session for security (prevents session fixation)
        $request->session()->regenerate();

        // Create a Sanctum token for API authentication
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful',
            'user' => $user,
            'token' => $token,
        ]);
    }




    // destroy removed


    /**
     * Destroy an authenticated session via API.
     */
    public function apiLogout(Request $request)
    {
        $user = Auth::user();

        // Log Admin Logout
        if ($user && $user->role === 'Admin') {
            AdminActivityLogger::log(
                'Logged Out',
                'User',
                $user->id,
                "Administrator {$user->name} logged out of the dashboard."
            );
        }

        // Standard Laravel logout logic for API/Sanctum
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out successfully']);
    }

    /**
     * Destroy all authenticated sessions via API (Logout from all devices).
     */
    public function apiLogoutAllDevices(Request $request)
    {
        $user = Auth::user();

        // Revoke all personal access tokens
        if ($user) {
            $user->tokens()->delete();

            // Log Admin Logout All Devices
            if ($user->role === 'Admin') {
                AdminActivityLogger::log(
                    'Logged Out (All Devices)',
                    'User',
                    $user->id,
                    "Administrator {$user->name} logged out from all devices."
                );
            }
        }

        // Standard Laravel logout logic for API/Sanctum
        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json(['message' => 'Logged out from all devices successfully']);
    }
}
