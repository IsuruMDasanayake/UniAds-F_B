<?php

namespace App\Http\Controllers;

use App\Models\ApplyCase;
use App\Models\ContactedEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\DB;

class ApplicationController extends Controller
{
    /**
     * Display a listing of the applications (Admin).
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function apiIndex(Request $request)
    {
        $query = ApplyCase::with(['user', 'institute', 'post']);

        // Search functionality
        if ($request->has('search') && $request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('course_title', 'like', "%{$search}%")
                    ->orWhereHas('user', function ($q) use ($search) {
                        $q->where('name', 'like', "%{$search}%")
                            ->orWhere('email', 'like', "%{$search}%");
                    })
                    ->orWhereHas('institute', function ($q) use ($search) {
                        $q->where('institute_name', 'like', "%{$search}%");
                    });
            });
        }

        // Filter by Institute
        if ($request->has('institute_id') && $request->institute_id && $request->institute_id !== 'all') {
            $query->where('institute_id', $request->institute_id);
        }

        // Sort by latest applied_at or created_at
        $query->orderBy('applied_at', 'desc');

        $applications = $query->paginate(15);

        return response()->json($applications);
    }

    /**
     * Display a listing of the applications (Institute).
     */
    public function index(Request $request)
    {
        $instituteId = $request->user()->institute->id;

        $query = ApplyCase::with('post:id,title,image')
            ->where('institute_id', $instituteId);

        // Filters
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $searchTerm = '%' . $request->search . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('student_name', 'like', $searchTerm)
                    ->orWhere('course_title', 'like', $searchTerm);
            });
        }

        $applications = $query->latest('applied_at')->paginate(10);

        // Stats for cards
        $stats = [
            'total' => ApplyCase::where('institute_id', $instituteId)->count(),
            'new' => ApplyCase::where('institute_id', $instituteId)->where('status', 'new')->count(),
            'contacted' => ApplyCase::where('institute_id', $instituteId)->where('status', 'contacted')->count(),
            'this_month' => ApplyCase::where('institute_id', $instituteId)
                ->whereMonth('applied_at', now()->month)
                ->count(),
        ];

        return response()->json([
            'applications' => $applications,
            'stats' => $stats
        ]);
    }

    public function show($id)
    {
        $instituteId = Auth::user()->institute->id;
        $application = ApplyCase::with(['post', 'contactedEmails'])
            ->where('institute_id', $instituteId)
            ->findOrFail($id);

        return response()->json($application);
    }

    public function markAsViewed($id)
    {
        $instituteId = Auth::user()->institute->id;
        $application = ApplyCase::where('institute_id', $instituteId)->findOrFail($id);

        if ($application->status === 'new') {
            $application->update([
                'status' => 'viewed',
                'viewed_at' => now()
            ]);
        }

        return response()->json(['success' => true, 'application' => $application]);
    }

    public function sendReply(Request $request, $id)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $institute = Auth::user()->institute;
        $application = ApplyCase::where('institute_id', $institute->id)->findOrFail($id);

        DB::beginTransaction();
        try {
            // 1. Save to contacted_emails
            $reply = ContactedEmail::create([
                'apply_case_id' => $application->id,
                'institute_id' => $institute->id,
                'student_email' => $application->student_email,
                'subject' => $request->subject,
                'message' => $request->message,
                'sent_at' => now(),
            ]);

            // 2. Update application status
            $application->update([
                'status' => 'contacted',
                'contacted_at' => now()
            ]);

            // 3. Send Email
            $mailData = [
                'student_name' => $application->student_name,
                'institute_name' => $institute->institute_name,
                'subject' => $request->subject,
                'messageContent' => $request->message,
            ];

            Mail::send('emails.application_reply', $mailData, function ($mail) use ($application, $request, $institute) {
                $mail->to($application->student_email)
                    ->subject('[No-Reply] ' . $request->subject)
                    ->from($institute->email, $institute->institute_name);
            });

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Reply sent successfully!',
                'reply' => $reply
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to send reply.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
    public function communicationsHistory(Request $request)
    {
        $instituteId = $request->user()->institute->id;

        $history = ContactedEmail::with('applyCase:id,course_title')
            ->where('institute_id', $instituteId)
            ->latest('sent_at')
            ->get();

        return response()->json($history);
    }
}
