<!DOCTYPE html>
<html>

<head>
    <title>Institute Status Update</title>
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
            color: #ef4444;
            text-align: center;
            margin-top: 0;
        }

        .content {
            color: #374151;
            line-height: 1.6;
        }

        .reason-box {
            background-color: #fff1f2;
            border-left: 4px solid #ef4444;
            padding: 15px;
            margin: 20px 0;
            color: #991b1b;
        }

        .contact-info {
            background: #f3f4f6;
            padding: 15px 20px;
            list-style: none;
            border-radius: 6px;
            margin: 0;
        }

        .contact-info li {
            margin-bottom: 8px;
        }

        .contact-info li:last-child {
            margin-bottom: 0;
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
            @php
                $settings = \App\Models\PlatformSetting::getInstance();
                $logoPath = public_path('images/logo.png');
                if ($settings->logo_path && file_exists(public_path('storage/' . $settings->logo_path))) {
                    $logoPath = public_path('storage/' . $settings->logo_path);
                }
            @endphp
            <img src="{{ $message->embed($logoPath) }}" alt="{{ $settings->site_name }}" class="logo">
        </div>

        <h2>Account Status Update</h2>

        <div class="content">
            <p>Dear <strong>{{ $institute->institute_name }}</strong>,</p>

            <p>We regret to inform you that your institute account status has been changed to
                <strong>Unapproved/Pending</strong>.
            </p>

            <p>This means your access to creating posts, events, and other public features has been temporarily revoked.
            </p>

            <div class="reason-box">
                <p style="margin: 0;"><strong>Reason:</strong> Please contact the administration for more details
                    regarding this action.</p>
            </div>

            <p>To resolve this issue or appeal the decision, please contact our support team immediately using the
                credentials below:</p>

            <ul class="contact-info">
                <li><strong>Email:</strong> admin@uniads.com</li>
                <li><strong>Phone:</strong> +94 123 456 789</li>
            </ul>

            <p>We hope to resolve this matter with you soon.</p>
        </div>

        <div class="footer">
            &copy; {{ date('Y') }} UniAds. All rights reserved.
        </div>
    </div>

</body>

</html>
