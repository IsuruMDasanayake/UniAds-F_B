<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login | UniAds</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <link rel="stylesheet" href="{{ asset('css/login.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>
<body>

    <div class="form-wrapper">
        <!-- Left Section -->
        <div class="form-left">
            <img src="{{ asset('images/logoN.png') }}" alt="UniAds Logo" class="form-logo">
            <h2>Welcome Back!</h2>
            <p>Log in to continue exploring educational opportunities.</p>
        </div>

        <!-- Right Section -->
        <div class="form-right">
            <form action="{{ route('login') }}" method="POST">
                @csrf
                <div class="input-group">
                    <label for="email">EMAIL</label>
                    <input type="email" id="email" name="email" required>
                </div>

                <div class="input-group" style="margin-bottom: 10px;">
                    <label for="password">PASSWORD</label>
                    <div class="password-container">
                        <input type="password" id="password" name="password" required>
                        <i class="fa fa-eye toggle-password" onclick="togglePassword('password', this)"></i>
                    </div>
                </div>

                @if (Route::has('password.request'))
                    <div style="text-align: right; margin-bottom: 20px;">
                        <a href="{{ route('password.resetForm') }}" class="forgot-password-link">Forgot Password?</a>
                    </div>
                @endif

                <button type="submit" class="auth-button">Log In</button>
            </form>

            <p class="redirect">Don't have an account? <a href="{{ route('register') }}">Register here</a>.</p>
        </div>
    </div>

    @if(session('login_error'))
        <div class="alert-modal" id="loginErrorModal" style="display: flex;">
            <div class="alert-modal-content">
                <span class="alert-close-btn" onclick="document.getElementById('loginErrorModal').style.display='none'">&times;</span>
                <p style="color: #b30000; font-weight: 600;">{{ session('login_error') }}</p>
                <div style="margin-top:15px;">
                    <a href="{{ route('password.resetForm') }}" class="forgot-password-link" style="text-align: center;">Forgot Password?</a>
                </div>
            </div>
        </div>
    @endif

    <script>
        function togglePassword(inputId, icon) {
            const input = document.getElementById(inputId);
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        }
    </script>

</body>
</html>

