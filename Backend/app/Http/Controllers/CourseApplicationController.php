<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Mail\CourseApplicationMail;
use Illuminate\Support\Facades\Mail;
use App\Models\Institute;
use App\Models\ApplyCase;
use App\Models\Post;
use Illuminate\Support\Facades\Auth;
use App\Models\Notification;
use Illuminate\Support\Facades\Log;
use App\Traits\ApiResponse;
use Mews\Purifier\Facades\Purifier;
use Illuminate\Support\Facades\DB;


class CourseApplicationController extends Controller
{
    use ApiResponse;


    public function apply(Request $request, $institute_id)
    {
        // Validate form data
        $validated = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email',
            'phone' => 'required|string',
            'message' => 'required|string',
            'course_title' => 'required|string',
            'post_id' => 'required|exists:posts,id',
            'privacy_consent' => 'accepted'
        ]);

        // Get the institute by ID or slug
        $institute = is_numeric($institute_id) ? Institute::findOrFail($institute_id) : Institute::where('slug', $institute_id)->firstOrFail();
        $institute_id = $institute->id; // Use numeric ID for subsequent queries

        // Check if applications are enabled
        if (!$institute->applications_enabled) {
            return $this->error('Course applications are currently disabled for this institute.', 403);
        }

        // Store application
        DB::beginTransaction();
        try {
            // Already applied check
            $alreadyApplied = ApplyCase::where('user_id', Auth::id())
                ->where('institute_id', $institute_id)
                ->where('course_title', $validated['course_title'])
                ->exists();

            if (!$alreadyApplied) {
                $application = ApplyCase::create([
                    'user_id'       => Auth::id(),
                    'institute_id'  => $institute_id,
                    'post_id'       => $validated['post_id'],
                    'course_title'  => $validated['course_title'],
                    'student_name'  => $validated['name'],
                    'student_email' => $validated['email'],
                    'student_phone' => $validated['phone'],
                    'message'       => Purifier::clean($validated['message']),
                    'status'        => 'new',
                    'applied_at'    => now(),
                ]);

                // Fetch post for notification details
                $post = Post::with('institute')->find($validated['post_id']);

                // Trigger Notification
                Notification::create([
                    'institute_id' => $institute_id,
                    'type' => 'application_new',
                    'title' => 'New Course Application',
                    'message' => $validated['name'] . ' applied for ' . $validated['course_title'],
                    'data' => [
                        'application_id' => $application->id,
                        'post_id' => $validated['post_id'],
                        'image' => $post ? $post->image : null
                    ]
                ]);

                // Send Emails
                $emailData = [
                    'name' => $validated['name'],
                    'email' => $validated['email'],
                    'phone' => $validated['phone'],
                    'message' => $validated['message'],
                    'course_title' => $validated['course_title']
                ];

                \Illuminate\Support\Facades\Mail::to($institute->email)
                    ->queue(new \App\Mail\CourseApplicationMail($emailData));

                $studentEmailData = array_merge($emailData, [
                    'institute_name' => $post->institute->institute_name ?? $institute->institute_name,
                ]);

                \Illuminate\Support\Facades\Mail::to($validated['email'])
                    ->queue(new \App\Mail\CourseApplicationStudentMail($studentEmailData));
            }

            DB::commit();
            return $this->success(null, 'Application sent successfully!');
        } catch (\Exception $e) {
            DB::rollBack();
            return $this->error('Failed to send application: ' . $e->getMessage(), 500);
        }
    }

    public function userApplications()
    {
        $user_id = Auth::id();
        
        $applications = ApplyCase::with(['institute:id,institute_name,slug,profile_photo,is_premium,applications_enabled,chat_enabled,contact_number', 'post:id,title,image,course_name,course_type,location,duration,course_format,attendance_type,description,share_link'])
            ->where('user_id', $user_id)
            ->latest('id')
            ->paginate(15);

        return $this->successResponse($applications);
    }
}
