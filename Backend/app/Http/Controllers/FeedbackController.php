<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Feedback;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class FeedbackController extends Controller
{
    /**
     * Store new feedback
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'message' => 'nullable|string|max:1000',
        ]);

        $user = Auth::user();

        // Check if the user has already submitted feedback
        $existing = Feedback::where('user_id', $user->id)->first();
        if ($existing) {
            return response()->json(['message' => 'Feedback already submitted'], 400);
        }

        $feedback = Feedback::create([
            'user_id' => $user->id,
            'role' => $user->role,
            'rating' => $validated['rating'],
            'message' => $validated['message'],
            'status' => 'approved',
        ]);

        return response()->json([
            'message' => 'Feedback submitted successfully',
            'feedback' => $feedback
        ], 201);
    }

    /**
     * Get approved feedback for public display (e.g., HomePage)
     */
    public function getPublicFeedbacks()
    {
        // Get 10 latest approved feedbacks that have a message
        $feedbacks = Feedback::with('user:id,name,role,profile_picture')
            ->where('status', 'approved')
            ->whereNotNull('message')
            ->where('message', '!=', '')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get();

        return response()->json($feedbacks);
    }

    /**
     * Check if the authenticated user is eligible to see the feedback modal
     */
    public function checkEligibility(Request $request)
    {
        $user = Auth::user();

        // Has the user already submitted feedback?
        $hasFeedback = Feedback::where('user_id', $user->id)->exists();
        if ($hasFeedback) {
            return response()->json(['eligible' => false]);
        }

        // For Institutes, check if the account is > 90 days old
        if ($user->role === 'Institute') {
            $daysOld = $user->created_at->diffInDays(Carbon::now());
            if ($daysOld >= 90) {
                return response()->json(['eligible' => true]);
            }
            return response()->json(['eligible' => false]);
        }

        // Users are triggered directly from the application form process, 
        // so the frontend will just check if they haven't submitted one yet.
        return response()->json(['eligible' => true]);
    }

    /**
     * Admin: get all feedbacks
     */
    public function adminIndex(Request $request)
    {
        $feedbacks = Feedback::with('user:id,name,email,role')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($feedbacks);
    }

    /**
     * Admin: Delete feedback
     */
    public function destroy($id)
    {
        $feedback = Feedback::findOrFail($id);
        $feedback->delete();

        return response()->json(['message' => 'Feedback deleted successfully']);
    }
}
