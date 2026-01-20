<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>University Profile</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    {{-- <link rel="stylesheet" href="{{ asset('css/addpost.css') }}"> --}}
    <link rel="stylesheet" href="{{ asset('css/instituteedit.css') }}">
    <link rel="stylesheet" href="{{ asset('css/feed.css') }}">
    <script src="{{ asset('js/navbar.js') }}"></script>
    <script src="{{ asset('js/actionbuttons.js') }}"></script>
    <script src="https://cdn.ckeditor.com/ckeditor5/41.4.2/classic/ckeditor.js"></script>

</head>

<body>

    @include('frontend.navbar')


    <div class="profile-container">
        <!-- Cover Photo -->
        <img src="{{ $institute->cover_photo ? asset('storage/' . $institute->cover_photo) : asset('images/cover.png') }}"
            alt="Cover" class="photo-preview cover-photo">

        <!-- Profile Section -->
        <div class="profile-section">
            <div class="profile-section">
                <div class="profile-picture">
                    <img src="{{ $institute->profile_photo ? asset('storage/' . $institute->profile_photo) : asset('images/profile.png') }}"
                        alt="Profile Picture">
                </div>

                <!-- Profile Details -->
                <div class="profile-details">
                    <h1 id="universityName">
                        {{ $institute->institute_name }}
                        @if (
                            $institute->is_premium &&
                                $institute->premium_expires_at &&
                                now()->lessThanOrEqualTo($institute->premium_expires_at))
                            <img src="{{ asset('images/verified-badge.png') }}" alt="Premium Verified"
                                class="premium-badge" title="Premium Verified">
                        @endif
                    </h1>
                    <p><strong id="bio"> {{ $institute->bio }}</strong>
                    <p><strong>Location:</strong> {{ $institute->location }}</p>
                    <p><strong>Email:</strong> {{ $institute->email }}</p>

                    @if (
                        $institute->is_premium &&
                            $institute->premium_expires_at &&
                            now()->lessThanOrEqualTo($institute->premium_expires_at) &&
                            $institute->followers_enabled)
                        <p><strong>Institute Followers:</strong> <span
                                id="follower-count">{{ $institute->followers_count }}</span></p>
                    @endif

                    @if (
                        $institute->is_premium &&
                            $institute->premium_expires_at &&
                            now()->lessThanOrEqualTo($institute->premium_expires_at) &&
                            $institute->reviews_enabled)
                        <div class="stars-summary">
                            @php
                                $avg = round($institute->averageRating(), 1);
                                $fullStars = floor($avg);
                                $halfStar = $avg - $fullStars >= 0.5 ? true : false;
                                $emptyStars = 5 - $fullStars - ($halfStar ? 1 : 0);
                            @endphp

                            <div class="star-display">
                                @for ($i = 0; $i < $fullStars; $i++)
                                    <i class="fas fa-star"></i>
                                @endfor

                                @if ($halfStar)
                                    <i class="fas fa-star-half-alt"></i>
                                @endif

                                @for ($i = 0; $i < $emptyStars; $i++)
                                    <i class="far fa-star"></i>
                                @endfor

                                <span class="numeric-rating">({{ $avg }}) - {{ $institute->ratingCount() }}
                                    Ratings</span>
                            </div>
                        </div>
                    @endif
                </div>

                <!-- Action Buttons (Visible only to logged-in institute owner) -->
                @if (Auth::check() && Auth::user()->role === 'Institute' && Auth::user()->id === $institute->user_id)
                    <div class="action-buttons">

                        @if (
                            $institute->is_premium &&
                                $institute->premium_expires_at &&
                                now()->lessThanOrEqualTo($institute->premium_expires_at) &&
                                $institute->reviews_enabled)
                            <div class="stars-summary">
                                @php
                                    $avg = round($institute->averageRating(), 1);
                                    $fullStars = floor($avg);
                                    $halfStar = $avg - $fullStars >= 0.5 ? true : false;
                                    $emptyStars = 5 - $fullStars - ($halfStar ? 1 : 0);
                                @endphp

                                <div class="star-display">
                                    @for ($i = 0; $i < $fullStars; $i++)
                                        <i class="fas fa-star"></i>
                                    @endfor

                                    @if ($halfStar)
                                        <i class="fas fa-star-half-alt"></i>
                                    @endif

                                    @for ($i = 0; $i < $emptyStars; $i++)
                                        <i class="far fa-star"></i>
                                    @endfor

                                    <span class="numeric-rating">({{ $avg }}) -
                                        {{ $institute->ratingCount() }} Ratings</span>
                                </div>
                            </div>

                        @endif

                        <button class="btn-add-post"
                            onclick="{{ $institute->status === 'approved' ? 'openAddPostModal()' : 'showApprovalMessage()' }}">
                            <i class="material-icons">add_circle</i> Add Post
                        </button>

                        <button class="btn-add-event"
                            onclick="{{ $institute->status === 'approved' ? 'openAddEventModal()' : 'showApprovalMessage()' }}">
                            <i class="material-icons">event</i> Add Event
                        </button>

                        {{-- <button class="btn-add-scholarship">
                            <i class="material-icons">redeem</i> Scholarship
                        </button> --}}

                        <button class="btn-edit-profile" onclick="openModal()">
                            <i class="material-icons">edit</i> Edit Profile
                        </button>
                    </div>
                @endif
            </div>

            @if (Auth::check() &&
                    Auth::user()->role !== 'Institute' &&
                    $institute->is_premium &&
                    $institute->premium_expires_at &&
                    now()->lessThanOrEqualTo($institute->premium_expires_at) &&
                    $institute->reviews_enabled)
                <!-- Ratings + Follow Buttons -->
                <div class="rating-follow-wrapper">

                    <!-- Ratings Summary -->
                    <div class="stars-summary">
                        @php
                            $avg = round($institute->averageRating(), 1);
                            $fullStars = floor($avg);
                            $halfStar = $avg - $fullStars >= 0.5 ? true : false;
                            $emptyStars = 5 - $fullStars - ($halfStar ? 1 : 0);
                        @endphp

                        <div class="star-display">
                            @for ($i = 0; $i < $fullStars; $i++)
                                <i class="fas fa-star"></i>
                            @endfor

                            @if ($halfStar)
                                <i class="fas fa-star-half-alt"></i>
                            @endif

                            @for ($i = 0; $i < $emptyStars; $i++)
                                <i class="far fa-star"></i>
                            @endfor

                            <span class="numeric-rating">({{ $avg }}) - {{ $institute->ratingCount() }}
                                Ratings</span>
                        </div>
                    </div>
            @endif

            @if (Auth::check() &&
                    Auth::user()->role !== 'Institute' &&
                    $institute->is_premium &&
                    $institute->premium_expires_at &&
                    now()->lessThanOrEqualTo($institute->premium_expires_at) &&
                    $institute->followers_enabled)
                <button id="follow-btn" data-id="{{ $institute->id }}" class="{{ $isFollowing ? 'followed' : '' }}">
                    {{ $isFollowing ? 'Followed' : 'Follow' }}
                </button>
            @endif


            @if (Auth::check() &&
                    Auth::user()->role !== 'Institute' &&
                    $institute->is_premium &&
                    $institute->premium_expires_at &&
                    now()->lessThanOrEqualTo($institute->premium_expires_at) &&
                    $institute->reviews_enabled)
                <button id="open-reviews-modal" class="btn-review-toggle">
                    Reviews & Ratings
                </button>
        </div>
        @endif
    </div>

    <!-- Ratings & Reviews Modal -->
    <div id="reviews-modal" class="modal">
        <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h3>Reviews & Ratings</h3>

            <!-- Rating Form -->
            @if (Auth::check() && Auth::user()->role !== 'Institute' && $institute->reviews_enabled)
                <form method="POST" action="{{ route('institute.rate', $institute->id) }}" class="rating-form">
                    @csrf
                    <label>Rating:</label>
                    <select name="rating" required>
                        <option value="">-- Select --</option>
                        @for ($i = 5; $i >= 1; $i--)
                            <option value="{{ $i }}">{{ $i }} ★</option>
                        @endfor
                    </select>
                    <textarea name="comment" placeholder="Leave a comment..."></textarea>
                    <button type="submit">Submit</button>
                </form>
            @endif

            <!-- All Ratings -->
            <div class="reviews-list">
                @foreach ($institute->ratings()->latest()->get() as $review)
                    <div class="review-item">
                        <strong>{{ $review->user->name }}</strong> — {{ $review->rating }} ★
                        <p>{{ $review->comment }}</p>

                        @if (Auth::id() === $review->user_id)
                            <form action="{{ route('institute.review.delete', $review->id) }}" method="POST">
                                @csrf @method('DELETE')
                                <button type="submit" class="delete-review">Delete</button>
                            </form>
                        @endif
                    </div>
                @endforeach
            </div>
        </div>
    </div>



    <!-- Navigation Tabs -->
    <div class="nav-tabs">
        <div class="button-container">
            <a href="{{ route('frontend.profile.institute-edit', ['id' => $institute->id]) }}">FEED</a>
            <a href="{{ route('institute.about', $institute->id) }}">ABOUT</a>
            <a href="{{ route('frontend.profile.profile-courses', ['id' => $institute->id]) }}">COURSES</a>
            <a href="{{ route('institute.contact', $institute->id) }}">CONTACT</a>

            @if (Auth::check() &&
                    Auth::user()->role === 'Institute' &&
                    Auth::user()->id === $institute->user_id &&
                    $institute->is_premium &&
                    \Carbon\Carbon::parse($institute->premium_expires_at)->isFuture())
                <a href="{{ route('analytics.dashboard', $institute->id) }}" style="color:gold" class="btn-analytics">
                    ANALYTICS
                </a>
            @endif
        </div>
    </div>

