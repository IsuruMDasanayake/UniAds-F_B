<div class="tab-container">
    {{-- <div class="tabs">
        <span class="tab active">RECENT</span>
        <span class="tab">POPULAR</span>
        <span class="tab">MOST VIEW</span>
    </div>
    <div class="underline"></div> --}}
</div>
<meta name="csrf-token" content="{{ csrf_token() }}">

<div class="post-card-container" id="post-container">
    @include('frontend.feed.post_partial', ['posts' => $posts])
</div>

<div id="loading" class="loading-container" style="display: none;">
    <span class="loading-spinner"><i class="fas fa-spinner fa-spin"></i></span> Loading more posts...
</div>



<!-- Main Modal -->
<div id="postModal" class="post-modal">
    <div class="post-modal-content">
        <span class="post-close-btn" onclick="closePostModal()">&times;</span>
        <img id="postImage" class="modal-post-image" src="" alt="Post Image" />
        <h3 id="postTitle" class="post-title"></h3>
        <p id="postDescription" class="modal-description"></p>

        <!-- Footer Buttons -->
        <div class="post-footer">
            @auth
                @if (Auth::user()->role === 'User')
                    <button id="applyNowBtn" class="btn-primary" onclick="openApplyNowModal(this)"
                        data-course-title="" data-post-id="" data-institute-id="">
                        Apply Now
                    </button>

                    <button class="btn-secondary" onclick="openMoreInfoModal()">Get More Information</button>
                @endif
            @endauth
        </div>
    </div>
</div>


<!-- Apply Now Modal -->
<div id="applyNowModal" class="post-modal">
    <div class="post-modal-content">
        <span class="post-close-btn" onclick="closeApplyNowModal()">&times;</span>
        <h3 id="applyModalTitle" class="post-modal-title">Apply for Course</h3>

        <form id="applyNowForm" method="POST">
            @csrf
            <input type="hidden" name="course_title" id="applyCourseTitle">
            <input type="hidden" name="post_id" id="applyPostId">

            <div class="form-group">
                <label>Your Name</label>
                <input type="text" name="name" required>
            </div>

            <div class="form-group">
                <label>Your Email</label>
                <input type="email" name="email" required>
            </div>

            <div class="form-group">
                <label>Phone</label>
                <input type="text" name="phone" required>
            </div>

            <div class="form-group">
                <label>Message</label>
                <textarea name="message" rows="4" required></textarea>
            </div>

            <!-- Consent Checkbox -->
            <div class="form-group consent-checkbox">
                <label>
                    <input type="checkbox" name="privacy_consent" required>
                    Yes, I agree to share my details with the institute and acknowledge that this is in accordance with
                    <a href="/privacy-policy" target="_blank">UniAds' Privacy Policy</a> and
                    <a href="/terms-conditions" target="_blank">Terms & Conditions</a>.
                </label>
            </div>


            <button type="submit" class="btn-primary">Send Message</button>
        </form>
    </div>
</div>


<!-- More Info Modal -->
<div id="moreInfoModal" class="post-modal">
    <div class="post-modal-content">
        <span class="post-close-btn" onclick="closeMoreInfoModal()">&times;</span>
        <p id="moreInfoText" class="modal-description">To get more information about this course, please call: <strong
                id="institutePhone"></strong></p>
    </div>
</div>



<script>
    function toggleLike(postId) {
    fetch(`/posts/${postId}/toggle-like`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
        },
    })
    .then(response => response.json())
    .then(data => {
        const likeCountElement = document.getElementById(`like-count-${postId}`);
        const likeButton = document.getElementById(`like-button-${postId}`);
        const likeIcon = likeButton.querySelector('.like-icon');

        if (likeCountElement) {
            likeCountElement.textContent = data.likes_count;
        }

        if (data.liked) {
            likeIcon.classList.add('liked');
        } else {
            likeIcon.classList.remove('liked');
        }
    })
    .catch(error => console.error('Error liking post:', error));
}


    //
    let currentInstituteId = null;
    let currentCourseTitle = "";

    function openPostModal(imageUrl, title, description, instituteId, institutePhone, postId) {
        document.getElementById('postImage').src = imageUrl;
        document.getElementById('postTitle').innerText = title;
        document.getElementById('postDescription').innerText = description;

        currentInstituteId = instituteId;
        currentCourseTitle = title;

        document.getElementById('institutePhone').textContent = institutePhone;

        // ✅ Check if applyNowBtn exists before setting attributes
        const applyBtn = document.getElementById('applyNowBtn');
        if (applyBtn) {
            applyBtn.setAttribute('data-course-title', title);
            applyBtn.setAttribute('data-post-id', postId);
            applyBtn.setAttribute('data-institute-id', instituteId);
        }

        // Show modal
        document.getElementById('postModal').style.display = 'flex';

        // ✅ Send view count update
        if (postId) {
            fetch(`/posts/${postId}/track-view`, {
                method: 'POST',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({})
            });
        }
    }

    function closePostModal() {
        document.getElementById('postModal').style.display = 'none';
    }



    // Open Apply Now Modal
    function openApplyNowModal(button) {
        const courseTitle = button.getAttribute('data-course-title');
        const postId = button.getAttribute('data-post-id');
        const instituteId = button.getAttribute('data-institute-id');

        document.getElementById('applyCourseTitle').value = courseTitle;
        document.getElementById('applyPostId').value = postId;
        document.getElementById('applyNowForm').action = `/course/apply/${instituteId}`;
        document.getElementById('applyNowModal').style.display = 'flex';
    }


    function closeApplyNowModal() {
        document.getElementById('applyNowModal').style.display = 'none';
    }



    // Open More Info Modal
    function openMoreInfoModal() {
        document.getElementById('moreInfoModal').style.display = 'flex';
    }

    function closeMoreInfoModal() {
        document.getElementById('moreInfoModal').style.display = 'none';
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
