<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>Free Trial</title>
</head>
<style>
    body {
        background: #f8fafc;
        font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
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
        font-size: 3rem;
        margin-bottom: 0px;
        margin-top: -10px;
    }

    .hero p {
        font-size: 1.2rem;
        color: #dbeafe;
        max-width: 700px;
        margin: 0 auto 30px;
    }

    .pricing-box {
        background: #ffffff;
        max-width: 960px;
        margin: -40px auto 60px;
        border-radius: 16px;
        padding: 40px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        text-align: center;
        margin-bottom: 20px;
    }

    .pricing-amount {
        font-size: 3rem;
        font-weight: bold;
        color: #1e293b;
    }

    .plan-note {
        font-size: 1rem;
        color: #64748b;
        margin-bottom: 30px;
    }

    .features-list {
        list-style: none;
        padding: 0;
        margin: 0 auto 40px;
        max-width: 750px;
        text-align: left;
    }

    .features-list li {
        font-size: 1rem;
        margin: 12px 0;
        position: relative;
        padding-left: 28px;
        color: #334155;
    }

    .features-list li::before {
        content: '✅';
        position: absolute;
        left: 0;
        top: 0;
        color: #10b981;
    }

    .subscribe-btn {
        background-color: #1d4ed8;
        color: #fff;
        padding: 14px 32px;
        border: none;
        border-radius: 8px;
        font-size: 1.1rem;
        cursor: pointer;
        transition: background 0.3s ease;
    }

    .subscribe-btn:hover {
        background-color: #2563eb;
    }

   
@media (max-width: 768px) {
    .hero {
        padding: 30px 15px;
        border-radius: 0 0 20px 20px;
    }

    .hero h1 {
        font-size: 2rem;
        margin-top: 0;
        margin-bottom: 10px;
    }

    .hero p {
        font-size: 1rem;
        padding: 0 10px;
    }

    .pricing-box {
        margin: -30px 15px 40px;
        padding: 25px 20px;
        border-radius: 12px;
    }

    .pricing-amount {
        font-size: 2rem;
    }

    .plan-note {
        font-size: 0.95rem;
    }

    .features-list {
        max-width: 100%;
        padding-left: 10px;
        padding-right: 10px;
    }

    .features-list li {
        font-size: 0.95rem;
        padding-left: 24px;
        line-height: 1.4;
    }

    .subscribe-btn {
        width: 100%;
        font-size: 1rem;
        padding: 12px 0;
    }

    a[href="{{ url()->previous() }}"] {
        display: block;
        text-align: center;
        margin: 20px auto 0;
        font-size: 0.95rem;
    }
}

</style>
<body>
    <div class="hero">
    <h1>🚀 Unlock UniAds Premium</h1>
    <p>Promote your institute like never before. More exposure, more tools, and more power — all in one premium plan.</p>
</div>

<div class="pricing-box">
    <div class="pricing-amount">LKR 4990/= </div>
    <div class="plan-note">per month — <strong>1st Month Free</strong></div>

    <ul class="features-list">
        <li><strong>Analytics Dashboard Access</strong> – View insights into your course views and performance.</li>
    <li><strong>Student Follower System</strong> – Let students follow your institute and stay updated.</li>
    <li><strong>Public Reviews and Ratings</strong> – Gain credibility through honest student feedback.</li>
    <li><strong>Promote on UniAds Facebook</strong> – Get your courses featured on our Facebook page.</li>
    <li><strong>Priority in Search Results</strong> – Appear higher in UniAds course and institute searches.</li>
    <li><strong>Dedicated Premium Badge</strong> – Display a gold badge to show you're a verified premium institute.</li>
</ul>
    </ul>

    <form id="subscribe-form" method="POST" action="{{ route('stripe.checkout') }}">
        @csrf
        <button type="submit" class="subscribe-btn">Start Free Trial Now</button>
    </form>
    <a href="{{ url()->previous() }}" style="
    display: inline-block;
    margin: 20px;
    color: #1d4ed8;
    font-weight: 500;
    text-decoration: none;
">
    ← Go Back
</a>
</div>
</body>
</html>

