<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Notification;
use App\Models\Subscription;
use App\Models\Institute;
use App\Models\Event;
use Carbon\Carbon;

class SendScheduledNotifications extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'notifications:send-scheduled';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Send scheduled notifications for upcoming events and expiring subscriptions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $today = Carbon::today();
        $threeDaysFromNow = Carbon::today()->addDays(3)->toDateString();
        $tomorrow = Carbon::today()->addDays(1)->toDateString();

        // 1. Subscription Expiry (3 days reminder)
        $expiringSubscriptions = Subscription::where('ends_at', $threeDaysFromNow)
            ->where('status', 'active')
            ->get();

        foreach ($expiringSubscriptions as $sub) {
            Notification::create([
                'institute_id' => $sub->institute_id,
                'type' => 'subscription_expiring',
                'title' => 'Subscription Expiring Soon',
                'message' => 'Your ' . ucfirst($sub->plan) . ' plan will expire in 3 days. Please renew to keep your premium features.',
                'data' => [
                    'expiry_date' => $sub->ends_at,
                    'plan' => $sub->plan
                ]
            ]);
        }

        // 2. Trial Expiry (3 days reminder)
        $expiringTrials = Institute::where('trial_expires_at', $threeDaysFromNow)
            ->where('trial_status', 'active')
            ->get();

        foreach ($expiringTrials as $institute) {
            Notification::create([
                'institute_id' => $institute->id,
                'type' => 'trial_expiring',
                'title' => 'Trial Period Expiring',
                'message' => 'Your premium trial period will end in 3 days. Upgrade to a paid plan to avoid losing access.',
                'data' => [
                    'expiry_date' => $institute->trial_expires_at
                ]
            ]);
        }

        // 3. Upcoming Events (24 hours reminder)
        $upcomingEvents = Event::whereDate('event_date', $tomorrow)->get();

        foreach ($upcomingEvents as $event) {
            Notification::create([
                'institute_id' => $event->institute_id,
                'type' => 'event_starting',
                'title' => 'Event Starting Tomorrow',
                'message' => 'Your event "' . $event->event_title . '" is scheduled for tomorrow. Check your preparations!',
                'data' => [
                    'event_id' => $event->id,
                    'event_title' => $event->event_title,
                    'event_date' => $event->event_date,
                    'image' => $event->event_image
                ]
            ]);
        }

        $this->info('Scheduled notifications processed successfully.');
    }
}
