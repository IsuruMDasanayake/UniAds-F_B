<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;

use App\Models\Message;
use App\Models\Conversation;
use Carbon\Carbon;

class DeleteOldMessages extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'chat:cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Delete chat messages older than 30 days and cleanup empty conversations';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting chat cleanup...');

        // 1. Delete messages older than 30 days
        $expiryDate = Carbon::now()->subDays(30);
        $deletedMessagesCount = Message::where('created_at', '<', $expiryDate)->delete();

        $this->info("Deleted {$deletedMessagesCount} messages older than 30 days.");

        // 2. Delete conversations with no messages
        $deletedConversationsCount = Conversation::doesntHave('messages')->delete();

        $this->info("Deleted {$deletedConversationsCount} empty conversations.");

        $this->info('Chat cleanup completed successfully.');
    }
}
