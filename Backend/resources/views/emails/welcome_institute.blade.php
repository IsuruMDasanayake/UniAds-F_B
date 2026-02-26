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

        .feature-list {
            background: #f8fafc;
            border-radius: 12px;
            padding: 25px;
            margin: 30px 0;
        }

        .feature-item {
            display: flex;
            align-items: flex-start;
            margin-bottom: 15px;
        }

        .feature-icon {
            color: #e42a19;
            margin-right: 12px;
            font-weight: bold;
        }

        .btn-container {
            text-align: center;
            margin: 35px 0;
        }

        .btn {
            background-color: #1d375c;
            color: #ffffff !important;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 50px;
            font-weight: 700;
            display: inline-block;
            transition: all 0.3s ease;
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

        <h2>Welcome to the Family!</h2>

        <div class="content">
            <p>Dear <strong>{{ $institute->institute_name }}</strong>,</p>
            <p>Congratulations! Your institute has successfully registered with UniAds. We are thrilled to have you on
                board as we connect students with world-class education.</p>

            <div class="feature-list">
                <p><strong>What's Next?</strong></p>
                <div class="feature-item"><span class="feature-icon">✓</span> Complete your profile with photos and
                    details.</div>
                <div class="feature-item"><span class="feature-icon">✓</span> Post your courses and attracting
                    prospective students.</div>
                <div class="feature-item"><span class="feature-icon">✓</span> Build your following and engage with
                    students.</div>
            </div>

            <p>Our team is currently reviewing your registration. You will receive another email once your profile is
                fully approved for public listing.</p>

            <div class="btn-container">
                <a href="{{ url('/profile') }}" class="btn">Access Your Profile</a>
            </div>
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} {{ $settings->site_name }}. All rights reserved.<br>
        </div>
    </div>
</body>

</html>
