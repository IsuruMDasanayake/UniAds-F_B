<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Institute;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Stripe\Stripe;
use Stripe\Checkout\Session;
use Stripe\Webhook;
use Illuminate\Support\Facades\Storage;


class PostBoostController extends Controller
{
    public function showBoostOptions(Post $post)
    {
        $this->authorize('update', $post); // Ensure only owner can boost

        $plans = config('boost.plans');
        return view('posts.boost-options', compact('post', 'plans'));
    }

    public function initiateBoostPayment(Request $request, Post $post)
{
    try {
        //$this->authorize('update', $post);
        $days = $request->input('days');
        $plans = config('boost.plans');

        if (!isset($plans[$days])) {
            return response()->json(['error' => 'Invalid boost plan.'], 400);
        }

        Stripe::setApiKey(env('STRIPE_SECRET_KEY'));

        $session = Session::create([
            'payment_method_types' => ['card'],
            'line_items' => [[
                'price_data' => [
                    'currency' => 'lkr',
                    'unit_amount' => $plans[$days] * 100,
                    'product_data' => [
                        'name' => "Boost Post: {$post->title} ({$days} days)",
                    ],
                ],
                'quantity' => 1,
            ]],
            'mode' => 'payment',
            'success_url' => route('boost.success', $post->id),
            'cancel_url' => route('posts.boost.options', $post->id) . '?canceled=1',
            'metadata' => [
                'post_id' => $post->id,
                'boost_days' => $days,
            ],
        ]);

        return response()->json(['checkout_url' => $session->url]);
    } catch (\Exception $e) {
        \Log::error('Stripe Boost Error: ' . $e->getMessage());
        return response()->json(['error' => 'Boost payment failed.'], 500);
    }
}


    public function handleStripeWebhook(Request $request)
{
    \Log::info('Stripe Webhook Received: ' . $request->header('Stripe-Signature'));

    $payload = @file_get_contents('php://input');
    $sigHeader = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';
    $endpointSecret = env('STRIPE_WEBHOOK_SECRET');

    try {
        $event = \Stripe\Webhook::constructEvent(
            $payload, $sigHeader, $endpointSecret
        );
    } catch (\Exception $e) {
        \Log::error('Stripe Webhook Error: ' . $e->getMessage());
        return response()->json(['error' => 'Invalid signature'], 400);
    }

    \Log::info('Stripe Webhook Received: ' . $event->type);

    
    
    
    if ($event->type === 'checkout.session.completed') {
    $session = $event->data->object;
    \Log::info('checkout.session.completed: ' . json_encode($session));

    $metadata = $session->metadata ?? [];

    $postId = $metadata['post_id'] ?? null;
    $days = $metadata['boost_days'] ?? null;

    if ($postId && $days) {
        $post = \App\Models\Post::find($postId);

        if ($post) {
            $post->is_boosted = true;
            $post->boost_expires_at = now()->addDays((int) $days);
            $post->save();

            \Log::info("✅ Post ID {$postId} successfully boosted for {$days} days");
        } else {
            \Log::error("❌ Post not found for ID {$postId}");
        }
    } else {
        \Log::error("❌ Missing post_id or boost_days in metadata.");
    }

    return response()->json(['status' => 'success']);
}

}
}
    
