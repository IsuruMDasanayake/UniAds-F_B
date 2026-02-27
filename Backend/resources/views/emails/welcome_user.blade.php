<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <title>Welcome to UniAds</title>
    <style>
        body {
            font-family: 'Poppins', sans-serif;
            background-color: #f4f6f8;
            margin: 0;
            padding: 20px;
        }

        .container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }

        .logo-container {
            text-align: center;
            margin-bottom: 30px;
        }

        .logo {
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
    <div class="btn-container">
        <a href="{{ url('/feed') }}" class="btn">Start Exploring</a>
    </div>
    </div>

    <div class="footer">
        &copy; {{ date('Y') }} {{ $settings->site_name }}. All rights reserved.<br>
    </div>
    </div>
</body>

</html>
