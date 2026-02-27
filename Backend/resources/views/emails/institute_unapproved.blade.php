<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Institute Status Update</title>
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

        .reason-box {
            background-color: #fef2f2;
            border-left: 4px solid #ef4444;
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            color: #991b1b;
            font-size: 16px;
        }

        .contact-info {
            background-color: #f1f5f9;
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
            color: #334155;
            list-style: none;
        }

        .contact-info li {
            margin-bottom: 8px;
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
                <h1>Account Status Update</h1>
            </div>
            <div class="content">
                <div class="greeting">Dear <strong>{{ $institute->institute_name }}</strong>,</div>

                <p>We regret to inform you that your institute account status has been changed to
                    <strong>Unapproved/Pending</strong>.
                </p>

                <p>This means your access to creating posts, events, and other public features has been temporarily
                    revoked.
                </p>

                <div class="reason-box">
                    <p style="margin: 0;"><strong>Reason:</strong> Please contact the administration for more details
                        regarding this action.</p>
                </div>

                <p>To resolve this issue or appeal the decision, please contact our support team immediately using the
                    credentials below:</p>

                <ul class="contact-info">
                    <li><strong>Email:</strong> {{ $platformSettings->support_email }}</li>
                    <li><strong>Phone:</strong> {{ $platformSettings->support_phone }}</li>
                </ul>

                <p>We hope to resolve this matter with you soon.</p>
            </div>
            <div class="footer">
                <p>&copy; {{ date('Y') }} UniAds. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>

</html>
