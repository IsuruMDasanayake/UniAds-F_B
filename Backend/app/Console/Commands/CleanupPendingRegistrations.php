<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PendingRegistration;
use Illuminate\Support\Facades\Log;

class CleanupPendingRegistrations extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'registrations:cleanup';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Remove expired pending registrations from the database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting pending registrations cleanup...');
        
        try {
            $count = PendingRegistration::where('expires_at', '<', now())->delete();
            
            $this->info("Successfully removed {$count} expired pending registrations.");
            Log::info("CleanupPendingRegistrations: Removed {$count} records.");
            
            return Command::SUCCESS;
        } catch (\Exception $e) {
            $this->error('Cleanup failed: ' . $e->getMessage());
            Log::error('CleanupPendingRegistrations Error: ' . $e->getMessage());
            return Command::FAILURE;
        }
    }
}
