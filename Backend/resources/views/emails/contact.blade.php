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

        .label {
            font-weight: bold;
            color: #1d375c;
            width: 100px;
            display: inline-block;
        }

        .message-box {
            background: #f0f7ff;
            padding: 15px;
            border-left: 4px solid #1d375c;
            margin: 20px 0;
        }

        .institute-highlight {
            color: #e42a19;
            font-weight: bold;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="header">
            <h2 style="margin:0; color: #1d375c;">Inquiry for <span class="institute-highlight">{{ $institute }}</span>
            </h2>
        </div>
        <div class="content">
            <p>You have received a new contact inquiry through UniAds:</p>

            <div style="margin-bottom: 10px;">
                <span class="label">From:</span> {{ $name }}
            </div>
            <div style="margin-bottom: 10px;">
                <span class="label">Email:</span> {{ $email }}
            </div>
            <div style="margin-bottom: 20px;">
                <span class="label">Subject:</span> {{ $subject }}
            </div>

            <p><strong>Message Content:</strong></p>
            <div class="message-box">
                {!! nl2br(e($messageContent)) !!}
            </div>
        </div>
        <div class="footer">
            <p>&copy; {{ date('Y') }} UniAds. All rights reserved.</p>
        </div>
    </div>
</body>

</html>
