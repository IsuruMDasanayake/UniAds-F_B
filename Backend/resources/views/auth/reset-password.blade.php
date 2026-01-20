<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Password | UniAds</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <link rel="stylesheet" href="{{ asset('css/login.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>

<body>
    <div class="form-wrapper" style="height: auto;">
        <!-- Left Section - Brand -->
        <div class="form-left">
            <div class="form-logo-placeholder">
                <img src="{{ asset('logo.webp') }}" alt="UniAds Logo" class="form-logo" onerror="this.style.display='none'">
            </div>
            <h2>Reset Password</h2>
            <p>Secure your account by entering the reset code and a new password.</p>
        </div>

        <!-- Right Section - Form -->
        <div class="form-right">
            @if (session('status'))
            <div class="alert-success">
                {{ session('status') }}
                <span class="alert-close" onclick="this.parentElement.style.display='none'"></span>
            </div>
            @endif

            @if ($errors->any())
            <div class="alert-error">
                <ul style="margin: 0; padding-left: 15px;">
                    @foreach ($errors->all() as $error)
                    <li>{{ $error }}</li>
                    @endforeach
                </ul>
                <span class="alert-close" onclick="this.parentElement.style.display='none'"></span>
            </div>
            @endif

            <form method="POST" action="{{ route('password.reset') }}">
                @csrf
                <div class="input-group">
                    <label for="reset_code">Reset Code</label>
                    <input type="text" name="reset_code" id="reset_code" required placeholder="Enter code sent to email">
                </div>

                <div class="input-group">
                    <label for="password">New Password</label>
                    <div class="password-container">
                        <input type="password" name="password" id="password" required placeholder="At least 8 characters">
                        <i class="fa fa-eye toggle-password" onclick="togglePassword('password', this)"></i>
                    </div>
                </div>

                <div class="input-group">
                    <label for="password_confirmation">Confirm Password</label>
                    <div class="password-container">
                        <input type="password" name="password_confirmation" id="password_confirmation" required placeholder="Repeat new password">
                        <i class="fa fa-eye toggle-password" onclick="togglePassword('password_confirmation', this)"></i>
                    </div>
                </div>

                <button type="submit" class="auth-button" style="margin-top: 10px;">Reset Password</button>
            </form>
        </div>
    </div>

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

