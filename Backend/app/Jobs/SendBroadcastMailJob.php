<?php

namespace App\Jobs;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Mail;
use App\Mail\BroadcastMail as BroadcastMailable;
use Illuminate\Support\Facades\Log;

class SendBroadcastMailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public $title;
    public $message;
    public $recipientEmail;
    public $recipientName;

    /**
     * Create a new job instance.
     */
    public function __construct($title, $message, $recipientEmail, $recipientName)
    {
        $this->title = $title;
        $this->message = $message;
        $this->recipientEmail = $recipientEmail;
        $this->recipientName = $recipientName;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        try {
            Mail::to($this->recipientEmail)->send(
                new BroadcastMailable($this->title, $this->message, $this->recipientName)
            );
        } catch (\Exception $e) {
            Log::error('Broadcast mail failed: ' . $e->getMessage(), [
                'email' => $this->recipientEmail,
                'title' => $this->title
            ]);

            // Optionally re-throw to retry
            throw $e;
        }
    }

    /**
     * The number of times the job may be attempted.
     */
    public $tries = 3;

    /**
     * The number of seconds to wait before retrying the job.
     */
    public $backoff = 60;
}
