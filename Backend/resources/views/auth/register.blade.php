<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Register | UniAds</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <link rel="stylesheet" href="{{ asset('css/register.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>

<body>

    <div class="form-wrapper">
        <!-- Left Section -->
        <div class="form-left">
            <img src="{{ asset('images/logoN.png') }}" alt="UniAds Logo" class="form-logo">
            <h2>Join UniAds</h2>
            <p>Create an account to start your educational journey.</p>
        </div>

        <!-- Right Section -->
        <div class="form-right">
            <form action="{{ route('register') }}" method="POST" onsubmit="return checkPasswords()">
                @csrf
                <div class="input-group">
                    <label for="name">Name</label>
                    <input type="text" id="name" name="name" required>
                </div>

                <div class="input-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" name="email" required>
                </div>

                <div class="input-group">
                    <label>Gender</label>
                    <div style="display:flex; gap:20px;">
                        <label>
                            <input type="radio" name="gender" value="Male" required> Male
                        </label>
                        <label>
                            <input type="radio" name="gender" value="Female"> Female
                        </label>
                    </div>
                </div>


                <div class="input-group">
                    <label for="birthday">Birthday</label>
                    <input type="date" id="birthday" name="birthday" max="{{ now()->toDateString() }}" required>
                </div>


                <div class="input-group">
                    <label for="district">District</label>
                    <select name="district" id="district" required>
                        <option value="">Select District</option>
                        @foreach (['Ampara', 'Anuradhapura', 'Badulla', 'Batticaloa', 'Colombo', 'Galle', 'Gampaha', 'Hambantota', 'Jaffna', 'Kalutara', 'Kandy', 'Kegalla', 'Kilinochchi', 'Kurunegala', 'Mannar', 'Matale', 'Matara', 'Moneragala', 'Mullaitivu', 'Nuwara Eliya', 'Polonnaruwa', 'Puttalam', 'Ratnapura', 'Trincomalee', 'Vavuniya'] as $district)
                            <option value="{{ $district }}">{{ $district }}</option>
                        @endforeach
                    </select>
                </div>


                <div class="input-group">
                    <label for="education_level">Education Level</label>
                    <select name="education_level" id="education_level" required>
                        <option value="">Select Education Level</option>
                        <option value="O/L">O/L</option>
                        <option value="A/L">A/L</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Undergraduate">Undergraduate</option>
                        <option value="Bachelor's">Bachelor's</option>
                        <option value="Postgraduate">Postgraduate</option>
                        <option value="Master's">Master's</option>
                        <option value="Other">Other</option>
                    </select>
                </div>


                <div class="input-group">
                    <label for="password">Password</label>
                    <div class="password-container">
                        <input type="password" id="password" name="password" minlength="8" required>
                        <i class="fa fa-eye toggle-password" onclick="togglePassword('password', this)"></i>
                    </div>
                </div>

                <div class="input-group">
                    <label for="password_confirmation">Confirm Password</label>
                    <div class="password-container">
                        <input type="password" id="password_confirmation" name="password_confirmation" minlength="8"
                            required>
                        <i class="fa fa-eye toggle-password"
                            onclick="togglePassword('password_confirmation', this)"></i>
                    </div>
                </div>

                <button type="submit" class="auth-button">Register</button>
            </form>

            <p class="redirect">Already have an account? <a href="{{ route('login') }}">Log in here</a>.</p>

            <!-- Institute Registration Button -->
            <div class="institute-section">
                <p class="institute-text">Are you an institute? Register here:</p>
                <a href="{{ url('/institutionprofileadd') }}" class="institute-button">INSTITUTE REGISTRATION</a>
            </div>
        </div>
    </div>

    @if (session('email_exists'))
        <div id="emailExistsModal" class="modal" style="display:block;">
            <div class="modal-content">
                <h2>Email Already Registered</h2>
                <p>The email you entered is already associated with an account.</p>
                <a href="{{ route('password.resetForm') }}" class="forgot-password-link">
                    Click here to reset your password
                </a>
            </div>
        </div>
    @endif

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            @if (session('email_exists'))
                document.getElementById('emailExistsModal').style.display = 'flex';
            @endif
        });

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

        function checkPasswords() {
            let password = document.getElementById("password").value;
            let confirmPassword = document.getElementById("password_confirmation").value;

            if (password !== confirmPassword) {
                alert("Passwords do not match!");
                return false; // Stop form submission
            }
            return true; // Allow form submission
        }
    </script>

</body>

</html>
