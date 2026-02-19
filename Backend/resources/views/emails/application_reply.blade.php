<!DOCTYPE html>
<html>

<head>
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            line-height: 1.6;
            color: #333;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            border: 1px solid #e1e1e1;
            border-radius: 10px;
        }

        .header {
            background: #f8f9fa;
            padding: 15px;
            border-bottom: 2px solid #1d375c;
            border-radius: 10px 10px 0 0;
        }

        .content {
            padding: 20px;
        }

        .footer {
            font-size: 12px;
            color: #777;
            padding: 15px;
            border-top: 1px solid #e1e1e1;
            margin-top: 20px;
        }

        .institute-name {
            font-weight: bold;
            color: #e42a19;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h2>Reply from <span class="institute-name">{{ $institute_name }}</span></h2>
        </div>
        <div class="content">
            <p>Dear {{ $student_name }},</p>
            <p>Thank you for your interest in our course. Below is the message from our academy:</p>
            <div style="background: #f0f7ff; padding: 15px; border-left: 4px solid #1d375c; margin: 20px 0;">
                {!! nl2br(e($messageContent)) !!}
            </div>
            <p
                style="color: #666; font-size: 0.9rem; font-style: italic; margin-top: 20px; border-top: 1px dashed #ddd; padding-top: 10px;">
                Note: This is a system-generated notification. Please <strong>do not reply</strong> to this email. Our
                academy will contact you shortly via phone or secondary email for further proceedings.
            </p>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} UniAds. All rights reserved.</p>
        </div>
    </div>
</body>

</html>
