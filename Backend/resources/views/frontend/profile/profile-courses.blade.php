<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Courses - {{ $institute->institute_name }}</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}" />
    <link rel="stylesheet" href="{{ asset('css/profilecourses.css') }}" />
    <meta name="csrf-token" content="{{ csrf_token() }}">
</head>
<body>
    @include('frontend.profile.profile-view')

    <div class="courses-container">
        <h3>Courses Offered by {{ $institute->institute_name }}</h3><br>

        <div class="courses-grid">
            @foreach($institute->posts as $post)
                @if($post->status === 'active')
                    <div class="course-card" 
                        onclick="openPostModal(
                            '{{ asset('storage/' . $post->image) }}',
                            '{{ addslashes($post->title) }}',
                            `{!! addslashes(strip_tags($post->description)) !!}`,
                            '{{ $post->institute->id }}',
                            '{{ $post->institute->contact_number }}',
                            {{ $post->id }}
                        )"
                    >
                        <img src="{{ asset('storage/' . $post->image) }}" alt="{{ $post->title }}" class="course-image" />
                        <h3 class="course-title">{{ $post->title }}</h3>
                    </div>
                @endif
            @endforeach
        </div>
    </div>

    <!-- Post Modal -->
    <div id="postModalUnique" class="post-modal">
        <div class="post-modal-content">
            <span class="close-btn" onclick="closePostModal()">&times;</span>
            <div class="post-modal-body">
                <img id="postModalImage" src="" alt="Post Image" class="post-modal-image" />
                <div class="post-modal-text">
                    <h3 id="postModalTitle" class="post-modal-title"></h3>
                    <p id="postModalDescription" class="post-modal-description"></p>
                    @if (Auth::user()->role === 'User')
                    <div class="post-modal-footer">
                        <button class="btn-primary-unique" onclick="openApplyModalUnique()">Apply Now</button>
                        <button class="btn-secondary-unique" onclick="openInfoModalUnique()">Get More Information</button>
                    </div>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <!-- Apply Now Modal (Fully Unique) -->
<div id="applyModalUnique" class="apply-modal-unique">
    <div class="apply-modal-content-unique">
        <span class="close-btn-unique" onclick="closeApplyModalUnique()">&times;</span>
        <h3 class="apply-modal-title-unique">Apply for Course</h3>
        <form id="applyFormUnique" method="POST" onsubmit="submitApplyFormUnique(event)">
            @csrf
            <input type="hidden" name="course_title" id="applyCourseTitleUnique" />

            <div class="form-group-unique">
                <label>Your Name</label>
                <input type="text" name="name" required />
            </div>

            <div class="form-group-unique">
                <label>Your Email</label>
                <input type="email" name="email" required />
            </div>

            <div class="form-group-unique">
                <label>Phone</label>
                <input type="text" name="phone" required />
            </div>

            <div class="form-group-unique">
                <label>Message</label>
                <textarea name="message" rows="4" required></textarea>
            </div>

            <!-- Consent Checkbox -->
            <div class="form-group-unique consent-checkbox-unique">
                <label>
                    <input type="checkbox" name="privacy_consent" required>
                    <span>
                        Yes, I agree to share my details with the institute and acknowledge 
                        <a href="/privacy-policy" target="_blank">UniAds' Privacy Policy</a> & 
                        <a href="/terms-conditions" target="_blank">Terms & Conditions</a>.
                    </span>
                </label>
            </div>

            <button type="submit" class="btn-submit-unique">Send Message</button>
        </form>
    </div>
</div>


    <!-- Info Modal -->
    <div id="infoModalUnique" class="info-modal-unique">
        <div class="info-modal-content-unique">
            <span class="close-btn" onclick="closeInfoModalUnique()">&times;</span>
            <h3 class="info-modal-title-unique">More Information</h3>
            <p id="infoMessageUnique" class="info-modal-description-unique"></p>
        </div>
    </div>

    <script>
        // Current post data
        let currentCourseTitleUnique = "";
        let currentInstituteIdUnique = null;
        let currentInstitutePhoneUnique = "";
        let currentPostIdUnique = null;

        // === Post Modal ===
        function openPostModal(imageSrc, title, description, instituteId, phone, postId) {
            document.getElementById('postModalImage').src = imageSrc;
            document.getElementById('postModalTitle').innerText = title;
            document.getElementById('postModalDescription').innerText = description;

            currentCourseTitleUnique = title;
            currentInstituteIdUnique = instituteId;
            currentInstitutePhoneUnique = phone;
            currentPostIdUnique = postId;

            document.getElementById('postModalUnique').style.display = 'flex';

            incrementPostViewUnique(postId);
        }

        function closePostModal() {
            document.getElementById('postModalUnique').style.display = 'none';
        }

        // === Apply Now Modal ===
        function openApplyModalUnique() {
            closePostModal();
            document.getElementById('applyCourseTitleUnique').value = currentCourseTitleUnique;
            document.getElementById('applyFormUnique').action = `/course/apply/${currentInstituteIdUnique}`;
            document.getElementById('applyModalUnique').style.display = 'flex';
        }

        function closeApplyModalUnique() {
            document.getElementById('applyModalUnique').style.display = 'none';
        }

        function submitApplyFormUnique(event) {
            event.preventDefault();
            const form = event.target;
            const formData = new FormData(form);

            fetch(form.action, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Accept': 'application/json',
                },
                body: formData
            })
            .then(response => response.json())
            .then(data => {
                alert(data.message || 'Application submitted successfully!');
                closeApplyModalUnique();
                form.reset();
            })
            .catch(error => {
                alert('Error submitting application.');
                console.error(error);
            });
        }

        // === Info Modal ===
        function openInfoModalUnique() {
            document.getElementById('infoMessageUnique').innerHTML = `For more information about this course, please call <strong>${currentInstitutePhoneUnique}</strong>.`;
            document.getElementById('infoModalUnique').style.display = 'flex';
        }

        function closeInfoModalUnique() {
            document.getElementById('infoModalUnique').style.display = 'none';
        }

        // === Close modals on outside click ===
        window.addEventListener('click', function(e) {
            [
                'postModalUnique', 
                'applyModalUnique', 
                'infoModalUnique'
            ].forEach(id => {
                const modal = document.getElementById(id);
                if (e.target === modal) modal.style.display = 'none';
            });
        });

        // === AJAX: Increment post view ===
        function incrementPostViewUnique(postId) {
            fetch(`/posts/${postId}/increment-view`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({ post_id: postId })
            })
            .then(response => response.json())
            .then(data => console.log('Post view incremented:', data))
            .catch(error => console.error('Error incrementing view:', error));
        }
    </script>
</body>
</html>
