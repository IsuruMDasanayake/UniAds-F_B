<!DOCTYPE html>
<html>

<head>
    <title>{{ $mailTitle }}</title>
    <style>
        body {
            font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            background-color: #f4f6f8;
            padding: 20px;
            margin: 0;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .logo-container {
            text-align: center;
            margin-bottom: 30px;
        }

        .logo {
            height: 120px;
            width: auto;
        }

        .header {
            color: #374151;
            padding: 20px;
            border-radius: 8px;
            text-align: center;
            margin-bottom: 30px;
        }

        .header h1 {
            margin: 0;
            font-size: 24px;
            font-weight: 600;
        }

        .greeting {
            color: #1d375c;
            font-size: 18px;
            margin-bottom: 20px;
        }

        .content {
            color: #374151;
            line-height: 1.8;
            font-size: 15px;
            white-space: pre-wrap;
            word-wrap: break-word;
        }

        .divider {
            height: 1px;
            background: linear-gradient(to right, transparent, #e5e7eb, transparent);
            margin: 30px 0;
        }

        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
        }

        .footer-text {
            font-size: 13px;
            color: #6b7280;
            margin-bottom: 10px;
        }

        .footer-brand {
            font-size: 12px;
            color: #9ca3af;
        }

        .footer-brand strong {
            color: #e42a19;
            font-weight: 600;
        }

        .social-links {
            margin: 20px 0;
        }

        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #6b7280;
            text-decoration: none;
            font-size: 12px;
        }

        .social-links a:hover {
            color: #e42a19;
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

        <div class="header">
            <h1>{{ $mailTitle }}</h1>
        </div>

        <div class="greeting">
            Hello {{ $recipientName }},
        </div>

        <div class="content">
            {{ $mailMessage }}
        </div>

        <div class="divider"></div>

        <div class="footer">
            <div class="footer-text">
                This email was sent to you by the UniAds administration team.
            </div>

            <div class="social-links">
                <a href="http://localhost:3000">Visit Website</a> •
                <a href="mailto:support@uniads.lk">Contact Support</a>
            </div>

            <div class="footer-brand">
                &copy; {{ date('Y') }} UniAds. All rights reserved.
            </div>
        </div>
    </div>
</body>

</html>
