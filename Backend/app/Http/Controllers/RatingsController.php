<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Rating;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;
use App\Models\Institute;
use App\Models\Notification;
use App\Models\User;

class RatingsController extends Controller
{
    public function apiIndex($id)
    {
        $institute = is_numeric($id) ? Institute::findOrFail($id) : Institute::where('slug', $id)->firstOrFail();
        $ratings = Rating::where('institute_id', $institute->id)
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

        $institute = is_numeric($id) ? Institute::findOrFail($id) : Institute::where('slug', $id)->firstOrFail();

        $rating = Rating::updateOrCreate(
            ['user_id' => auth()->id(), 'institute_id' => $institute->id],
            ['rating' => $request->rating, 'comment' => $request->comment]
        );

        // Trigger Notification
        Notification::create([
            'institute_id' => $institute->id,
            'user_id' => auth()->id(),
            'type' => 'review_new',
            'title' => 'New Review Received',
            'message' => auth()->user()->name . " gave you a {$request->rating}-star review.",
            'data' => [
                'rating_id' => $rating->id,
                'rating' => $request->rating
            ]
        ]);

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

        $institute = is_numeric($id) ? Institute::findOrFail($id) : Institute::where('slug', $id)->firstOrFail();

        $rating = Rating::updateOrCreate(
            ['user_id' => auth()->id(), 'institute_id' => $institute->id],
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

        // Trigger Notification for reported review
        Notification::create([
            'institute_id' => $rating->institute_id,
            'type' => 'review_reported',
            'title' => 'Review Reported',
            'message' => "A review has been reported for: {$request->report_reason}",
            'data' => [
                'rating_id' => $rating->id,
                'reason' => $request->report_reason
            ]
        ]);

        // Notify Admins
        $admins = User::where('role', 'Admin')->get();
        foreach ($admins as $admin) {
            Notification::create([
                'user_id' => $admin->id,
                'institute_id' => null, // Admin notification
                'type' => 'review_reported',
                'title' => 'Review Reported',
                'message' => "A review for {$rating->institute->institute_name} has been reported.",
                'data' => [
                    'rating_id' => $rating->id,
                    'institute_id' => $rating->institute_id,
                    'reason' => $request->report_reason
                ]
            ]);
        }

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
