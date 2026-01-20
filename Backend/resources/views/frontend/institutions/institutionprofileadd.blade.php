<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Register Your Institute</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}" />
    <link rel="stylesheet" href="{{ asset('css/institutereg.css') }}" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
    <style>
        
    </style>
</head>
<body>
    {{-- SUCCESS MESSAGE (e.g. after redirect from register to login, if redirected here) --}}
    @if (session('success'))
    <div class="alert-success">
        <span class="alert-close" onclick="this.parentElement.style.display='none';">&times;</span>
        {{ session('success') }}
    </div>
    @endif

    {{-- VALIDATION ERRORS --}}
    {{-- @if ($errors->any())
    <div class="alert-error">
        <span class="alert-close" onclick="this.parentElement.style.display='none';">&times;</span>
        <ul style="margin-left: 20px;">
            @foreach ($errors->all() as $error)
                <li>{{ $error }}</li>
            @endforeach
        </ul>
    </div>
    @endif --}}

    <div class="form-wrapper">
        <!-- Left Section -->
        <div class="form-left">
            <h2>Register Your Institute</h2>
            <p>Join UniAds and showcase your institute to the world.</p>
            <ul>
                <li><strong>Basic Privileges on Approval:</strong> Get started with editing your profile and exploring features until approved by the admin.</li>
                <li><strong>Profile Customization:</strong> Add your institute’s bio, photos, contact details, and more.</li>
                <li><strong>Insightful Analytics:</strong> Track views and engagement to understand your audience better.</li>
                <li><strong>24/7 Support:</strong> Get assistance whenever you need help managing your institute profile.</li>
            </ul>
        </div>

        <!-- Right Section -->
        <div class="form-right">
            <form action="{{ route('institute.store') }}" method="POST" novalidate>
                @csrf

                <!-- Institute Name -->
                <div class="form-group">
                    <label for="institute_name">Institute Name</label>
                    <input
                      type="text"
                      id="institute_name"
                      name="institute_name"
                      value="{{ old('institute_name') }}"
                      required
                    />
                    @error('institute_name')
                        <div class="input-hint error">{{ $message }}</div>
                    @enderror
                </div>

                <!-- Email -->
                <div class="form-group">
                    <label for="email">Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value="{{ old('email') }}"
                      required
                    />
                    @error('email')
                        <div class="input-hint error">{{ $message }}</div>
                    @enderror
                </div>

                <!-- Location -->
                <div class="form-group">
                    <label for="location">Location</label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value="{{ old('location') }}"
                      required
                    />
                    @error('location')
                        <div class="input-hint error">{{ $message }}</div>
                    @enderror
                </div>

                <!-- Government Registration Number -->
                <div class="form-group">
                    <label for="gov_register_number">Government Registration Number</label>
                    <input
                      type="text"
                      id="gov_register_number"
                      name="gov_register_number"
                      value="{{ old('gov_register_number') }}"
                      required
                    />
                    <div id="gov-info" class="input-hint"></div>
                    @error('gov_register_number')
                        <div class="input-hint error">{{ $message }}</div>
                    @enderror
                </div>

                <!-- Website -->
                <div class="form-group">
                    <label for="website">Website</label>
                    <input
                      type="url"
                      id="website"
                      name="website"
                      value="{{ old('website') }}"
                      placeholder="https://example.com"
                      required
                    />
                    <div id="website-info" class="input-hint"></div>
                    @error('website')
                        <div class="input-hint error">{{ $message }}</div>
                    @enderror
                </div>

                <!-- Contact Number -->
                <div class="form-group">
                    <label for="contact_number">Contact Number</label>
                    <input
                      type="tel"
                      id="contact_number"
                      name="contact_number"
                      value="{{ old('contact_number') }}"
                      placeholder="+94123456789 or 0112345678"
                      required
                    />
                    <div id="contact-info" class="input-hint"></div>
                    @error('contact_number')
                        <div class="input-hint error">{{ $message }}</div>
                    @enderror
                </div>

                <!-- Password -->
                <div class="form-group">
                    <label for="password">Password</label>
                    <div class="password-container">
                        <input type="password" id="password" name="password" required />
                        <i class="fa fa-eye toggle-password" onclick="togglePassword('password', this)"></i>
                    </div>
                    <div id="strength-text" class="input-hint"></div>
                    @error('password')
                        <div class="input-hint error">{{ $message }}</div>
                    @enderror
                </div>

                <!-- Confirm Password -->
                <div class="form-group">
                    <label for="password_confirmation">Confirm Password</label>
                    <div class="password-container">
                        <input
                          type="password"
                          id="password_confirmation"
                          name="password_confirmation"
                          required
                        />
                        <i class="fa fa-eye toggle-password" onclick="togglePassword('password_confirmation', this)"></i>
                    </div>
                    <div id="confirm-password-error" class="input-hint error" style="display:none;">
                      Passwords do not match.
                    </div>
                </div>

                <!-- Submit Button -->
                <button type="submit" class="auth-button">Register Institute</button>
            </form>
        </div>
    </div>

    {{-- <!-- Error Modal -->
    <div id="error-modal" class="modal" style="display:none;">
      <div class="modal-content">
        <span class="close-btn" id="modal-close">&times;</span>
        <p id="modal-message"></p>
      </div>
    </div> --}}

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

        // Password strength check
        const passwordInput = document.getElementById('password');
        const strengthText = document.getElementById('strength-text');

        passwordInput.addEventListener('input', () => {
            const password = passwordInput.value;
            const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

            if (password.length === 0) {
                strengthText.textContent = '';
                strengthText.className = 'input-hint';
                return;
            }

            if (strongRegex.test(password)) {
                strengthText.textContent = 'Strong password ✅';
                strengthText.className = 'input-hint success';
            } else {
                strengthText.textContent = 'Password must contain uppercase, lowercase, number & special char, min 8 chars.';
                strengthText.className = 'input-hint error';
            }
        });

        // Confirm password matching
        const confirmPasswordInput = document.getElementById('password_confirmation');
        const confirmPasswordError = document.getElementById('confirm-password-error');

        confirmPasswordInput.addEventListener('input', () => {
            if (confirmPasswordInput.value !== passwordInput.value) {
                confirmPasswordError.style.display = 'block';
            } else {
                confirmPasswordError.style.display = 'none';
            }
        });

        passwordInput.addEventListener('input', () => {
            if (confirmPasswordInput.value !== passwordInput.value) {
                confirmPasswordError.style.display = 'block';
            } else {
                confirmPasswordError.style.display = 'none';
            }
        });

        // Contact number live validation
        const contactInput = document.getElementById('contact_number');
        const contactInfo = document.getElementById('contact-info');

        contactInput.addEventListener('input', () => {
            const val = contactInput.value.trim();
            const contactRegex = /^(\+94\d{9}|0\d{9})$/;

            if (val === '') {
                contactInfo.textContent = '';
                contactInfo.className = 'input-hint';
                return;
            }

            if (!contactRegex.test(val)) {
                contactInfo.textContent = 'Contact number must be in the format +94XXXXXXXXX or 01XXXXXXXX with no spaces.';
                contactInfo.className = 'input-hint error';
            } else {
                contactInfo.textContent = 'Valid contact number format.';
                contactInfo.className = 'input-hint success';
            }
        });

        // Website URL validation on typing (must start with https://)
        const websiteInput = document.getElementById('website');
        const websiteInfo = document.getElementById('website-info');

        websiteInput.addEventListener('input', () => {
            const val = websiteInput.value.trim();
            if (val === '') {
                websiteInfo.textContent = '';
                websiteInfo.className = 'input-hint';
                return;
            }

            if (!val.startsWith('https://')) {
                websiteInfo.textContent = 'Website URL must start with https://';
                websiteInfo.className = 'input-hint error';
            } else {
                websiteInfo.textContent = '';
                websiteInfo.className = 'input-hint';
            }
        });

        // Modal for gov_register_number errors
        const modal = document.getElementById('error-modal');
        const modalMessage = document.getElementById('modal-message');
        const modalCloseBtn = document.getElementById('modal-close');

        if (modalCloseBtn) {
            modalCloseBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });
        }

        window.addEventListener('click', (event) => {
            if (event.target === modal) {
                modal.style.display = 'none';
            }
        });

        function showErrorModal(message) {
            if (modalMessage && modal) {
                modalMessage.textContent = message;
                modal.style.display = 'flex';
            }
        }

        // Show modal on gov_register_number error from backend
        @if ($errors->has('gov_register_number'))
            showErrorModal("{{ $errors->first('gov_register_number') }}");
        @endif

        // Prevent form submission if passwords do not match
        document.querySelector('form').addEventListener('submit', function(e) {
            if (passwordInput.value !== confirmPasswordInput.value) {
                e.preventDefault();
                confirmPasswordError.style.display = 'block';
                confirmPasswordError.scrollIntoView({ behavior: 'smooth' });
                return false;
            }
        });
    </script>
</body>
</html>
