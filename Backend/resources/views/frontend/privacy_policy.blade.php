<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Privacy Policy - UniAds</title>
    <link rel="stylesheet" href="{{ asset('frontend/css/style.css') }}">
    <style>
        body {
            font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: #f8fafc;
            margin: 0;
            padding: 0;
        }

        .doc-layout {
            display: flex;
            max-width: 1200px;
            margin: 40px auto;
            padding: 20px;
            gap: 30px;
        }

        /* Sidebar */
        .sidebar {
            flex: 0 0 20%;
            background: #fff;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
            position: sticky;
            top: 20px;
            height: fit-content;
        }

        .sidebar h2 {
            font-size: 18px;
            margin-bottom: 15px;
            color: #000000;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 8px;
        }

        .sidebar ul {
            list-style: none;
            padding: 0;
            margin: 0;
        }

        .sidebar ul li {
            margin-bottom: 10px;
        }

        .sidebar ul li a {
            text-decoration: none;
            color: #1d4ed8;
            font-size: 15px;
            transition: color 0.2s;
        }

        .sidebar ul li a:hover {
            color: #2563eb;
            font-weight: 500;
        }

        /* Content */
        .content {
            flex: 1;
            background: #fff;
            border-radius: 12px;
            padding: 30px;
            box-shadow: 0 6px 18px rgba(0, 0, 0, 0.05);
        }

        .content h1 {
            text-align: center;
            color: #2575FC;
            margin-bottom: 40px;
            font-size: 55px;
            margin-top: 0px;
        }

        .content h2 {
            color: #000000;
            margin-top: 30px;
            font-size: 22px;
            border-left: 4px solid #2575FC;
            padding-left: 10px;
        }

        .content p {
            line-height: 1.7;
            color: #334155;
            margin: 12px 0;
            text-align: justify;
        }

        html {
            scroll-behavior: smooth;
        }

        .last-updated {
            display: block;
            text-align: right;
            font-size: 14px;
            color: #6b7280;
            margin-bottom: 10px;
        }
    </style>
</head>

<body>

    <div class="doc-layout">
        <!-- Sidebar -->
        <aside class="sidebar">
            <h2>Table of Content</h2>
            <ul>
                @foreach ($sections as $section)
                    <li><a href="#section-{{ $section->id }}">{{ $section->title }}</a></li>
                @endforeach
            </ul>
        </aside>

        <!-- Content -->
        <main class="content">
            @if ($lastUpdated)
                <span class="last-updated">Last Updated: {{ $lastUpdated->format('F j, Y, g:i A') }}</span>
            @endif
            <h1>UniAds Privacy Policy</h1>

            @foreach ($sections as $section)
                <section id="section-{{ $section->id }}">
                    <h2>{{ $section->title }}</h2>
                    <p>{!! nl2br(e($section->content)) !!}</p>
                </section>
            @endforeach
        </main>
    </div>

</body>

</html>
