<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e1e1e1; border-radius: 10px; }
        .header { background: #f8f9fa; padding: 15px; border-bottom: 2px solid #3b82f6; border-radius: 10px 10px 0 0; }
        .content { padding: 20px; }
        .footer { font-size: 12px; color: #777; padding: 15px; border-top: 1px solid #e1e1e1; margin-top: 20px; }
        .institute-name { font-weight: bold; color: #3b82f6; }
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
            <div style="background: #f0f7ff; padding: 15px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                {!! nl2br(e($messageContent)) !!}
            </div>
            <p>If you have any further questions, feel free to reply to this email.</p>
        </div>
        <div class="footer">
            <p>Sent via UniAds - Your Educational Advertisement Partner</p>
        </div>
    </div>
</body>
</html>
