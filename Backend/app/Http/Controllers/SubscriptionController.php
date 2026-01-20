<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subscription;
use App\Models\Institute;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;

class SubscriptionController extends Controller
{
    // --- API Methods ---

    public function apiShowPricing()
    {
        $user = auth()->user();
        if ($user->role !== 'Institute') {
            return response()->json(['error' => 'Unauthorized access.'], 403);
        }

        $institute = $user->institute;
        if (!$institute) {
            return response()->json(['error' => 'No institute found for user.'], 404);
        }

        // Check if trial has expired and update status if necessary
        if ($institute->trial_status === 'active' && $institute->trial_expires_at && now()->gte($institute->trial_expires_at)) {
            $institute->update([
                'trial_status' => 'expired',
                'is_premium' => false,
                'premium_expires_at' => null // Or keep it if you want to show when it expired
            ]);
        }

        // Check if premium expired
        if ($institute->is_premium && $institute->premium_expires_at && now()->gte($institute->premium_expires_at)) {
            $institute->update(['is_premium' => false]);
        }


        $activeSubscription = Subscription::where('institute_id', $institute->id)
            ->latest()
            ->first();

        $status = 'subscribe'; // Default

        if ($institute->trial_status === 'active') {
            $status = 'trial_active';
        } elseif ($institute->is_premium) {
            // Check if subscription was cancelled but is still valid (premium not expired)
            if ($activeSubscription && $activeSubscription->status === 'cancelled') {
                $status = 'cancelled_but_valid';
            } else {
                $status = 'active';
            }
        } elseif ($institute->trial_status === 'not_used') {
            $status = 'trial_available';
        } else {
            $status = 'subscribe';
        }

        // Refine status based on subscription if needed, but the above covers the main states
        // If subscription is cancelled but time remains, is_premium should still be true

        return response()->json([
            'status' => $status,
            'institute' => $institute,
            'activeSubscription' => $activeSubscription,
            'trial_expires_at' => $institute->trial_expires_at,
            'premium_expires_at' => $institute->premium_expires_at,
            'trial_status' => $institute->trial_status
        ]);
    }

    public function apiStartTrial(Request $request)
    {
        $user = auth()->user();
        if ($user->role !== 'Institute') {
            return response()->json(['error' => 'Unauthorized access.'], 403);
        }

        $institute = $user->institute;
        if (!$institute) {
            return response()->json(['error' => 'Institute not found.'], 404);
        }

        if ($institute->trial_status !== 'not_used') {
            return response()->json(['error' => 'Trial already used or active.'], 400);
        }

        $trialDays = 30;
        $institute->update([
            'trial_status' => 'active',
            'trial_expires_at' => now()->addDays($trialDays),
            'is_premium' => true,
            'premium_expires_at' => now()->addDays($trialDays),
        ]);

        return response()->json(['message' => 'Trial started successfully.', 'institute' => $institute]);
    }


