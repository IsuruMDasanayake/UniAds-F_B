<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
    <style>
        body {
            font-family: 'Helvetica', 'Arial', sans-serif;
            color: #334155;
            line-height: 1.5;
            margin: 0;
            padding: 0;
        }
        .container {
            padding: 30px;
        }
        .header {
            border-bottom: 2px solid #e2e8f0;
            padding-bottom: 20px;
            margin-bottom: 30px;
        }
        .header-top {
            display: table;
            width: 100%;
            table-layout: fixed;
        }
        .logo-container {
            display: table-cell;
            vertical-align: middle;
            width: 80px;
        }
        .uniads-logo-container {
            display: table-cell;
            vertical-align: middle;
            text-align: right;
            width: 120px;
        }
        .logo {
            width: 65px;
            height: 65px;
            border-radius: 12px;
            object-fit: cover;
        }
        .uniads-logo {
            width: 110px;
            height: auto;
        }
        .institute-info {
            display: table-cell;
            vertical-align: middle;
            padding-left: 15px;
        }
        .institute-name {
            font-size: 24px;
            font-weight: bold;
            color: #1e293b;
            margin: 0;
        }
        .report-meta {
            font-size: 14px;
            color: #64748b;
            margin-top: 5px;
        }
        .report-title {
            font-size: 28px;
            font-weight: 800;
            color: #2563eb;
            margin-top: 20px;
            text-transform: uppercase;
        }
        .section-title {
            font-size: 18px;
            font-weight: 700;
            color: #1e293b;
            margin-top: 30px;
            margin-bottom: 15px;
            border-left: 4px solid #2563eb;
            padding-left: 12px;
        }
        .metrics-grid {
            display: table;
            width: 100%;
            border-spacing: 15px;
            margin-left: -15px;
            margin-right: -15px;
        }
        .metric-card {
            display: table-cell;
            background: #f8fafc;
            border: 1px solid #f1f5f9;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            width: 20%;
        }
        .metric-value {
            font-size: 22px;
            font-weight: 800;
            color: #1e293b;
            margin: 0;
        }
        .metric-label {
            font-size: 12px;
            color: #64748b;
            text-transform: uppercase;
            font-weight: 600;
            letter-spacing: 0.05em;
        }
        .chart-container {
            margin-top: 30px;
            text-align: center;
            background: #fff;
            padding: 20px;
            border: 1px solid #e2e8f0;
            border-radius: 16px;
        }
        .chart-img {
            max-width: 100%;
            height: auto;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
        }
        th {
            background-color: #f8fafc;
            color: #64748b;
            font-size: 12px;
            font-weight: 700;
            text-transform: uppercase;
            text-align: left;
            padding: 12px 15px;
            border-bottom: 1px solid #e2e8f0;
        }
        td {
            padding: 12px 15px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 14px;
        }
        .footer {
            position: fixed;
            bottom: 30px;
            left: 30px;
            right: 30px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            font-size: 12px;
            color: #94a3b8;
            text-align: center;
        }
        .page-number:after {
            content: counter(page);
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="header-top">
                @if($logo)
                    <div class="logo-container">
                        <img src="{{ $logo }}" class="logo">
                    </div>
                @endif
                <div class="institute-info">
                    <h1 class="institute-name">{{ $instituteName }}</h1>
                    <div class="report-meta">
                        Generated on {{ date('F j, Y, g:i a') }} &bull; Period: {{ $range }}
                    </div>
                </div>
                @if($uniads_logo)
                    <div class="uniads-logo-container">
                        <img src="{{ $uniads_logo }}" class="uniads-logo">
                    </div>
                @endif
            </div>
            <div class="report-title">{{ $title }}</div>
        </div>

        @yield('content')

        <div class="footer">
            <div>&copy; {{ date('Y') }} {{ $instituteName }} - Generated via UniAds Analytics</div>
            <div style="margin-top: 5px;">Page <span class="page-number"></span></div>
        </div>
    </div>
</body>
</html>
