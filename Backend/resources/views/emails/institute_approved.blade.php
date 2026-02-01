<!DOCTYPE html>
<html>

<head>
    <title>Institute Approved</title>
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #f4f6f8;
            padding: 20px;
            margin: 0;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            padding: 30px;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .logo-container {
            text-align: center;
            margin-bottom: 20px;
        }

        .logo {
            height: 150px;
            width: auto;
        }

        h2 {
            color: #1d375c;
            text-align: center;
            margin-top: 0;
        }

        .content {
            color: #374151;
            line-height: 1.6;
        }

        ul {
            margin-bottom: 25px;
        }

        li {
            margin-bottom: 8px;
        }

        .btn-container {
            text-align: center;
            margin: 30px 0;
        }

        .btn {
            background-color: #e42a19;
            color: #ffffff !important;
            padding: 12px 24px;
            text-decoration: none;
            border-radius: 12px;
            font-weight: bold;
            display: inline-block;
        }

        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #6b7280;
            text-align: center;
            border-top: 1px solid #e5e7eb;
            padding-top: 20px;
        }
    </style>
</head>

<body>

    <div class="container">
        <div class="logo-container">
            <img src="{{ $message->embed(public_path('images/logo.png')) }}" alt="UniAds Logo" class="logo">
        </div>

        <h2>Welcome to Our Platform!</h2>

        <div class="content">
            <p>Dear <strong>{{ $institute->institute_name }}</strong>,</p>

            <p>We are excited to inform you that your institute account has been <strong>APPROVED</strong> by our
                administration team.</p>

            <p>You now have full access to:</p>
            <ul>
                <li>Create and manage posts</li>
                <li>Publish events</li>
                <li>Update your institute profile</li>
                <li>Engage with students and followers</li>
            </ul>

            <div class="btn-container">
                <a href="http://localhost:3000/profile" class="btn">Login to Your Account</a>
            </div>

            <p>If you have any questions, feel free to contact our support team.</p>
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} UniAds. All rights reserved.
        </div>
    </div>

</body>

</html>
