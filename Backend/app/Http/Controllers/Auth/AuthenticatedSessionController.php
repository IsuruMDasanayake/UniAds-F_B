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
    /**
     * Display the login view.
     */
    public function create(): View
    {
        return view('auth.login');
    }

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




    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        $user = Auth::user();
        $userRole = $user?->role;
        $userName = $user?->name;

        // Log Admin Logout
        if ($userRole === 'Admin' && $user) {
            AdminActivityLogger::log(
                'Logged Out',
                'User',
                $user->id,
                "Administrator {$userName} logged out of the dashboard."
            );
        }

        // Log out the current user
        Auth::logout();

        // Invalidate the current session and regenerate the session ID
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        // Redirect based on the user's role
        if ($userRole === 'Admin') {
            // Redirect to the admin login page
            return redirect('/')->with('message', 'Logged out successfully as Admin.');
        }

        // Redirect other users to the default login page
        return redirect('/')->with('message', 'Logged out successfully.');
    }

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
}
