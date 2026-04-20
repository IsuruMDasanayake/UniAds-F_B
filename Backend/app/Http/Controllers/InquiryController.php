<?php

namespace App\Http\Controllers;

use App\Models\InstituteInquiry;
use App\Models\ContactedEmail;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use App\Services\InstituteActivityLogger;
use App\Traits\ApiResponse;

class InquiryController extends Controller
{
    use ApiResponse;
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

        return $this->success([
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

        return $this->success([
            'inquiry' => $inquiry
        ], 'Inquiry marked as viewed');
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

            Mail::queue('emails.inquiry_reply', $mailData, function ($mail) use ($inquiry, $request, $institute) {
                $mail->to($inquiry->email)
                    ->subject('[No-Reply] ' . $request->subject)
                    ->from($institute->email, $institute->institute_name);
            });

            InstituteActivityLogger::log(
                'Inquiry Replied',
                "Replied to inquiry from {$inquiry->name} regarding \"{$inquiry->subject}\"",
                'Application', // Grouping with applications since it's a student lead
                'InstituteInquiry',
                $inquiry->id
            );

            DB::commit();

            return $this->success($reply, 'Reply sent successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to send reply: ' . $e->getMessage(), 500);
        }
    }
}
