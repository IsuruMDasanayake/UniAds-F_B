<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>{{ $mailTitle }}</title>
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
        }

        .greeting {
            font-size: 18px;
            font-weight: 600;
            margin-bottom: 16px;
            color: #0f172a;
        }

        .message-box {
            background-color: #f1f5f9;
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            color: #334155;
            font-size: 16px;
            white-space: pre-wrap;
            word-wrap: break-word;
        }

        .footer {
            padding: 30px;
            text-align: center;
            font-size: 13px;
            color: #64748b;
            background-color: #f8fafc;
        }

        .social-link {
            color: #2563eb;
            text-decoration: none;
            font-weight: 600;
        }
    </style>
</head>

<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>{{ $mailTitle }}</h1>
            </div>
            <div class="content">
                <div class="greeting">Hello {{ $recipientName }},</div>
                <div class="message-box">
                    {{ $mailMessage }}
                </div>
                <p style="text-align: center; margin-top: 32px;">
                    <a href="http://localhost:3000" class="social-link">Visit Our Website</a>
                </p>
                <p style="color: #64748b; font-size: 13px; text-align: center; margin-top: 24px;">
                    This email was sent to you by the UniAds administration team.
                </p>
            </div>
            <div class="footer">
                <p>&copy; {{ date('Y') }} UniAds. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>

</html>
