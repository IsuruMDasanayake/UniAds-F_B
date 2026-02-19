<?php

namespace App\Http\Controllers;

use App\Models\InstituteInquiry;
use App\Models\ContactedEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class InquiryController extends Controller
{
    /**
     * Display a listing of the inquiries for the authenticated institute.
     */
    public function index(Request $request)
    {
        $instituteId = $request->user()->institute->id;

        $query = InstituteInquiry::where('institute_id', $instituteId);

        // Filters
        if ($request->has('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        if ($request->has('search') && $request->search) {
            $searchTerm = '%' . $request->search . '%';
            $query->where(function ($q) use ($searchTerm) {
                $q->where('name', 'like', $searchTerm)
                    ->orWhere('subject', 'like', $searchTerm)
                    ->orWhere('email', 'like', $searchTerm);
            });
        }

        $inquiries = $query->latest()->paginate(10);

        // Stats
        $stats = [
            'total' => InstituteInquiry::where('institute_id', $instituteId)->count(),
            'new' => InstituteInquiry::where('institute_id', $instituteId)->where('status', 'new')->count(),
            'this_month' => InstituteInquiry::where('institute_id', $instituteId)
                ->whereMonth('created_at', now()->month)
                ->count(),
        ];

        return response()->json([
            'inquiries' => $inquiries,
            'stats' => $stats
        ]);
    }

    /**
     * Mark an inquiry as viewed.
     */
    public function markAsViewed($id)
    {
        $instituteId = Auth::user()->institute->id;
        $inquiry = InstituteInquiry::where('institute_id', $instituteId)->findOrFail($id);

        if ($inquiry->status === 'new') {
            $inquiry->update([
                'status' => 'viewed',
                'viewed_at' => now()
            ]);
        }

        return response()->json([
            'success' => true,
            'inquiry' => $inquiry
        ]);
    }

    /**
     * Send a reply to an inquiry.
     */
    public function sendReply(Request $request, $id)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $institute = Auth::user()->institute;
        $inquiry = InstituteInquiry::where('institute_id', $institute->id)->findOrFail($id);

        DB::beginTransaction();
        try {
            // 1. Save to inquiry_communications
            $reply = \App\Models\InquiryCommunication::create([
                'institute_id' => $institute->id,
                'institute_inquiry_id' => $inquiry->id,
                'subject' => $request->subject,
                'message' => $request->message,
                'sent_at' => now(),
            ]);

            // 2. Update inquiry status
            $inquiry->update([
                'status' => 'contacted',
                'contacted_at' => now()
            ]);

            // 3. Send Email
            $mailData = [
                'student_name' => $inquiry->name,
                'institute_name' => $institute->institute_name,
                'subject' => $request->subject,
                'messageContent' => $request->message,
            ];

            Mail::send('emails.inquiry_reply', $mailData, function ($mail) use ($inquiry, $request, $institute) {
                $mail->to($inquiry->email)
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
}
