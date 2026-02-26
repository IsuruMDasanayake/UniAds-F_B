<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Welcome to UniAds</title>
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 20px;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }

        .logo-container {
            text-align: center;
            margin-bottom: 30px;
        }

        .logo {
            height: 60px;
            width: auto;
        }

        h2 {
            color: #1d375c;
            text-align: center;
            font-size: 26px;
            margin-bottom: 20px;
        }

        .content {
            color: #4b5563;
            line-height: 1.8;
            font-size: 16px;
        }

        .hero {
            background: linear-gradient(135deg, #1d375c 0%, #e42a19 100%);
            color: white;
            padding: 30px;
            border-radius: 12px;
            text-align: center;
            margin-bottom: 30px;
        }

        .hero h3 {
            margin: 0;
            font-size: 22px;
        }

        .feature-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
            margin: 30px 0;
        }

        .feature-item {
            background: #f8fafc;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
        }

        .btn-container {
            text-align: center;
            margin: 35px 0;
        }

        .btn {
            background-color: #e42a19;
            color: #ffffff !important;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 700;
            display: inline-block;
        }

        .footer {
            margin-top: 40px;
            font-size: 13px;
            color: #9ca3af;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 25px;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="logo-container">
            @php
                $settings = \App\Models\PlatformSetting::getInstance();
                $logoPath = public_path('images/logo.png');
                if ($settings->logo_path && file_exists(public_path('storage/' . $settings->logo_path))) {
                    $logoPath = public_path('storage/' . $settings->logo_path);
                }
            @endphp
            <img src="{{ $message->embed($logoPath) }}" alt="{{ $settings->site_name }}" class="logo">
        </div>

        <div class="hero">
            <h3>Welcome to UniAds, {{ $user->name }}!</h3>
        </div>

        <div class="content">
            <p>We are delighted to have you as part of our community. UniAds is your gateway to explore courses, events,
                and opportunities from top institutes across the country.</p>

            <p><strong>Start your journey today:</strong></p>

            <div class="feature-grid">
                <div class="feature-item"><strong>Find Courses</strong><br><small>Explore diverse academic
                        options</small></div>
                <div class="feature-item"><strong>Stay Updated</strong><br><small>Track upcoming campus events</small>
                </div>
                <div class="feature-item"><strong>Direct Contact</strong><br><small>Message institutes instantly</small>
                </div>
                <div class="feature-item"><strong>Save Favorites</strong><br><small>Bookmark your top choices</small>
                </div>
            </div>

            <div class="btn-container">
                <a href="{{ url('/feed') }}" class="btn">Start Exploring</a>
            </div>
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} {{ $settings->site_name }}. All rights reserved.<br>
        </div>
    </div>
</body>

</html>
