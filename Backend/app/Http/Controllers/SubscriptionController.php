<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Subscription;
use App\Models\Institute;
use Carbon\Carbon;
use Illuminate\Support\Facades\Log;
use App\Models\Notification;
use App\Models\AdminNotification;
use App\Models\User;

use App\Traits\ApiResponse;
use Illuminate\Support\Facades\DB;
use App\Services\AdminActivityLogger;

class SubscriptionController extends Controller
{
    use ApiResponse;

    // --- API Methods ---

    public function apiShowPricing()
    {
        $user = auth()->user();
        if ($user->role !== 'Institute') {
            return $this->error('Unauthorized access.', 403);
        }

        $institute = $user->institute;
        if (!$institute) {
            return $this->error('No institute found for user.', 404);
        }

        // The following logic has been moved to the 'subscriptions:sync-expiry' scheduled command
        // to maintain a clean, side-effect free GET request:
        // - Trial expiration checking and status updates
        // - Premium status expiration checking and updates
        
        $activeSubscription = Subscription::where('institute_id', $institute->id)
            ->latest()
            ->first();

        $status = 'subscribe'; // Default

        if ($institute->trial_status === 'active') {
            $status = 'trial_active';
        } elseif ($institute->is_premium) {
            // Check if subscription was cancelled but is still valid (premium not expired)
            // Now we check cancelled_at instead of status
            if ($activeSubscription && $activeSubscription->cancelled_at) {
                $status = 'cancelled_but_valid';
            } else {
                $status = 'active';
            }
        } elseif ($institute->trial_status === 'not_used') {
            $status = 'trial_available';
        } else {
            $status = 'subscribe';
        }

        return $this->successResponse([
            'status' => $status,
            'institute' => $institute,
            'activeSubscription' => $activeSubscription,
            'trial_expires_at' => $institute->trial_expires_at,
            'premium_expires_at' => $institute->premium_expires_at,
            'trial_status' => $institute->trial_status,
            'trial_cancelled_at' => $institute->trial_cancelled_at
        ]);
    }

    public function apiStartTrial(Request $request)
    {
        $user = auth()->user();
        if ($user->role !== 'Institute') {
            return $this->error('Unauthorized access.', 403);
        }

        $institute = $user->institute;
        if (!$institute) {
            return $this->error('Institute not found.', 404);
        }

        if ($institute->trial_status !== 'not_used') {
            return $this->error('Trial already used or active.', 400);
        }

        DB::transaction(function () use ($institute) {
            $trialDays = 30;
            $institute->update([
                'trial_status' => 'active',
                'trial_expires_at' => now()->addDays($trialDays),
                'trial_cancelled_at' => null,
                'is_premium' => true,
                'premium_expires_at' => now()->addDays($trialDays),
            ]);

            // Notify Admins
            $admins = User::where('role', 'Admin')->get();
            foreach ($admins as $admin) {
                AdminNotification::create([
                    'user_id' => $admin->id,
                    'type' => 'subscription_new',
                    'title' => 'New Trial Started',
                    'message' => "{$institute->institute_name} has started a 30-day free trial.",
                    'data' => [
                        'institute_id' => $institute->id,
                        'type' => 'trial'
                    ]
                ]);
            }
        });

        return $this->success($institute, 'Trial started successfully.');
    }


    public function apiInitiatePayment(Request $request)
    {
        $user = auth()->user();
        if ($user->role !== 'Institute') {
            return $this->error('Unauthorized access.', 403);
        }

        $institute = $user->institute;
        if (!$institute) {
            return $this->error('Institute not found.', 404);
        }

        $type = $request->input('type'); // 'subscription' or 'trial'

        if ($type === 'trial') {
            if ($institute->trial_status !== 'not_used') {
                return $this->error('Trial already used.', 400);
            }
            $amount = 100.00;
            $items = "UniAds Free Trial";
            $orderIdPrefix = "TRIAL-";
        } else {
            $settings = \App\Models\PlatformSetting::getInstance();
            $amount = $settings->subscription_price ?? 4990.00;
            $items = "UniAds Premium Subscription - Monthly";
            $orderIdPrefix = "SUB-";
        }

        // Generate unique order ID
        $orderId = $orderIdPrefix . $institute->id . "-" . time();

        // Payment details
        $merchantId = config("services.payhere.merchant_id");
        $merchantSecret = config("services.payhere.merchant_secret");
        $isSandbox = config("services.payhere.is_sandbox");

        if (!$merchantId || !$merchantSecret) {
            return $this->error('Payment gateway configuration is missing on the server.', 500);
        }

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
            "sandbox" => $isSandbox,
            "merchant_id" => $merchantId,
            "return_url" => config('app.frontend_url') . "/pricing?success=1",
            "cancel_url"  => config('app.frontend_url') . "/pricing?cancelled=1",
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

        return $this->successResponse([
            "payment_data" => $paymentData,
            "order_id" => $orderId
        ]);
    }

