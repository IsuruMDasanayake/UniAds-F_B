<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Email Verification Code</title>
    <style>
        body {
            font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            line-height: 1.6;
            color: #1e293b;
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
        }

        .wrapper {
            width: 100%;
            table-layout: fixed;
            background-color: #f8fafc;
            padding: 40px 0;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        }

        .header {
            background-color: #0f172a;
            padding: 30px;
            text-align: center;
        }

        .header h1 {
            color: #ffffff;
            margin: 0;
            font-size: 24px;
            font-weight: 700;
        }

        .content {
            padding: 40px 30px;
            text-align: center;
        }

        .otp-box {
            background: #f1f5f9;
            border: 2px dashed #2563eb;
            border-radius: 12px;
            padding: 30px;
            margin: 32px 0;
            font-size: 32px;
            font-weight: 800;
            color: #0f172a;
            letter-spacing: 12px;
        }

        .timer-warning {
            color: #ef4444;
            font-weight: 600;
            margin-top: 10px;
            font-size: 14px;
        }

        .footer {
            padding: 30px;
            text-align: center;
            font-size: 13px;
            color: #64748b;
            background-color: #f8fafc;
        }
    </style>
</head>

<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>Verify Your Email</h1>
            </div>
            <div class="content">
                <p>Hello! Thank you for joining UniAds. To complete your registration, please use the verification code
                    below:</p>

                <div class="otp-box">
                    {{ $otp }}
                </div>

                <p class="timer-warning">This code will expire in 2 minutes.</p>

                <p style="margin-top: 24px; color: #64748b; font-size: 14px;">If you did not request this code, please
                    ignore this email.</p>
            </div>
            <div class="footer">
                <p>&copy; {{ date('Y') }} UniAds. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>

</html>
