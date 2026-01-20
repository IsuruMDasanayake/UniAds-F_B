<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Subscription Success – UniAds</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<style>
    body {
        background: #f8fafc;
        font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    .hero {
        background: linear-gradient( #007bff, #6A11CB);
        color: #fff;
        padding: 80px 20px;
        text-align: center;
        border-radius: 0 0 40px 40px;
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
    }

    .hero h1 {
        font-size: 3rem;
        margin-top: -10px;
        margin-bottom: 10px;
    }

    .hero p {
        font-size: 1.2rem;
        color: #dbeafe;
        max-width: 700px;
        margin: 0 auto 30px;
    }

    .success-box {
        background: #ffffff;
        max-width: 960px;
        margin: -40px auto 60px;
        border-radius: 16px;
        padding: 60px 40px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
        text-align: center;
    }

    .emoji {
        font-size: 3rem;
        margin-bottom: 10px;
    }

    .success-message {
        font-size: 1.8rem;
        font-weight: bold;
        color: #1e293b;
        margin-bottom: 15px;
    }

    .success-description {
        font-size: 1.1rem;
        color: #475569;
        margin-bottom: 30px;
    }

    .dashboard-btn {
        background-color: #1d4ed8;
        color: #fff;
        padding: 14px 32px;
        border: none;
        border-radius: 8px;
        font-size: 1.1rem;
        cursor: pointer;
        text-decoration: none;
        transition: background 0.3s ease;
    }

    .dashboard-btn:hover {
        background-color: #2563eb;
    }

    @media (max-width: 768px) {
        .hero {
            padding: 30px 15px;
            border-radius: 0 0 20px 20px;
        }

        .hero h1 {
            font-size: 2rem;
        }

        .hero p {
            font-size: 1rem;
        }

        .success-box {
            margin: -30px 15px 40px;
            padding: 30px 20px;
            border-radius: 12px;
        }

        .success-message {
            font-size: 1.4rem;
        }

        .success-description {
            font-size: 1rem;
        }

        .dashboard-btn {
            width: 100%;

            padding: 14px 20px;
            font-size: 1rem;
        }
    }
</style>
<body>

    <div class="hero">
        <h1>🎉 Subscription Successful!</h1>
        <p>Welcome to UniAds Premium — Power up your institute's growth with professional tools and visibility.</p>
    </div>

    <div class="success-box">
        

        @if ($isTrial)
            <div class="success-message">🎁 Your 30-Day Free Trial is Now Active</div>
            <div class="success-description">
                Enjoy full premium benefits free of charge for the next 30 days.
            </div>
        @else
            <div class="success-message">🌟 You're Now a Premium Institute</div>
            <div class="success-description">
                You’ve unlocked all advanced features. Time to shine on UniAds!
            </div>
        @endif


        <a href="{{ route('analytics.dashboard', $institute->id) }}" class="dashboard-btn">Go to Dashboard</a>
        <br><br>
        <a href="{{ url('/profile') }}" style="
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