    public function apiPaymentNotify(Request $request)
    {
        // FIX: Use config() not env() — env() returns null when the config cache is active
        // (php artisan config:cache), which would make hash verification always fail in production.
        $merchantId     = config('services.payhere.merchant_id');
        $merchantSecret = config('services.payhere.merchant_secret');

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
                "order_id"   => $orderId,
                "payment_id" => $paymentId,
            ]);

            // Extract Institute ID from Order ID — Format: SUB-{institute_id}-{time}
            $parts       = explode('-', $orderId);
            $instituteId = $parts[1] ?? null;
            $orderType   = $parts[0] ?? 'SUB';

            if (!$instituteId) {
                Log::error("PayHere IPN: Could not parse instituteId from order_id", ['order_id' => $orderId]);
                return $this->error('Invalid order format.', 400);
            }

            $institute = Institute::find($instituteId);
            if (!$institute) {
                Log::error("PayHere IPN: Institute not found", ['institute_id' => $instituteId]);
                return $this->error('Institute not found.', 404);
            }

            // IDEMPOTENCY: Bail out if this exact payment was already processed.
            // PayHere retries webhooks on non-200 or timeout — this prevents
            // duplicate Subscription rows and double-crediting of premium status.
            if ($paymentId && Subscription::where('gateway_subscription_id', $paymentId)->exists()) {
                Log::info("PayHere IPN duplicate skipped", ['payment_id' => $paymentId]);
                return $this->success(null, 'Already processed.');
            }

            // ATOMICITY: All DB writes must succeed together or roll back entirely.
            // Without this, a timeout between Subscription::create() and $institute->update()
            // leaves the institute as paid-but-not-premium — requiring manual DB correction.
            DB::transaction(function () use ($institute, $orderType, $paymentId, $orderId) {
                if ($orderType === 'TRIAL') {
                    // Activate Trial
                    $institute->update([
                        'trial_status'     => 'active',
                        'trial_expires_at' => now()->addDays(30),
                        'trial_cancelled_at' => null,
                        'is_premium'       => true,
                        'premium_expires_at' => now()->addDays(30),
                    ]);
                } else {
                    // Renew existing expired subscription, or create a new one
                    $subscription = Subscription::where('institute_id', $institute->id)
                        ->where('status', 'expired')
                        ->latest()
                        ->first();

                    if ($subscription) {
                        $subscription->update([
                            'gateway_subscription_id' => $paymentId,
                            'status'     => 'active',
                            'started_at' => now(),
                            'ends_at'    => now()->addDays(30),
                            'is_trial'   => false,
                            'cancelled_at' => null,
                        ]);
                    } else {
                        Subscription::create([
                            'institute_id'             => $institute->id,
                            'gateway_subscription_id'  => $paymentId,
                            'plan'       => 'monthly',
                            'status'     => 'active',
                            'started_at' => now(),
                            'ends_at'    => now()->addDays(30),
                            'is_trial'   => false,
                        ]);
                    }

                    // Sync institute premium status
                    $institute->update([
                        'is_premium'         => true,
                        'premium_expires_at' => now()->addDays(30),
                    ]);

                    // Notify Admins (batch insert — no per-row queries)
                    $admins = User::where('role', 'Admin')->get();
                    if ($admins->isNotEmpty()) {
                        $notifications = $admins->map(fn($admin) => [
                            'user_id' => $admin->id,
                            'type'    => 'subscription_new',
                            'title'   => 'New Subscription Received',
                            'message' => "{$institute->institute_name} has purchased a premium subscription.",
                            'data'    => json_encode([
                                'institute_id' => $institute->id,
                                'order_id'     => $orderId,
                            ]),
                            'is_read'    => false,
                            'created_at' => now(),
                            'updated_at' => now(),
                        ])->toArray();
                        AdminNotification::insert($notifications);
                    }
                }
            });

            return $this->success(null, "Payment processed successfully");
        } else {
            Log::error("PayHere Payment verification failed", [
                "order_id" => $orderId,
                "status_code" => $statusCode
            ]);

            return $this->error("Payment verification failed", 400);
        }
    }

    public function apiCancelSubscription(Request $request)
    {
        $user = auth()->user();
        if ($user->role !== 'Institute') {
            return $this->error('Unauthorized access.', 403);

        }

        $institute = $user->institute;
        if (!$institute) {
            return $this->error('Institute not found.', 404);

        }

        // 1. Try to find the Active Subscription in DB
        $subscription = Subscription::where('institute_id', $institute->id)
            ->where('status', 'active')
            ->latest()
            ->first();

        if ($subscription) {
            $subscription->update([
                'status' => 'active', // Stays active until ends_at
                'cancelled_at' => now(),
                'cancel_reason' => $request->input('reason'),
            ]);
            // Premium benefits remain until premium_expires_at
            return $this->success(null, 'Subscription cancelled successfully.');
        }

        // 2. Fallback: If no active subscription is found, but the user IS premium
        // This handles cases where data might be inconsistent (e.g. manual approval, or old data)
        if ($institute->is_premium && $institute->premium_expires_at && now()->lt($institute->premium_expires_at)) {
            // Create a placeholder "cancelled" subscription so the UI validates the state
            Subscription::create([
                'institute_id' => $institute->id,
                'gateway_subscription_id' => 'MANUAL-CANCEL-' . time(),
                'plan' => 'monthly',
                'status' => 'active', // Stays active until sync expiry
                'started_at' => now(), // Assume started now for record
                'ends_at' => $institute->premium_expires_at, // Sync expiry
                'cancelled_at' => now(),
                'cancel_reason' => $request->input('reason'),
                'is_trial' => false,
            ]);

            return $this->success(null, 'Subscription cancelled successfully.');
        }

        return $this->error('No active subscription found to cancel.', 400);
    }

    public function apiCancelTrial(Request $request)
    {
        $user = auth()->user();
        if ($user->role !== 'Institute') {
            return $this->error('Unauthorized access.', 403);

        }

        $institute = $user->institute;
        if (!$institute) {
            return $this->error('Institute not found.', 404);

        }

        // Relaxed check: Simply needs to be 'active' to cancel
        if ($institute->trial_status !== 'active') {
            return $this->error('Trial is not active.', 400);
        }

        // Immediate cancellation for trials
        $institute->update([
            'trial_status' => 'cancelled',
            'trial_cancelled_at' => now(),
            'trial_cancel_reason' => $request->input('reason'),
            'is_premium' => false,
            'premium_expires_at' => null,
        ]);

        return $this->success(null, 'Free trial cancelled.');
    }

    public function apiCancelUnified(Request $request)
    {
        $user = auth()->user();
        $institute = $user->institute;

        if (!$institute) {
            return $this->error('Institute not found.', 404);

        }

        // 1. Check for Active Subscription first
        $hasActiveSubscription = Subscription::where('institute_id', $institute->id)
            ->where('status', 'active')
            ->whereNull('cancelled_at')
            ->exists();

        if ($hasActiveSubscription) {
            return $this->apiCancelSubscription($request);
        }

        // 2. Fallback to Trial cancellation if active
        if ($institute->trial_status === 'active') {
            return $this->apiCancelTrial($request);
        }

        return $this->error('No active subscription or trial found to cancel.', 400);
    }

    public function apiVerifyPayment(Request $request)
    {
        $user = auth()->user();
        $orderId = $request->input('order_id');

        if (!$orderId) {
            return $this->error('Order ID is required.', 400);
        }

        $institute = $user->institute;

        if (!$institute) {
            return $this->error('Institute not found.', 404);
        }

        // 1. If already active (via Webhook), sync and return
        if ($institute->is_premium) {
            $user->load('institute');
            return $this->success($user, 'Payment verified and premium activated.');
        }

        /**
         * 2. LOCAL DEVELOPMENT FALLBACK
         * On localhost, PayHere webhooks won't reach the server.
         * We allow immediate activation ONLY if app environment is 'local'.
         * WARNING: In production, this logic is skipped for security.
         */
        if (config('app.env') === 'local') {
            $parts = explode('-', $orderId);
            $orderType = $parts[0] ?? 'SUB';

            // Prevent duplicates
            if ($orderType === 'TRIAL') {
                if ($institute->trial_status === 'active' && $institute->trial_expires_at) {
                    return $this->success(null);
                }
                // Activate Trial
                $institute->update([
                    'trial_status' => 'active',
                    'trial_expires_at' => now()->addDays(30),
                    'trial_cancelled_at' => null,
                    'is_premium' => true,
                    'premium_expires_at' => now()->addDays(30),
                ]);
            } else {
                $existing = Subscription::where('institute_id', $institute->id)
                    ->where('gateway_subscription_id', $orderId)
                    ->first();

                if ($existing) {
                    return $this->success(null);
                }

                // Renew or Create Subscription Record
                $subscription = Subscription::where('institute_id', $institute->id)
                    ->where('status', 'expired')
                    ->latest()
                    ->first();

                if ($subscription) {
                    $subscription->update([
                        'gateway_subscription_id' => $orderId,
                        'status' => 'active',
                        'started_at' => now(),
                        'ends_at' => now()->addDays(30),
                        'is_trial' => false,
                        'cancelled_at' => null,
                    ]);
                } else {
                    Subscription::create([
                        'institute_id' => $institute->id,
                        'gateway_subscription_id' => $orderId,
                        'plan' => 'monthly',
                        'status' => 'active',
                        'started_at' => now(),
                        'ends_at' => now()->addDays(30),
                        'is_trial' => false,
                    ]);
                }

                // Update Institute
                $institute->update([
                    'is_premium' => true,
                    'premium_expires_at' => now()->addDays(30),
                ]);
            }

            // Return fresh user data for frontend immediate sync
            $user->load('institute');
            return $this->success($user, 'Payment verified and premium activated (Dev Mode).');
        }

        // 3. PRODUCTION MODE
        // Return success but with a pending status.
        return response()->json([
            'status' => 'pending',
            'message' => 'Payment notification received. Premium status will be active shortly.'
        ]);
    }

    // Kept for backward compatibility if needed, using old logic but redirecting to new API flow
    // or just return error/redirect
    public function showPricing()
    {
        return redirect('/pricing');
    }

    // ==========================================
    // API METHODS FOR ADMIN DASHBOARD
    // ==========================================

    public function apiAdminIndex()
    {
        // 1. Get all paid subscriptions
        $subscriptions = Subscription::with('institute')->get();

        // 2. Get institutes that are currently on trial OR have used a trial.
        // We now include them even if they have a paid subscription to show full history.
        $trialInstitutes = Institute::where('trial_status', '!=', 'not_used')
            ->get();

        $merged = collect();

        foreach ($subscriptions as $sub) {
            /** @var \App\Models\Subscription $sub */
            $isExpired = $sub->ends_at && Carbon::parse($sub->ends_at)->isPast();
            $sub->status = $isExpired ? 'expired' : 'active';
            $merged->push($sub->toArray());
        }

        foreach ($trialInstitutes as $inst) {
            $isExpired = $inst->trial_expires_at && Carbon::parse($inst->trial_expires_at)->isPast();
            $isCancelled = (bool)$inst->trial_cancelled_at;

            $status = 'active';
            if ($isExpired) {
                $status = 'expired';
            } elseif ($isCancelled) {
                $status = 'cancelled';
            }

            $merged->push([
                'id' => 'trial-' . $inst->id,
                'institute_id' => $inst->id,
                'institute' => $inst,
                'plan' => 'trial',
                'status' => $status,
                'started_at' => $inst->trial_expires_at ? Carbon::parse($inst->trial_expires_at)->subDays(30) : null,
                'ends_at' => $inst->trial_expires_at,
                'cancelled_at' => $inst->trial_cancelled_at,
                'is_trial' => true,
                'created_at' => $inst->created_at,
            ]);
        }

        // Sort by started_at desc
        $sorted = $merged->sortByDesc(function ($item) {
            return is_array($item) ? ($item['started_at'] ?? $item['created_at']) : ($item->started_at ?? $item->created_at);
        })->values();

        return $this->successResponse($sorted);
    }

    public function apiToggleStatus(Request $request, $id)
    {
        // Admin manually changing status (Active, Cancelled, Expired)
        $newStatus = strtolower($request->input('status'));

        if (!in_array($newStatus, ['active', 'cancelled', 'expired'])) {
            return $this->error('Invalid status', 400);
        }

        // Handle Virtual Trial Status
        if (str_starts_with($id, 'trial-')) {
            $instituteId = substr($id, 6);
            $institute = Institute::findOrFail($instituteId);

            if ($newStatus === 'active') {
                $institute->trial_status = 'active';
                $institute->is_premium = true;
                $institute->trial_cancelled_at = null;
                $institute->trial_cancel_reason = null;
                if (!$institute->trial_expires_at) {
                    $institute->trial_expires_at = now()->addDays(30);
                }
            } elseif ($newStatus === 'cancelled') {
                // Trials cancel immediately
                $institute->trial_status = 'cancelled';
                $institute->is_premium = false;
                $institute->trial_cancelled_at = now();
                $institute->trial_cancel_reason = $request->input('reason');
            } elseif ($newStatus === 'expired') {
                $institute->trial_status = 'expired';
                $institute->is_premium = false;
            }

            $institute->save();

            return $this->success(['status' => $newStatus], 'Trial status updated');
        }

        $subscription = Subscription::findOrFail($id);

        return DB::transaction(function () use ($subscription, $newStatus, $request) {
            $updates = [];
            if ($newStatus === 'active') {
                $updates = [
                    'status' => 'active',
                    'cancelled_at' => null,
                    'cancel_reason' => null,
                ];
            } elseif ($newStatus === 'cancelled') {
                $updates = [
                    'status' => 'cancelled',
                    'cancelled_at' => now(),
                    'cancel_reason' => $request->input('reason') ?: 'Cancelled by admin',
                ];
            } elseif ($newStatus === 'expired') {
                $updates = ['status' => 'expired'];
            }

            $subscription->update($updates);

            // Sync with institute status
            $institute = Institute::find($subscription->institute_id);
            if ($institute) {
                if ($newStatus === 'active') {
                    $institute->update([
                        'is_premium' => true,
                    ]);
                    // Ensure expiry is set if missing
                    if (!$institute->premium_expires_at || $institute->premium_expires_at < now()) {
                        $institute->update([
                            'premium_expires_at' => $subscription->ends_at ?? now()->addDays(30)
                        ]);
                    }
                } elseif ($newStatus === 'expired' || $newStatus === 'cancelled') {
                    $institute->update(['is_premium' => false]);
                }
            }

            return $this->success(['status' => $subscription->status], 'Subscription status updated');
        });
    }

    // ==========================================
    // ADMIN: MANUALLY GRANT SUBSCRIPTION
    // ==========================================

    /**
     * Admin manually grants a 30-day premium subscription to an institute.
     * Creates a Subscription record and syncs the institute's is_premium flag.
     * Requires a note for audit trail purposes.
     */
    public function apiAdminGrantSubscription(Request $request)
    {
        $request->validate([
            'institute_id' => 'required|exists:institutes,id',
            'days'         => 'nullable|integer|min:1|max:365',
            'note'         => 'required|string|max:255',
        ]);

        $institute = Institute::findOrFail($request->institute_id);
        $days      = $request->input('days', 30);

        return DB::transaction(function () use ($institute, $days, $request) {
            // Expire any previous active subscription so there's no overlap
            Subscription::where('institute_id', $institute->id)
                ->where('status', 'active')
                ->update(['status' => 'expired']);

            $subscription = Subscription::create([
                'institute_id'            => $institute->id,
                'gateway_subscription_id' => 'ADMIN-GRANT-' . now()->timestamp . '-' . $institute->id,
                'plan'       => 'monthly',
                'status'     => 'active',
                'started_at' => now(),
                'ends_at'    => now()->addDays($days),
                'is_trial'   => false,
                'note'       => $request->note,
            ]);

            $institute->update([
                'is_premium'         => true,
                'premium_expires_at' => now()->addDays($days),
            ]);

            AdminActivityLogger::log(
                'Granted Subscription',
                'Institute',
                $institute->id,
                auth()->user()->name . " manually granted a {$days}-day subscription to \"{$institute->institute_name}\". Note: {$request->note}"
            );

            // Notify the institute
            Notification::create([
                'institute_id' => $institute->id,
                'type'         => 'system',
                'title'        => 'Premium Subscription Granted',
                'message'      => "An admin has granted you a {$days}-day premium subscription. Enjoy your premium features!",
            ]);

            return $this->success($subscription, "Subscription granted for {$days} days.");
        });
    }
}
