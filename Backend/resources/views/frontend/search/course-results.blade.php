<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Course Search Results</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Font Awesome and Custom CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">
    <link rel="stylesheet" href="{{ asset('css/feed.css') }}">
    <link rel="stylesheet" href="{{ asset('css/categories.css') }}">
    <script src="{{ asset('js/navbar.js') }}"></script>
</head>

<body>
    @include('frontend.navbar')

    <div class="container">
        <h1 class="page-title">Search Results for "{{ $query }}"</h1>

        @php $visiblePosts = $posts->where('status', 'active'); @endphp

        @forelse ($visiblePosts as $post)
            <div class="post-card">
                <div class="post-image-wrapper">
                    <img class="post-image" src="{{ asset('storage/' . $post->image) }}" alt="Post Image">
                </div>
                <div class="post-details">
                    <div class="institute-details">
                        <a href="{{ url('/institutions/' . $post->institute->id . '/profile') }}">
                            <img class="profile-picture"
                                src="{{ asset('storage/' . ($post->institute->profile_photo ?? 'images/default-logo.png')) }}"
                                alt="Institute Logo">
                        </a>
                        <a href="{{ url('/institutions/' . $post->institute->id . '/profile') }}"
                            class="institute-name-link">
                            <span class="institute-name">{{ $post->institute->institute_name }}</span>
                            @if (
                                $post->institute->is_premium &&
                                    $post->institute->premium_expires_at &&
                                    now()->lessThanOrEqualTo($post->institute->premium_expires_at))
                                <img src="{{ asset('images/verified-badge.png') }}" alt="Premium Verified"
                                    class="premium-badge" title="Premium Verified">
                            @endif
                        </a>
                        <p class="post-timestamp">{{ $post->created_at->format('F j, Y | g:i A') }}</p>


                    </div>

                    <h2 class="post-title">{{ $post->title }}</h2>
                    <h3 class="post-description">{{ $post->small_description }}</h3>
                    <p class="post-meta">{{ $post->course_type }} / {{ $post->duration }} / {{ $post->location }}</p>

                    <div class="programme-action">
                        <a href="javascript:void(0)" class="programme-link" data-title="{{ $post->title }}"
                            data-description="{{ e($post->description) }}"
                            data-image="{{ asset('storage/' . $post->image) }}"
                            data-institute-id="{{ $post->institute->id }}"
                            data-contact="{{ $post->institute->contact_number }}" data-post-id="{{ $post->id }}"
                            onclick="openModalFromLink(this)">
                            View Programme Information
                        </a>

                        @if (auth()->check() && auth()->user()->role === 'User')
                            <label class="ui-bookmark">
                                <input type="checkbox" class="save-toggle" data-post-id="{{ $post->id }}"
                                    @if (auth()->user()->savedPosts->contains($post->id)) checked @endif>
                                <div class="bookmark">
                                    <svg viewBox="0 0 32 32">
                                        <g>
                                            <path
                                                d="M27 4v27a1 1 0 0 1-1.625.781L16 24.281l-9.375 7.5A1 1 0 0 1 5 31V4a4 4 0 0 1 4-4h14a4 4 0 0 1 4 4z">
                                            </path>
                                        </g>
                                    </svg>
                                </div>
                            </label>
                        @endif
                    </div>



                </div>
            </div>
        @empty
            <p>No active courses found with the title "{{ $query }}".</p>
        @endforelse
    </div>




    <!-- Programme Info Modal -->
    <div id="programmeModal" class="programme-modal">
        <div class="programme-modal-content">
            <span class="programme-close-btn" onclick="closeProgrammeModal()">&times;</span>
            <img id="programmeImage" class="programme-image" src="" alt="Programme Image">
            <h3 id="programmeTitle" class="programme-title"></h3>
            <p id="programmeDescription" class="programme-description"></p>

            <!-- Modal Footer -->
            <div class="programme-footer">
                @auth
                    @if (Auth::user()->role === 'User')
                        <button class="btn-primary" onclick="openApplyModal()">Apply Now</button>
                        <button class="btn-secondary" onclick="openMoreInfoModal()">Get More Information</button>
                    @endif
                @endauth
            </div>
        </div>
    </div>

    <!-- Apply Now Modal -->
    <div id="applyModal" class="programme-modal">
        <div class="programme-modal-content">
            <span class="programme-close-btn" onclick="closeApplyModal()">&times;</span>
            <h3 id="applyCourseTitle" class="programme-title">Apply for Course</h3>
            <form id="applyForm" method="POST" action="">
                @csrf
                <input type="hidden" name="course_title" id="hiddenCourseTitle">
                <input type="hidden" name="institute_id" id="hiddenInstituteId">
                <input type="hidden" name="post_id" id="hiddenPostId">

                <div class="form-group">
                    <label for="applicant_name">Your Name</label>
                    <input type="text" name="name" id="applicant_name" required>
                </div>
                <div class="form-group">
                    <label for="applicant_email">Email</label>
                    <input type="email" name="email" id="applicant_email" required>
                </div>
                <div class="form-group">
                    <label for="applicant_phone">Phone Number</label>
                    <input type="text" name="phone" id="applicant_phone" required>
                </div>
                <div class="form-group">
                    <label for="applicant_message">Message</label>
                    <textarea name="message" id="applicant_message" rows="4" required></textarea>
                </div>

                <!-- Consent Checkbox -->
                <div class="form-group consent-checkbox">
                    <label>
                        <input type="checkbox" name="privacy_consent" required>
                        Yes, I agree to share my details with the institute and acknowledge that this is in accordance
                        with
                        <a href="/privacy-policy" target="_blank">UniAds' Privacy Policy</a> and
                        <a href="/terms-conditions" target="_blank">Terms & Conditions</a>.
                    </label>
                </div>

                <button type="submit" class="btn-primary">Send Message</button>
            </form>
        </div>
    </div>


    <!-- More Information Modal -->
    <div id="infoModal" class="programme-modal" style="display:none; justify-content:center; align-items:center;">
        <div class="programme-modal-content">
            <span class="programme-close-btn" onclick="closeInfoModal()">&times;</span>
            <h3 class="programme-title">More Information</h3>
            <p id="infoMessage" style="font-size:16px; color:#333; margin-top: 15px;"></p>
        </div>
    </div>

    <script src="{{ asset('js/modal.js') }}"></script>


    <script>
        let currentInstitutePhone = null;

        function openModalFromLink(link) {
            const title = link.dataset.title;
            const description = link.dataset.description;
            const image = link.dataset.image;
            const instituteId = link.dataset.instituteId;
            const contact = link.dataset.contact;
            const postId = link.dataset.postId;

            currentInstitutePhone = contact;

            document.getElementById('programmeTitle').innerText = title;
            document.getElementById('programmeDescription').innerText = description;
            document.getElementById('programmeImage').src = image;

            // 🟢 Set hidden inputs
            document.getElementById('hiddenCourseTitle').value = title;
            document.getElementById('hiddenInstituteId').value = instituteId;
            document.getElementById('hiddenPostId').value = postId;

            // 🟢 Set form action
            const form = document.getElementById('applyForm');
            form.action = `/course/apply/${instituteId}`;

            document.getElementById('programmeModal').style.display = 'flex';

            // ✅ Track post view only once
            if (postId && !link.dataset.viewed) {
                fetch(`/posts/${postId}/track-view`, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });

                link.dataset.viewed = "true";
            }
        }


        function closeProgrammeModal() {
            document.getElementById('programmeModal').style.display = 'none';
        }

        function openApplyModal() {
            document.getElementById('programmeModal').style.display = 'none';
            document.getElementById('applyModal').style.display = 'flex';
        }

        function closeApplyModal() {
            document.getElementById('applyModal').style.display = 'none';
        }

        function openMoreInfoModal() {
            const modal = document.getElementById('infoModal');
            const messageEl = document.getElementById('infoMessage');

            messageEl.innerHTML =
                `If you want more information about this post, please call the institute at: <strong>${currentInstitutePhone}</strong>`;
            modal.style.display = 'flex';
        }

        function closeInfoModal() {
            document.getElementById('infoModal').style.display = 'none';
        }



        //Post save/unsave toggle
        document.querySelectorAll('.save-toggle').forEach(el => {
            el.addEventListener('change', function() {
                const postId = this.dataset.postId;
                const csrfToken = document.querySelector('meta[name="csrf-token"]').content;

                fetch(`/posts/${postId}/save`, {
                        method: 'POST',
                        headers: {
                            'X-CSRF-TOKEN': csrfToken,
                            'Accept': 'application/json'
                        }
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.status === 'saved') {
                            console.log(`Post ${postId} saved.`);
                        } else {
                            console.log(`Post ${postId} unsaved.`);
                        }
                    })
                    .catch(err => console.error('Error saving post:', err));
            });
        });
    </script>

</body>

</html>
