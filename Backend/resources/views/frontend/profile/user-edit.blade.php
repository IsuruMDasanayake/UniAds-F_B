<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Edit Profile - UniAds</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <link rel="stylesheet" href="{{ asset('css/style.css') }}">
    <link rel="stylesheet" href="{{ asset('css/useredit.css') }}">
    <style>

    </style>
</head>

<body>

    <div class="profile-container">
        <!-- Profile Picture Section -->
        <div class="profile-pic-section">
            <form action="{{ route('profile.update') }}" method="POST" enctype="multipart/form-data">
                @csrf
                @method('PATCH')
                <img src="{{ asset('storage/' . (Auth::user()->profile_picture ?? 'default-avatar.png')) }}"
                    alt="Profile Picture" id="profile-preview" class="profile-img">
                <input type="file" name="profile_picture" id="profile-picture" accept="image/*">
                <input type="text" id="name" name="name" placeholder="Name"
                    value="{{ old('name', Auth::user()->name) }}" required>
                <input type="email" id="email" name="email" placeholder="Email"
                    value="{{ old('email', Auth::user()->email) }}" required>
                <button type="submit" class="btn-primary">Update Profile</button>

            </form>
        </div>

        <!-- Form Section -->
        <div class="form-section">
            <h2>Update Password</h2>
            <form method="POST" action="{{ route('password.update') }}" enctype="multipart/form-data">
                @csrf
                @method('PATCH')
                <!-- Current Password -->
                <div class="form-group">
                    <label for="current_password">Current Password</label>
                    <input type="password" name="current_password" id="current_password" class="form-control" required>
                    @error('current_password')
                        <div class="error-message">{{ $message }}</div>
                    @enderror
                </div>

                <!-- New Password -->
                <div class="form-group">
                    <label for="new_password">New Password</label>
                    <input type="password" name="new_password" id="new_password" class="form-control" required>
                </div>

                <!-- Confirm New Password -->
                <div class="form-group">
                    <label for="new_password_confirmation">Confirm New Password</label>
                    <input type="password" name="new_password_confirmation" id="new_password_confirmation"
                        class="form-control" required>
                    @error('new_password')
                        <div class="error-message">{{ $message }}</div>
                    @enderror
                </div>

                <button type="submit" class="btn-primary">Update Password</button>

            </form>

            <!-- Delete Account -->
            <button type="button" class="btn-danger" onclick="showDeleteDialog()">Delete Account</button>
        </div>

        <!-- Success Popup -->
        @if (session('success'))
            <div id="successPopup" class="success-popup">
                <div class="popup-content">
                    <p>{{ session('success') }}</p>
                </div>
            </div>
        @endif
    </div>

    <div id="overlay"></div>

    <div id="deleteDialog">
        <div class="dialog-message">Are you sure you want to delete your account? This action cannot be undone.</div>
        <form method="POST" action="{{ route('profile.destroy') }}">
            @csrf
            @method('DELETE')
            <button type="submit" class="btn-danger">Delete My Account</button>
        </form>
        <button onclick="closeDeleteDialog()" class="btn-primary">Cancel</button>
    </div>

    <script>
        function showDeleteDialog() {
            document.getElementById('deleteDialog').style.display = 'block';
            document.getElementById('overlay').style.display = 'block';
        }

        function closeDeleteDialog() {
            document.getElementById('deleteDialog').style.display = 'none';
            document.getElementById('overlay').style.display = 'none';
        }



        //pop up success
        @if (session('success'))
            window.onload = function() {
                var successPopup = document.getElementById('successPopup');
                successPopup.style.display = 'flex';

                setTimeout(function() {
                    successPopup.style.display = 'none';

                    setTimeout(function() {
                        window.history.go(-2); // Go back two pages
                    }, 200);
                }, 2000);
            };
        @endif


        // Image preview function
        document.getElementById('profile-picture').addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('profile-preview').src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        });
    </script>

</body>

</html>
