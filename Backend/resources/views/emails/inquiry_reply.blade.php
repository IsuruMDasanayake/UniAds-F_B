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

        .message-box {
            background-color: #f1f5f9;
            padding: 24px;
            border-radius: 12px;
            border-left: 4px solid #2563eb;
            margin: 24px 0;
            color: #334155;
            font-size: 16px;
        }

        .no-reply-notice {
            background-color: #fef2f2;
            border: 1px solid #fee2e2;
            padding: 16px;
            border-radius: 8px;
            color: #991b1b;
            font-size: 14px;
            margin-top: 32px;
            text-align: center;
        }

        .footer {
            padding: 30px;
            text-align: center;
            font-size: 13px;
            color: #64748b;
            background-color: #f8fafc;
        }

        .institute-name {
            color: #2563eb;
            font-weight: 700;
        }
    </style>
</head>

<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <h1>Response to Your Inquiry</h1>
            </div>
            <div class="content">
                <div class="greeting">Hello {{ $student_name }},</div>
                <p>We have received a response from <span class="institute-name">{{ $institute_name }}</span> regarding
                    your recent inquiry about <strong>"{{ $subject }}"</strong>.</p>

                <div class="message-box">
                    {!! nl2br(e($messageContent)) !!}
                </div>

                <p>If you need further assistance, please contact the institute directly through their official contact
                    channels provided on their profile page.</p>

                <div class="no-reply-notice">
                    <strong>Note:</strong> This is an automated notification. Replies to this email are not monitored.
                </div>
            </div>
            <div class="footer">
                <p>&copy; {{ date('Y') }} UniAds. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>

</html>