{{-- Profile edit model --}}
<div id="editProfileModal" class="modal">
    <div class="modal-overlay" onclick="closeEditProfileModal()"></div>
    <div class="modal-content">
        <span class="close" onclick="closeEditProfileModal()">&times;</span>
        <h2>Edit Institute Profile</h2>
        <form id="editProfileForm" method="POST" action="{{ route('updateInstitute', ['id' => $institute->id]) }}"
            enctype="multipart/form-data">
            @csrf
            @method('PUT')

            <div class="modal-body">
                <!-- Left Side: Photos -->
                <div class="modal-left">
                    <div class="form-group">
                        <label for="profile_photo">Profile Photo (Max 2MB):</label>
                        <div class="photo-preview">
                            <img src="{{ $institute->profile_photo ? asset('storage/' . $institute->profile_photo) : asset('images/default-profile.png') }}"
                                id="profilePhotoPreview" alt="Profile Photo">
                        </div>
                        <input type="file" name="profile_photo" id="profile_photo" accept="image/*"
                            onchange="previewProfilePhoto()">
                    </div>
                    <div class="form-group">
                        <label for="cover_photo">Cover Photo (Max 2MB):</label>
                        <div class="photo-preview">
                            <img src="{{ $institute->cover_photo ? asset('storage/' . $institute->cover_photo) : asset('images/default-cover.png') }}"
                                id="coverPhotoPreview" alt="Cover Photo">
                        </div>
                        <input type="file" name="cover_photo" id="cover_photo" accept="image/*"
                            onchange="previewCoverPhoto()">
                    </div>
                </div>

                <!-- Right Side: Editable Fields -->
                <div class="modal-right">
                    <div class="form-group">
                        <label for="institute_name">Institute Name:</label>
                        <input type="text" name="institute_name" id="institute_name"
                            value="{{ $institute->institute_name }}" required>
                    </div>
                    <div class="form-group">
                        <label for="location">Location:</label>
                        <input type="text" name="location" id="location" value="{{ $institute->location }}"
                            required>
                    </div>
                    <div class="form-group">
                        <label for="email">Email:</label>
                        <input type="email" name="email" id="email" value="{{ $institute->email }}" required>
                    </div>
                    <div class="form-group">
                        <label for="contact_number">Contact Number:</label>
                        <input type="text" name="contact_number" id="contact_number"
                            value="{{ $institute->contact_number }}" required>
                    </div>
                    <div class="form-group">
                        <label for="website">Website:</label>
                        <input type="text" name="website" id="website" value="{{ $institute->website }}">
                    </div>
                    <div class="form-group">
                        <label for="bio">Bio:</label>
                        <textarea name="bio" id="bio" rows="3">{{ $institute->bio }}</textarea>
                    </div>
                    @if ($institute->is_premium && \Carbon\Carbon::parse($institute->premium_expires_at)->isFuture())
                        <div class="toggle-switch-row">
                            <label for="followers_enabled">Enable Followers:</label>
                            <label class="switch">
                                <input type="checkbox" name="followers_enabled" id="followers_enabled"
                                    {{ $institute->followers_enabled ? 'checked' : '' }}>
                                <span class="slider round"></span>
                            </label>
                        </div>

                        <div class="toggle-switch-row">
                            <label for="reviews_enabled">Enable Reviews:</label>
                            <label class="switch">
                                <input type="checkbox" name="reviews_enabled" id="reviews_enabled"
                                    {{ $institute->reviews_enabled ? 'checked' : '' }}>
                                <span class="slider round"></span>
                            </label>
                        </div>
                    @endif

                </div>
            </div>

            <div class="modal-footer">
                <button type="submit" class="btn-primary">Save Changes</button>
                <button type="button" class="btn-cancel" onclick="closeEditProfileModal()">Cancel</button>
            </div>
        </form>
    </div>
