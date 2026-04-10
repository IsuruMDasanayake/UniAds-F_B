<?php

namespace App\Mail;

use App\Models\Institute;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Queue\SerializesModels;

use Illuminate\Contracts\Queue\ShouldQueue;

class InstituteUnapprovedMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public $institute;
    public $platformSettings;

    /**
     * Create a new message instance.
     *
     * @param Institute $institute
     */
    public function __construct(Institute $institute)
    {
        $this->institute = $institute;
        $this->platformSettings = \App\Models\PlatformSetting::getInstance();
    }

    /**
     * Build the message.
     *
     * @return $this
     */
    public function build()
    {
        return $this->subject('Important: Your Institute Account Status Update')
            ->view('emails.institute_unapproved')
            ->with([
                'platformSettings' => $this->platformSettings,
            ]);
    }
}
