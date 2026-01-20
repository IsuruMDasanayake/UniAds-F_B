<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use App\Models\Institute;
use App\Models\Subscription;
use Stripe\Stripe;
use Stripe\Webhook;
use Carbon\Carbon;

class StripeWebhookController extends Controller
{
    public function handleWebhook(Request $request)
    {
        Stripe::setApiKey(config('services.stripe.secret'));

        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = config('services.stripe.webhook_secret');

        try {
            $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);

            Log::info("Stripe Webhook Received: {$event->type}");

            switch ($event->type) {

                case 'checkout.session.completed':
                    $session = $event->data->object;
                    $instituteId = $session->client_reference_id;
                    $subscriptionId = $session->subscription;

                    if (!$instituteId || !$subscriptionId) {
                        Log::error('Missing client_reference_id or subscription in checkout.session.completed');
                        break;
                    }

                    $institute = Institute::find($instituteId);
                    if (!$institute) {
                        Log::error("Institute not found for ID: $instituteId");
                        break;
                    }

                    $stripeSub = \Stripe\Subscription::retrieve($subscriptionId);

                    $periodEnd = Carbon::createFromTimestamp($stripeSub->current_period_end);
                    $isTrial = $stripeSub->trial_end && now()->lt(Carbon::createFromTimestamp($stripeSub->trial_end));

                    // 🔥 Check for an existing subscription row for this institute
                    $existingSubscription = Subscription::where('institute_id', $institute->id)
                        ->latest()
                        ->first();

                    if ($existingSubscription) {
                        // Update existing row instead of creating a new one
                        $existingSubscription->update([
                            'gateway_subscription_id' => $subscriptionId,
                            'plan' => 'monthly', // or detect dynamically
                            'is_trial' => $isTrial,
                            'status' => $stripeSub->status,
                            'started_at' => Carbon::createFromTimestamp($stripeSub->start_date),
                            'ends_at' => $periodEnd,
                            'cancelled_at' => null, // reset if previously cancelled
                        ]);
                    } else {
                        // If no record exists at all, create new
                        Subscription::create([
                            'institute_id' => $institute->id,
                            'gateway_subscription_id' => $subscriptionId,
                            'plan' => 'monthly',
                            'is_trial' => $isTrial,
                            'status' => $stripeSub->status,
                            'started_at' => Carbon::createFromTimestamp($stripeSub->start_date),
                            'ends_at' => $periodEnd,
                        ]);
                    }

                    // Update institute premium info
                    $institute->update([
                        'is_premium' => true,
                        'premium_expires_at' => $periodEnd,
                        'trial_status' => $isTrial ? 'active' : 'expired',
                        'trial_expires_at' => $isTrial ? Carbon::createFromTimestamp($stripeSub->trial_end) : null,
                    ]);

                    break;


                case 'invoice.payment_succeeded':
                    $invoice = $event->data->object;
                    $subscriptionId = $invoice->subscription ?? null;

                    if (!$subscriptionId) {
                        Log::error("❌ Subscription ID missing in invoice.payment_succeeded event. Full invoice payload: " . json_encode($invoice));
                        break;
                    }

                    $subscription = Subscription::where('gateway_subscription_id', $subscriptionId)->first();
                    if (!$subscription) {
                        Log::error("❌ Subscription not found for gateway_subscription_id: $subscriptionId");
                        break;
                    }

                    // Use Stripe invoice period end for accurate subscription end
                    $periodEnd = Carbon::createFromTimestamp($invoice->lines->data[0]->period->end);

                    $subscription->update([
                        'ends_at' => $periodEnd,
                        'status' => 'active',
                    ]);

                    $institute = $subscription->institute;
                    if ($institute) {
                        $institute->update([
                            'is_premium' => true,
                            'premium_expires_at' => $periodEnd,
                            'trial_status' => $institute->trial_status === 'active' ? 'expired' : $institute->trial_status,
                            'trial_expires_at' => null,
                        ]);
                        Log::info("✅ Institute premium extended: ID {$institute->id}");
                    }

                    break;

                default:
                    Log::info("Unhandled event type: {$event->type}");
                    break;
            }

            return response('Webhook handled', 200);

        } catch (\Exception $e) {
            Log::error("Stripe webhook error: " . $e->getMessage());
            return response('Webhook Error', 400);
        }
    }
}
