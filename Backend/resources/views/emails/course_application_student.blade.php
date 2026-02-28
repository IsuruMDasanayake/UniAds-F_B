<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
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

        .info-grid {
            background-color: #f1f5f9;
            padding: 24px;
            border-radius: 12px;
            margin-bottom: 24px;
        }

        .info-item {
            margin-bottom: 8px;
            font-size: 15px;
        }

        .label {
            font-weight: 700;
            color: #0f172a;
            width: 120px;
            display: inline-block;
        }

        .message-box {
            background-color: #f1f5f9;
            padding: 24px;
            border-radius: 12px;
            border-left: 4px solid #2563eb;
            margin: 24px 0;
            color: #334155;
            font-size: 16px;
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
                <h1>Application Sent</h1>
            </div>
            <div class="content">
                <div class="greeting">Dear {{ $data['name'] }},</div>
                <p>Thank you for applying for a course through UniAds. Your application has been successfully sent to
                    <strong>{{ $data['institute_name'] }}</strong>.</p>

                <p>Here is a summary of the details you submitted:</p>

                <div class="info-grid">
                    <div class="info-item"><span class="label">Course:</span>
                        <strong>{{ $data['course_title'] }}</strong>
                    </div>
                    <div class="info-item"><span class="label">Institute:</span> {{ $data['institute_name'] }}</div>
                    <div class="info-item"><span class="label">Date:</span> {{ date('F j, Y, g:i a') }}</div>
                </div>

                <p><strong>Your Message:</strong></p>
                <div class="message-box">
                    {!! nl2br(e($data['message'])) !!}
                </div>

                <p style="color: #64748b; font-size: 14px; font-style: italic; margin-top: 24px; text-align: center;">
                    <strong>What's next?</strong> The institute will review your application and contact you directly
                    via phone or email.
                </p>
            </div>
            <div class="footer">
                <p>&copy; {{ date('Y') }} UniAds. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>

</html>
