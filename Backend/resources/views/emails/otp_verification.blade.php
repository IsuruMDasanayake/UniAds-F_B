<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Email Verification Code</title>
    <style>
        body { font-family: 'Poppins', sans-serif; background-color: #f4f6f8; margin: 0; padding: 20px; }
        .container { max-width: 600px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 12px; box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05); }
        .logo-container { text-align: center; margin-bottom: 30px; }
        .logo { height: 60px; width: auto; }
        h2 { color: #1d375c; text-align: center; font-size: 24px; margin-bottom: 20px; }
        .content { color: #4b5563; line-height: 1.6; text-align: center; font-size: 16px; }
        .otp-box { background: #f8fafc; border: 2px dashed #1d375c; border-radius: 12px; padding: 20px; margin: 30px 0; font-size: 32px; font-weight: 800; color: #e42a19; letter-spacing: 15px; }
        .footer { margin-top: 40px; font-size: 13px; color: #9ca3af; text-align: center; border-top: 1px solid #e5e7eb; padding-top: 25px; }
        .timer-warning { color: #ef4444; font-weight: 600; margin-top: 10px; }
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

        <h2>Verify Your Email</h2>

        <div class="content">
            <p>Hello! Thank you for joining UniAds. To complete your registration, please use the verification code below:</p>
            
            <div class="otp-box">
                {{ $otp }}
            </div>

            <p class="timer-warning">This code will expire in 2 minutes.</p>
            
            <p>If you did not request this code, please ignore this email.</p>
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} {{ $settings->site_name }}. All rights reserved.<br>
        </div>
    </div>
</body>
</html>