</div>



<!-- Add Post Modal -->
<div id="addPostModal" class="modal">
    <div class="modal-overlay" onclick="closeAddPostModal()"></div>
    <div class="modal-content">
        <span class="close-btn" onclick="closeAddPostModal()">×</span>
        <h3 class="modal-title">Add New Post</h3>

        <!-- Add Post Form -->
        <form action="{{ route('posts.store', ['id' => $institute->id]) }}" method="POST"
            enctype="multipart/form-data">

            @csrf
            <div class="form-group">
                <label for="title">Post Title:</label>
                <input type="text" id="title" name="title" placeholder="Enter title" required>
            </div>

            <!-- Image Upload -->
            <!-- Image Preview Section -->
            <div class="form-group">
                <label for="image">Image (1:1 Recommend (Max 2MB)):</label>
                <input type="file" name="image" id="image" accept="image/*" required
                    onchange="previewPostImage(this)">
                <img id="imagePreview" src="" alt="Image Preview"
                    style="display:none; margin-top: 10px; max-width: 100%; height: auto;">
            </div>



            <div class="form-group">
                <label for="small_description">Small Description (For display in course card):</label>
                <textarea id="small_description" name="small_description" placeholder="Enter small description" maxlength="200"
                    required></textarea>
                <div id="characterCount">200 characters</div>
            </div>


            <div class="form-group">
                <label for="description">Description (For display in profile):</label>
                <textarea id="description" name="description" placeholder="Enter description" required></textarea>
            </div>



            <!-- Course Name Dropdown -->
            <div class="form-group">
                <label for="course_name_search">Course Main Category:</label>
                <input type="text" id="course_name_search" placeholder="Type to search..." autocomplete="off">
                <ul id="course_name_list" class="dropdown-list">
                    @foreach ($categories as $category)
                        @if ($category->main_category === 'Courses')
                            <li data-value="{{ $category->name }}">{{ $category->name }}</li>
                        @endif
                    @endforeach
                </ul>
                <input type="hidden" name="course_name" id="course_name">
            </div>


            <!-- Course Type Dropdown -->
            <div class="form-group">
                <label for="course_type">Course Type:</label>
                <select name="course_type" id="course_type" required>
                    <option value="" disabled selected>Select Course Type</option>
                    @foreach ($categories as $category)
                        @if ($category->main_category === 'Course Type')
                            <option value="{{ $category->name }}">{{ $category->name }}</option>
                        @endif
                    @endforeach
                </select>
            </div>

            <!-- Location Dropdown -->
            <div class="form-group">
                <label for="location">Location(s):</label>
                <div class="dropdown-multiselect">
                    <div class="dropdown-selected" onclick="toggleLocationDropdown()">Select Location(s)</div>
                    <div class="dropdown-options" id="locationDropdown" style="display: none;">
                        @foreach ($categories as $category)
                            @if ($category->main_category === 'Location')
                                <label>
                                    <input type="checkbox" name="location[]" value="{{ $category->name }}">
                                    {{ $category->name }}
                                </label>
                            @endif
                        @endforeach
                    </div>
                </div>
            </div>



            <!-- Duration Dropdown -->
            <div class="form-group">
                <label for="duration">Duration:</label>
                <select name="duration" id="duration" required>
                    <option value="" disabled selected>Select Duration</option>
                    @foreach ($categories as $category)
                        @if ($category->main_category === 'Duration')
                            <option value="{{ $category->name }}">{{ $category->name }}</option>
                        @endif
                    @endforeach
                </select>
            </div>

            <!-- Course Format Dropdown -->
            <div class="form-group">
                <label for="course_format">Course Format:</label>
                <select name="course_format" id="course_format" required>
                    <option value="" disabled selected>Select Course Format</option>
                    @foreach ($categories as $category)
                        @if ($category->main_category === 'Course Format')
                            <option value="{{ $category->name }}">{{ $category->name }}</option>
                        @endif
                    @endforeach
                </select>
            </div>

            <!-- Attendance Type Dropdown -->
            <div class="form-group">
                <label for="attendance_type">Attendance Type:</label>
                <select name="attendance_type" id="attendance_type" required>
                    <option value="" disabled selected>Select Attendance Type</option>
                    @foreach ($categories as $category)
                        @if ($category->main_category === 'Attendance Type')
                            <option value="{{ $category->name }}">{{ $category->name }}</option>
                        @endif
                    @endforeach
                </select>
            </div>


            <div class="modal-actions">
                <button type="submit" class="btn btn-primary">Add Post</button>
                <button type="button" class="btn btn-cancel" onclick="closeAddPostModal()">Cancel</button>
            </div>
        </form>
    </div>