    public function apiInitiatePayment(Request $request)
    {
        $user = auth()->user();
        if ($user->role !== 'Institute') {
            return response()->json(['error' => 'Unauthorized access.'], 403);
        }

        $institute = $user->institute;
        if (!$institute) {
            return response()->json(['error' => 'Institute not found.'], 404);
        }

        $type = $request->input('type'); // 'subscription' or 'trial'

        if ($type === 'trial') {
            if ($institute->trial_status !== 'not_used') {
                return response()->json(['error' => 'Trial already used.'], 400);
            }
            $amount = 100.00;
            $items = "UniAds Free Trial";
            $orderIdPrefix = "TRIAL-";
        } else {
            $amount = 4990.00;
            $items = "UniAds Premium Subscription - Monthly";
            $orderIdPrefix = "SUB-";
        }

        // Generate unique order ID
        $orderId = $orderIdPrefix . $institute->id . "-" . time();

        // Payment details
        $merchantId = env("PAYHERE_MERCHANT_ID");
        $merchantSecret = env("PAYHERE_MERCHANT_SECRET");
        $amountFormatted = number_format($amount, 2, ".", "");
        $currency = "LKR";

        // Generate hash
        // Hash = strtoupper(md5(merchant_id + order_id + amount + currency + strtoupper(md5(merchant_secret))))
        $hash = strtoupper(
            md5(
                $merchantId .
                    $orderId .
                    $amountFormatted .
                    $currency .
                    strtoupper(md5($merchantSecret))
            )
        );

        $paymentData = [
            "sandbox" => env("PAYHERE_SANDBOX", true),
            "merchant_id" => $merchantId,
            "return_url" => env("FRONTEND_URL", "http://localhost:5173") . "/pricing?success=1",
            "cancel_url" => env("FRONTEND_URL", "http://localhost:5173") . "/pricing?cancelled=1",
            "notify_url" => url("/api/payment/notify"), // This must be publicly accessible in prod
            "order_id" => $orderId,
            "items" => $items,
            "amount" => $amountFormatted,
            "currency" => $currency,
            "hash" => $hash,
            "first_name" => $user->name,
            "last_name" => "Institute", // Or add separate fields
            "email" => $user->email,
            "phone" => $institute->contact_number ?? "0000000000",
            "address" => $institute->address ?? "Sri Lanka",
            "city" => "Colombo", // Default or fetch
            "country" => "Sri Lanka",
        ];

        return response()->json([
            "success" => true,
            "payment_data" => $paymentData,
            "order_id" => $orderId
        ]);
    }

    public function apiPaymentNotify(Request $request)
    {
        $merchantId = env("PAYHERE_MERCHANT_ID");
        $merchantSecret = env("PAYHERE_MERCHANT_SECRET");

        $orderId = $request->order_id; // SUB-{id}-{time}
        $paymentId = $request->payment_id;
        $amount = $request->payhere_amount;
        $currency = $request->payhere_currency;
        $statusCode = $request->status_code;
        $md5sig = $request->md5sig;

        // Verify Hash
        $localMd5sig = strtoupper(
            md5(
                $merchantId .
                    $orderId .
                    $amount .
                    $currency .
                    $statusCode .
                    strtoupper(md5($merchantSecret))
            )
        );

        if ($localMd5sig === $md5sig && $statusCode == 2) {
            Log::info("PayHere Payment successful", [
                "order_id" => $orderId,
                "payment_id" => $paymentId,
            ]);

            // Extract Institute ID from Order ID
            // Format: SUB-{institute_id}-{time}
            $parts = explode('-', $orderId);
            $instituteId = $parts[1] ?? null;

            if ($instituteId) {
                $institute = Institute::find($instituteId);
                if ($institute) {
                    // Check type
                    $parts = explode('-', $orderId);
                    $orderType = $parts[0] ?? 'SUB'; // Default to SUB if not present, though explode should work

                    if ($orderType === 'TRIAL') {
                        // Activate Trial
                        $institute->update([
                            'trial_status' => 'active',
                            'trial_expires_at' => now()->addDays(30),
                            'is_premium' => true,
                            'premium_expires_at' => now()->addDays(30),
                        ]);
                    } else {
                        // Create Subscription Record
                        Subscription::create([
                            'institute_id' => $institute->id,
                            'gateway_subscription_id' => $paymentId, // Use PayHere payment ID
                            'plan' => 'monthly',
                            'status' => 'active',
                            'started_at' => now(),
                            'ends_at' => now()->addDays(30),
                            'is_trial' => false,
                        ]);

                        // Update Institute
                        $institute->update([
                            'is_premium' => true,
                            'premium_expires_at' => now()->addDays(30),
                            // 'trial_status' => 'expired' // Optionally expire trial if they subscribe? User said "After 30 days... then subscribe visible". So trial usually used up.
                        ]);
                    }
                }
            }

            return response()->json(["status" => "success"]);
        } else {
            Log::error("PayHere Payment verification failed", [
                "order_id" => $orderId,
                "status_code" => $statusCode
            ]);

            return response()->json(["status" => "failed"], 400);
        }
    }

