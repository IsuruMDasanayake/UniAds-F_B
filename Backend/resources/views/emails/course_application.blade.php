<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>New Course Application</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <style>
        body {
            font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f4f4f4;
            color: #333;
            padding: 20px;
        }
        .container {
            background: #ffffff;
            padding: 20px 30px;
            border-radius: 8px;
            max-width: 600px;
            margin: auto;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        h2 {
            color: #007bff;
        }
        .field {
            margin-bottom: 15px;
        }
        .field strong {
            display: inline-block;
            width: 120px;
            color: #555;
        }
        .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #aaa;
            text-align: center;
        }
    </style>
</head>
<body>
<div class="container">
    <h2>New Course Application</h2>
    <p>You have received a new course application. Below are the details:</p>

    <div class="field"><strong>Course:</strong> {{ $data['course_title'] }}</div>
    <div class="field"><strong>Name:</strong> {{ $data['name'] }}</div>
    <div class="field"><strong>Email:</strong> {{ $data['email'] }}</div>
    <div class="field"><strong>Phone:</strong> {{ $data['phone'] }}</div>
    <div class="field"><strong>Message:</strong>{{ $data['message'] }}</div>

    <div class="footer">
        This email was generated from your UniAds profile course application form.
    </div>
</div>
</body>
</html>
