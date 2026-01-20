<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Cancel Subscription - UniAds</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<style>
    body {
        background: #f8fafc;
        font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        margin: 0;
        padding: 0;
    }

    .hero {
        background: linear-gradient( #007bff, #6A11CB);
        color: #fff;
        padding: 40px 20px;
        text-align: center;
        border-radius: 0 0 40px 40px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }

    .hero h1 {
        font-size: 2.5rem;
        margin: 0;
    }

    .cancel-box {
        background: #ffffff;
        max-width: 850px;
        margin: -30px auto 40px;
        border-radius: 16px;
        padding: 40px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        text-align: center;
    }

    .cancel-box p {
        font-size: 1.1rem;
        color: #334155;
        margin-bottom: 20px;
        line-height: 1.6;
    }

    .cancel-box strong {
        color: #1e40af;
    }

    .cancel-btn {
        background-color: #ef4444;
        color: #fff;
        padding: 14px 32px;
        border: none;
        border-radius: 8px;
        font-size: 1.1rem;
        cursor: pointer;
        transition: background 0.3s ease;
        margin-top: 20px;
    }

    .cancel-btn:hover {
        background-color: #dc2626;
    }

    .policy-link {
        display: inline-block;
        margin-top: 20px;
        color: #1d4ed8;
        text-decoration: none;
        font-weight: 500;
    }

    .contact-box {
        margin-top: 40px;
        text-align: left;
        background: #f9fafb;
        padding: 20px;
        border-radius: 12px;
        font-size: 0.95rem;
        color: #475569;
        border: 1px solid #e5e7eb;
    }

    .back-link {
        display: inline-block;
        margin-top: 30px;
        color: #1d4ed8;
        text-decoration: none;
        font-weight: 500;
    }

    @media (max-width: 768px) {
        .hero h1 {
            font-size: 2rem;
        }

        .cancel-box {
            padding: 25px 20px;
            margin: -20px 15px 30px;
        }

        .cancel-box p {
            font-size: 1rem;
        }

        .cancel-btn {
            width: 100%;
            padding: 12px 0;
            font-size: 1rem;
        }

        .back-link {
            font-size: 0.95rem;
        }
    }
</style>
<body>

<div class="hero">
    <h1>❌ Cancelled Subscription</h1>
</div>

<div class="cancel-box">
    <p>Your current subscription is <strong>{{ ucfirst($activeSubscription->status) }}</strong>.</p>
    <p>Canceling your subscription means your institute will lose premium benefits <strong>after the current billing cycle ends</strong>.</p>
    <p>Premium access will remain active until <strong>{{ \Carbon\Carbon::parse($activeSubscription->ends_at)->toFormattedDateString() }}</strong>.</p>
    
    <p><em>Please note:</em> Once cancelled, your subscription will not renew. According to our <a href="{{ url('/refund-policy') }}" class="policy-link">Refund Policy</a>, no refunds will be issued for the current billing period. You will continue to enjoy premium features until your subscription officially expires.</p>

    <p>If you wish to reactivate your subscription, you must wait until the current period ends. A new subscription can then be started from your institute dashboard.</p>

    {{-- <form action="{{ route('subscription.cancel') }}" method="POST" onsubmit="return confirm('Are you sure you want to cancel your premium subscription? You will lose premium features at the end of your billing cycle.');">
        @csrf
        <button type="submit" class="cancel-btn">Confirm Cancellation</button>
    </form> --}}

    <div class="contact-box">
        <p><strong>Need Help?</strong></p>
        <p>If you face any issues or have questions, please contact the UniAds support team:</p>
        <ul style="margin-left:20px;">
            <li>Email: <a href="mailto:support@uniads.lk">support@uniads.lk</a></li>
            <li>WhatsApp: <a href="https://wa.me/94772300279" target="_blank">+94 77 230 0279</a></li>
        </ul>
    </div>

    <a href="{{ url()->previous() }}" class="back-link">← Back</a>
</div>

</body>
</html>
