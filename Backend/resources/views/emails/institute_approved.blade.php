<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Institute Approved</title>
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

        .feature-list {
            background-color: #f1f5f9;
            padding: 24px;
            border-radius: 12px;
            border-left: 4px solid #2563eb;
            margin: 24px 0;
            color: #334155;
            list-style: none;
        }

        .feature-list li {
            margin-bottom: 8px;
        }

        .feature-list li::before {
            content: "✓ ";
            color: #2563eb;
            font-weight: bold;
        }

        .btn-container {
            text-align: center;
            margin: 35px 0;
        }

        .btn {
            background-color: #2563eb;
            color: #ffffff !important;
            padding: 14px 30px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 700;
            display: inline-block;
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
                <h1>Welcome to Our Platform!</h1>
            </div>
            <div class="content">
                <div class="greeting">Dear <strong>{{ $institute->institute_name }}</strong>,</div>

                <p>We are excited to inform you that your institute account has been <strong>APPROVED</strong> by our
                    administration team.</p>

                <p>You now have full access to:</p>
                <ul class="feature-list">
                    <li>Create and manage posts</li>
                    <li>Publish events</li>
                    <li>Update your institute profile</li>
                    <li>Engage with students and followers</li>
                </ul>

                <div class="btn-container">
                    <a href="http://localhost:3000/profile" class="btn">Login to Your Account</a>
                </div>

                <p style="color: #64748b; font-size: 14px; text-align: center;">If you have any questions, feel free to
                    contact our support team.</p>
            </div>
            <div class="footer">
                <p>&copy; {{ date('Y') }} UniAds. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>

</html>
