<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class CourseApplicationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $data; // To hold the application data

    public function __construct($data)
    {
        $this->data = $data;
    }

    public function build()
    {
        return $this->subject('New Course Application: ' . $this->data['course_title'])
                    ->view('emails.course_application');
    }
}

