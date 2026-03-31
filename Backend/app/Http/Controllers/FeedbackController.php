<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Feedback;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;
use App\Traits\ApiResponse;
use Mews\Purifier\Facades\Purifier;
use Illuminate\Support\Facades\DB;

class FeedbackController extends Controller
{
    use ApiResponse;
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
            return $this->error('Feedback already submitted');
        }

        return DB::transaction(function () use ($user, $validated) {
            $feedback = Feedback::create([
                'user_id' => $user->id,
                'role' => $user->role,
                'rating' => $validated['rating'],
                'message' => Purifier::clean($validated['message']),
                'status' => 'approved',
            ]);

            return $this->success($feedback, 'Feedback submitted successfully', 201);
        });
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

        return $this->success($feedbacks);
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
            return $this->success(['eligible' => false]);
        }

        // For Institutes, check if the account is > 90 days old
        if ($user->role === 'Institute') {
            $daysOld = $user->created_at->diffInDays(Carbon::now());
            if ($daysOld >= 90) {
                return $this->success(['eligible' => true]);
            }
            return $this->success(['eligible' => false]);
        }

        // Users are triggered directly from the application form process, 
        // so the frontend will just check if they haven't submitted one yet.
        return $this->success(['eligible' => true]);
    }

    /**
     * Admin: get all feedbacks
     */
    public function adminIndex(Request $request)
    {
        $feedbacks = Feedback::with('user:id,name,email,role')
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->success($feedbacks);
    }

    /**
     * Admin: Delete feedback
     */
    public function destroy($id)
    {
        return DB::transaction(function () use ($id) {
            $feedback = Feedback::findOrFail($id);
            $feedback->delete();

            return $this->success(null, 'Feedback deleted successfully');
        });
    }
}

