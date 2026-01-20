<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Forgot Password | UniAds</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <link rel="stylesheet" href="{{ asset('css/login.css') }}">
</head>

<body>
    <div class="form-wrapper" style="height: auto;">
        <!-- Left Section - Brand -->
        <div class="form-left">
            <div class="form-logo-placeholder">
                <img src="{{ asset('logo.webp') }}" alt="UniAds Logo" class="form-logo" onerror="this.style.display='none'">
            </div>
            <h2>Forgot Password?</h2>
            <p>Don't worry, it happens. Enter your email and we'll send you a reset code.</p>
        </div>

        <!-- Right Section - Form -->
        <div class="form-right">
            <!-- Show session status message -->
            @if (session('status'))
            <div class="alert-success">
                {{ session('status') }}
                <span class="alert-close" onclick="this.parentElement.style.display='none'">&times;</span>
            </div>
            @endif

            <!-- Show error messages -->
            @if ($errors->any())
            <div class="alert-error">
                <ul style="margin: 0; padding-left: 15px;">
                    @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                    @endforeach
                </ul>
                <span class="alert-close" onclick="this.parentElement.style.display='none'">&times;</span>
            </div>
            @endif

            <form method="POST" action="{{ route('password.sendResetCode') }}">
                @csrf
                <div class="input-group">
                    <label for="email">Email Address</label>
                    <input type="email" id="email" name="email" required placeholder="example@mail.com" value="{{ old('email') }}">
                </div>
                
                <button type="submit" class="auth-button" style="margin-top: 20px;">Send Reset Code</button>
            </form>

            <div class="redirect" style="margin-top: 10px;">
                <p>Remember your password? <a href="{{ route('login') }}">Login</a></p>
                <p>New to UniAds? <a href="{{ route('register') }}">Register here</a></p>
            </div>
        </div>
    </div>
</body>

</html>