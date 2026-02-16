<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rating;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class RatingsController extends Controller
{
    public function apiIndex($id)
    {
        $ratings = Rating::where('institute_id', $id)
            ->with('user:id,name,profile_picture')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($ratings);
    }

    public function apiRate(Request $request, $id)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ]);

        $rating = Rating::updateOrCreate(
            ['user_id' => auth()->id(), 'institute_id' => $id],
            ['rating' => $request->rating, 'comment' => $request->comment]
        );

        return response()->json([
            'message' => 'Thank you for your feedback!',
            'rating' => $rating->load('user:id,name,profile_picture')
        ]);
    }

    public function apiDelete($id)
    {
        $review = Rating::findOrFail($id);

        if (Auth::id() !== $review->user_id && Auth::user()->role !== 'Admin') {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $review->delete();
        return response()->json(['message' => 'Review deleted successfully.']);
    }

    public function storeRating(Request $request, $id)
    {
        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'nullable|string|max:500',
        ]);

        $rating = Rating::updateOrCreate(
            ['user_id' => auth()->id(), 'institute_id' => $id],
            ['rating' => $request->rating, 'comment' => $request->comment]
        );

        return redirect()->back()->with('success', 'Thank you for your feedback!');
    }

    public function deleteReview($id)
    {
        $review = Rating::findOrFail($id);
        if (Auth::id() === $review->user_id) {
            $review->delete();
            return back()->with('success', 'Review deleted.');
        }
        return back()->with('error', 'Unauthorized');
    }


    public function report(Request $request, $id)
    {
        $request->validate([
            'report_reason' => 'required|string|max:500',
        ]);

        $rating = Rating::findOrFail($id);

        // Prevent multiple reports
        if ($rating->is_reported) {
            return response()->json(['message' => 'This comment has already been reported.'], 400);
        }

        $rating->update([
            'is_reported' => true,
            'report_reason' => $request->report_reason,
        ]);

        return response()->json(['message' => 'Report submitted successfully.']);
    }


    public function adminDelete($id)
    {
        $rating = Rating::findOrFail($id);
        $rating->delete();
        return back()->with('success', 'Review deleted successfully.');
    }

    // ==========================================
    // API METHODS FOR ADMIN DASHBOARD
    // ==========================================

    public function apiAdminIndex()
    {
        $ratings = Rating::with(['user', 'institute'])->orderBy('created_at', 'desc')->get();
        return response()->json($ratings);
    }
}