</div>





{{-- //Add event --}}
<div id="addEventModal" class="modal">
    <div class="modal-overlay" onclick="closeAddEventModal()"></div>
    <div class="modal-content">
        <span class="close-btn" onclick="closeAddEventModal()">×</span>
        <h3 class="modal-title">Add Upcoming Event</h3>

        <!-- Add Event Form -->
        <form action="{{ route('events.store', ['id' => $institute->id]) }}" method="POST"
            enctype="multipart/form-data">
            @csrf
            <div class="form-group">
                <label for="event_title">Event Title:</label>
                <input type="text" id="event_title" name="event_title" placeholder="Enter event title" required>
            </div>

            <!-- Image Upload -->
            <div class="form-group">
                <label for="event_image">Event Image (Max 2MB):</label>
                <input type="file" name="event_image" id="event_image" accept="image/*"
                    onchange="previewEventImage(this)" required>
                <img id="eventImagePreview" alt="Event Image Preview"
                    style="display:none; margin-top: 10px; max-width: 100%; height: auto;">
            </div>

            <div class="form-group">
                <label for="event_description">Event Description:</label>
                <textarea id="event_description" name="event_description" placeholder="Enter event description" required></textarea>
            </div>

            <div class="form-group">
                <label for="event_date">Event Date:</label>
                <input type="date" id="event_date" name="event_date" required>
            </div>

            <div class="form-group">
                <label for="sub_location">Location:</label>
                <textarea id="sub_location" name="sub_location" placeholder="Enter location details" required></textarea>
            </div>

            <div class="form-group">
                <label for="main_location">Sub Location:</label>
                <textarea id="main_location" name="main_location" placeholder="Enter sub Location" required></textarea>
            </div>



            <div class="modal-actions">
                <button type="submit" class="btn btn-primary">Add Event</button>
                <button type="button" class="btn btn-cancel" onclick="closeAddEventModal()">Cancel</button>
            </div>
        </form>
    </div>
</div>







<script>
    function toggleLeftSidebar() {
        const leftSidebar = document.querySelector('.left-section');
        const icon = document.querySelector('.left-toggle-arrow i');

        leftSidebar.classList.toggle('active');
        icon.classList.toggle('active');
    }


    function toggleRightSidebar() {
        const rightSidebar = document.querySelector('.right-section');
        const icon = document.querySelector('.right-toggle-arrow i');

        rightSidebar.classList.toggle('active');
        icon.classList.toggle('active');
    }


    const textarea = document.getElementById('small_description');
    const charCount = document.getElementById('characterCount');
    const maxLength = parseInt(textarea.getAttribute('maxlength'));

    textarea.addEventListener('input', function() {
        let currentLength = textarea.value.length;

        // Update character count immediately
        charCount.textContent = `${currentLength}/${maxLength} characters`;

        // Trim if length exceeds maxLength
        if (currentLength > maxLength) {
            textarea.value = textarea.value.substring(0, maxLength);
            charCount.textContent = `${maxLength}/${maxLength} characters`;
        }
    });



    const input = document.getElementById('course_name_search');
    const hiddenInput = document.getElementById('course_name');
    const list = document.getElementById('course_name_list');
    const options = Array.from(list.getElementsByTagName('li'));

    // Show/Hide dropdown
    input.addEventListener('focus', () => list.style.display = 'block');
    input.addEventListener('blur', () => setTimeout(() => list.style.display = 'none', 150)); // Delay so click works

    // Filter options as you type
    input.addEventListener('input', () => {
        const filter = input.value.toLowerCase();
        options.forEach(option => {
            const text = option.textContent.toLowerCase();
            option.style.display = text.includes(filter) ? 'block' : 'none';
        });
    });

    // Set value when option is clicked
    options.forEach(option => {
        option.addEventListener('click', () => {
            input.value = option.textContent;
            hiddenInput.value = option.dataset.value;
            list.style.display = 'none';
        });
    });




    function toggleLocationDropdown() {
        const dropdown = document.getElementById('locationDropdown');
        dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
    }

    // Close dropdown if clicked outside
    document.addEventListener('click', function(e) {
        const dropdown = document.getElementById('locationDropdown');
        const selected = document.querySelector('.dropdown-selected');
        if (!selected.contains(e.target) && !dropdown.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });

    // Update selected locations text
    const checkboxes = document.querySelectorAll('#locationDropdown input[type="checkbox"]');
    const selectedDiv = document.querySelector('.dropdown-selected');

    checkboxes.forEach(cb => {
        cb.addEventListener('change', function() {
            const selected = Array.from(checkboxes)
                .filter(chk => chk.checked)
                .map(chk => chk.value)
                .join(', ');
            selectedDiv.textContent = selected || 'Select Location(s)';
        });
    });

    
        function showApprovalMessage() {
            alert("🔒 Your account is pending approval. You cannot create post or events yet.");
        }

        document.getElementById('follow-btn')?.addEventListener('click', function() {
            const button = this;
            const instituteId = button.dataset.id;

            fetch(`/institutes/${instituteId}/follow`, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': '{{ csrf_token() }}',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                })
                .then(response => response.json())
                .then(data => {
                    button.textContent = data.status === 'followed' ? 'Followed' : 'Follow';
                    document.getElementById('follower-count').textContent = data.followers_count;
                })
                .catch(err => console.error("Follow error", err));
        });



        document.addEventListener('DOMContentLoaded', () => {
            const modal = document.getElementById('reviews-modal');
            const openBtn = document.getElementById('open-reviews-modal');
            const closeBtn = modal.querySelector('.close-btn');

            // Open modal
            openBtn?.addEventListener('click', () => {
                modal.style.display = 'block';
            });

            // Close modal by X button
            closeBtn.addEventListener('click', () => {
                modal.style.display = 'none';
            });

            // Close modal by clicking outside
            window.addEventListener('click', (e) => {
                if (e.target === modal) {
                    modal.style.display = 'none';
                }
            });
        });





        document.addEventListener('DOMContentLoaded', function() {
            const openBtn = document.getElementById("openBoostModalBtn");
            const modal = document.getElementById("boostModal");
            const closeBtn = document.getElementById("closeBoostModalBtn");

            // Open modal
            openBtn.addEventListener("click", function() {
                modal.classList.remove("hidden");
            });

            // Close modal
            closeBtn.addEventListener("click", function() {
                modal.classList.add("hidden");
            });

            // Close modal if clicking outside content
            modal.addEventListener("click", function(e) {
                if (e.target === modal) {
                    modal.classList.add("hidden");
                }
            });
        });
    </script>
</body>

</html>