    public function apiCancelSubscription(Request $request)
    {
        $user = auth()->user();
        if ($user->role !== 'Institute') {
            return response()->json(['error' => 'Unauthorized access.'], 403);
        }

        $institute = $user->institute;
        if (!$institute) {
            return response()->json(['error' => 'Institute not found.'], 404);
        }

        // 1. Try to find the Active Subscription in DB
        $subscription = Subscription::where('institute_id', $institute->id)
            ->where('status', 'active')
            ->latest()
            ->first();

        if ($subscription) {
            $subscription->update([
                'status' => 'cancelled',
                'cancelled_at' => now(),
            ]);
            // Premium benefits remain until premium_expires_at
            return response()->json(['message' => 'Subscription cancelled successfully.']);
        }

        // 2. Fallback: If no active subscription is found, but the user IS premium
        // This handles cases where data might be inconsistent (e.g. manual approval, or old data)
        if ($institute->is_premium && $institute->premium_expires_at && now()->lt($institute->premium_expires_at)) {
            // Create a placeholder "cancelled" subscription so the UI validates the state
            Subscription::create([
                'institute_id' => $institute->id,
                'gateway_subscription_id' => 'MANUAL-CANCEL-' . time(),
                'plan' => 'monthly',
                'status' => 'cancelled', // Directly cancelled
                'started_at' => now(), // Assume started now for record
                'ends_at' => $institute->premium_expires_at, // Sync expiry
                'cancelled_at' => now(),
                'is_trial' => false,
            ]);

            return response()->json(['message' => 'Subscription cancelled successfully.']);
        }

        return response()->json(['error' => 'No active subscription found to cancel.'], 400);
    }

    public function apiCancelTrial(Request $request)
    {
        $user = auth()->user();
        if ($user->role !== 'Institute') {
            return response()->json(['error' => 'Unauthorized access.'], 403);
        }

        $institute = $user->institute;
        if (!$institute) {
            return response()->json(['error' => 'Institute not found.'], 404);
        }

        // Relaxed check: Simply needs to be 'active' to cancel
        if ($institute->trial_status !== 'active') {
            return response()->json(['error' => 'Trial is not active.'], 400);
        }

        $institute->update([
            'trial_status' => 'cancelled',
            'is_premium' => false,
            // 'trial_expires_at' => null, // keeping expiry record might be useful or clear it
            'premium_expires_at' => null,
        ]);

        return response()->json(['message' => 'Free trial cancelled.']);
    }

    public function apiVerifyPayment(Request $request)
    {
        $user = auth()->user();
        $orderId = $request->order_id;

        if (!$user->institute || !$orderId) {
            return response()->json(['error' => 'Invalid data'], 400);
        }

        $institute = $user->institute;
        $parts = explode('-', $orderId);
        $orderType = $parts[0] ?? 'SUB';

        // Prevent duplicates
        if ($orderType === 'TRIAL') {
            if ($institute->trial_status === 'active' && $institute->trial_expires_at) {
                return response()->json(['success' => true]);
            }
            // Activate Trial
            $institute->update([
                'trial_status' => 'active',
                'trial_expires_at' => now()->addDays(30),
                'is_premium' => true,
                'premium_expires_at' => now()->addDays(30),
            ]);
        } else {
            $existing = Subscription::where('institute_id', $institute->id)
                ->where('gateway_subscription_id', $orderId)
                ->first();

            if ($existing) {
                return response()->json(['success' => true]);
            }

            // Create Subscription Record manually for localhost verification
            Subscription::create([
                'institute_id' => $institute->id,
                'gateway_subscription_id' => $orderId,
                'plan' => 'monthly',
                'status' => 'active',
                'started_at' => now(),
                'ends_at' => now()->addDays(30),
                'is_trial' => false,
            ]);

            $institute->update([
                'is_premium' => true,
                'premium_expires_at' => now()->addDays(30),
            ]);
        }

        return response()->json(['success' => true]);
    }

    // Kept for backward compatibility if needed, using old logic but redirecting to new API flow
    // or just return error/redirect
    public function showPricing()
    {
        return redirect('/pricing');
    }
}
