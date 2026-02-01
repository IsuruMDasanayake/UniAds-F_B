<?php

namespace App\Mail;

use App\Models\Institute;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

class InstituteUnapprovedMail extends Mailable
{
    use Queueable, SerializesModels;

    public $institute;

    /**
     * Create a new message instance.
     *
     * @param Institute $institute
     */
    public function __construct(Institute $institute)
    {
        $this->institute = $institute;
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('Important: Your Institute Account Status Update')
            ->view('emails.institute_unapproved');
    }
}
