<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Message</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
</head>
<body>
    <h3>UniAds Contact Message for {{ $institute }}</h3>
    <p><strong>From:</strong> {{ $name }} ({{ $email }})</p>
    <p><strong>Subject:</strong> {{ $subject }}</p>
    <p><strong>Message:</strong></p>
    <p>{{ $messageContent }}</p>
</body>
</html>
