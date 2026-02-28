<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Models\Institute;
use App\Models\Follower;
use Illuminate\Support\Facades\Auth;
use App\Models\Category;
use App\Models\InstituteInquiry;


class ContactController extends Controller
{
    // showContactPage removed


    public function sendContactMessage(Request $request, $id)
    {
        $institute = is_numeric($id) ? Institute::findOrFail($id) : Institute::where('slug', $id)->firstOrFail();

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $mailData = [
            'institute' => $institute->institute_name,
            'name' => $request->name,
            'email' => $request->email,
            'subject' => $request->subject,
            'messageContent' => $request->message,
        ];

        Mail::send('emails.contact', $mailData, function ($mail) use ($institute, $request) {
            $mail->to($institute->email)
                ->subject('Contact Message: ' . $request->subject)
                ->from($request->email, $request->name);
        });

        return redirect()->back()->with('success', 'Your message has been sent to the institute.');
    }

    public function submitContactForm(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'message' => 'required|string',
        ]);

        $mailData = [
            'name' => $request->name,
            'email' => $request->email,
            'messageContent' => $request->message,
        ];

        Mail::send('emails.general_contact', $mailData, function ($mail) use ($request) {
            $mail->to('uniads.lk@gmail.com')
                ->subject('New Contact Message from ' . $request->name)
                ->from($request->email, $request->name);
        });

        return redirect()->back()->with('success', 'Your message has been sent successfully!');
    }

    public function apiSendContactMessage(Request $request, $id)
    {
        // Get the institute by ID or slug
        $institute = is_numeric($id) ? Institute::findOrFail($id) : Institute::where('slug', $id)->firstOrFail();
        $id = $institute->id; // Ensure we have the numeric ID for subsequent queries if needed

        // Store application in apply_cases table
        if (!$institute->inquiries_enabled) {
            return response()->json([
                'success' => false,
                'message' => 'General inquiries are currently disabled for this institute.'
            ], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email',
            'subject' => 'required|string|max:255',
            'message' => 'required|string',
        ]);

        $mailData = [
            'institute' => $institute->institute_name,
            'name' => $request->name,
            'email' => $request->email,
            'subject' => $request->subject,
            'messageContent' => $request->message,
        ];

        // Persist Inquiry
        InstituteInquiry::create([
            'institute_id' => $institute->id,
            'name' => $request->name,
            'email' => $request->email,
            'subject' => $request->subject,
            'message' => $request->message,
        ]);

        try {
            Mail::send('emails.contact', $mailData, function ($mail) use ($institute, $request) {
                $mail->to($institute->email)
                    ->subject('Contact Message: ' . $request->subject)
                    ->from($request->email, $request->name);
            });

            return response()->json([
                'success' => true,
                'message' => 'Your message has been sent to the institute.'
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to send message. Please try again.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
