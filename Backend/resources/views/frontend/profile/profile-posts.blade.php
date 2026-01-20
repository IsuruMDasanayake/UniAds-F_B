<!-- Center Section: Posts -->
<meta name="csrf-token" content="{{ csrf_token() }}">

<div class="center-section">
    <div class="uploaded-posts">
        @include('frontend.profile.partials.institute-posts')
    </div>
    <!-- Pagination Links -->
    <div class="pagination-links">
        {{ $posts->links('vendor.pagination.custom') }}
    </div>
</div>


<!-- Load More Button -->
{{-- <div id="load-more-container" style="text-align: center; margin-top: 20px;">
    <button id="load-more-btn" data-page="2" data-institute="{{ $institute->id }}">Load More</button>
</div> --}}



{{-- edit post model --}}
<div id="editPostModal" class="modal">
    <div class="modal-overlay" onclick="closeEditPostModal()"></div>
    <div class="modal-content">
        <span class="close-btn" onclick="closeEditPostModal()">×</span>
        <h3 class="modal-title">Edit Post</h3>

        <form id="editPostForm" method="POST" enctype="multipart/form-data">
            @csrf
            @method('PUT')

            <div class="form-group">
                <label for="edit-title">Post Title:</label>
                <input type="text" id="edit-title" name="title" required>
            </div>

            <div class="form-group">
                <label for="edit-small-description">Small Description:</label>
                <textarea id="edit-small-description" name="small_description" required></textarea>
                <div id="characterCount">0/200 characters</div>
            </div>

            <div class="form-group">
                <label for="edit-description">Description:</label>
                <textarea id="edit-description" name="description" required></textarea>
            </div>

            <div class="form-group">
                <label for="edit-image">Change Image:</label>
                <input type="file" name="image" id="edit-image" accept="image/*">
                <img id="editImagePreview" src="#" alt="Image Preview"
                    style="margin-top: 10px; max-width: 100%; height: auto; display: none;">
            </div>

            @php
                $dropdowns = [
                    'course_name' => 'Courses',
                    'course_type' => 'Course Type',
                    'location' => 'Location',
                    'duration' => 'Duration',
                    'course_format' => 'Course Format',
                    'attendance_type' => 'Attendance Type',
                ];
            @endphp

            @foreach ($dropdowns as $field => $category)
                <div class="form-group">
                    <label for="edit-{{ $field }}">{{ ucwords(str_replace('_', ' ', $field)) }}</label>
                    <select name="{{ $field }}" id="edit-{{ $field }}" required>
                        <option value="" disabled>Select {{ $category }}</option>
                        @foreach ($categories as $item)
                            @if ($item->main_category === $category)
                                <option value="{{ $item->name }}">{{ $item->name }}</option>
                            @endif
                        @endforeach
                    </select>
                </div>
            @endforeach

            <div class="modal-actions">
                <button type="submit" class="btn btn-primary">Update Post</button>

                <button type="button" class="btn btn-cancel" onclick="closeEditPostModal()">Cancel</button>
            </div>
        </form>
    </div>
</div>


<!-- Delete Post Modal -->
<div id="deletePostModal" class="delete-modal">
    <div class="modal-overlay" onclick="closeDeletePostModal()"></div>
    <div class="delete-modal-content">
        <span class="delete-close-btn" onclick="closeDeletePostModal()"></span>
        <h3>Confirm Deletion</h3>
        <p>Are you sure you want to delete this post?</p>

        <div class="delete-modal-actions">
            <button type="button" class="delete-btn" id="confirmDeletePostBtn">Delete</button>
            <button type="button" class="cancel-btn" onclick="closeDeletePostModal()">Cancel</button>
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

<!-- Boost Modal -->
<div id="boostModal" class="hidden">
    <div class="boost-modal-content">
        <button class="boost-close" id="closeBoostModalBtn">&times;</button>
        <h2>Boost Your Course</h2>
        <p>Boost Function is currently under development. We will notify you once it is available.</p>
    </div>
</div>


<script>
    // Edit post modal
    function openEditPostModal(editUrl) {
        fetch(editUrl)
            .then(response => response.json())
            .then(post => {
                document.getElementById('edit-title').value = post.title;
                document.getElementById('edit-small-description').value = post.small_description;
                document.getElementById('edit-description').value = post.description;

                // Show the current image preview (if available)
                if (post.image) {
                    const preview = document.getElementById('editImagePreview');
                    preview.src = `/storage/${post.image}`;
                    preview.style.display = 'block';
                } else {
                    document.getElementById('editImagePreview').style.display = 'none';
                }

                // Populate dropdowns
                document.getElementById('edit-course_name').value = post.course_name;
                document.getElementById('edit-course_type').value = post.course_type;
                document.getElementById('edit-location').value = post.location;
                document.getElementById('edit-duration').value = post.duration;
                document.getElementById('edit-course_format').value = post.course_format;
                document.getElementById('edit-attendance_type').value = post.attendance_type;

                // Set the form action URL for updating the post
                document.getElementById('editPostForm').action = `/posts/${post.id}`;

                // Show the modal
                document.getElementById('editPostModal').style.display = 'flex';
            })
            .catch(error => console.error('Error loading post:', error));
    }

    // Close the modal
    function closeEditPostModal() {
        document.getElementById('editPostModal').style.display = 'none';
    }

    // Handle image preview when a new image is selected
    document.getElementById('edit-image').addEventListener('change', function(event) {
        const file = event.target.files[0];
        const preview = document.getElementById('editImagePreview');

        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                preview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        } else {
            preview.style.display = 'none';
        }
    });


    document.getElementById('small_description').addEventListener('input', function() {
        const maxLength = 200;
        const currentLength = this.value.length;
        const charCountDisplay = document.getElementById('characterCount');

        charCountDisplay.textContent = `${currentLength}/${maxLength} characters`;

        if (currentLength > maxLength) {
            this.value = this.value.substring(0, maxLength);
            charCountDisplay.textContent = `${maxLength}/${maxLength} characters`;
        }
    });





    // Function to open the delete modal
    function openDeletePostModal(postId, deleteUrl) {
        const confirmDeleteBtn = document.getElementById('confirmDeletePostBtn');

        // Attach the delete action
        confirmDeleteBtn.onclick = function() {
            handlePostDeletion(postId, deleteUrl);
        };

        // Show the modal
        document.getElementById('deletePostModal').style.display = 'flex';
    }

    // Function to close the delete modal
    function closeDeletePostModal() {
        document.getElementById('deletePostModal').style.display = 'none';
    }

    // Function to handle post deletion
    function handlePostDeletion(postId, deleteUrl) {
        fetch(deleteUrl, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content')
                },
                body: JSON.stringify({
                    id: postId
                }) // Send post ID as JSON payload
            })
            .then(response => response.json().then(data => ({
                status: response.status,
                data
            })))
            .then(({
                status,
                data
            }) => {
                if (status >= 200 && status < 300) {
                    location.reload(); // Refresh the page after successful deletion
                } else {
                    console.error('Error Response:', data);
                    location.reload();
                }
            })
            .catch(error => {
                console.error('Fetch Error:', error);
                alert('An error occurred while deleting the post.');
            })
            .finally(() => {
                closeDeletePostModal(); // Close the modal after deletion attempt
            });
    }



    function toggleDescription(button) {
        const postBody = button.closest('.post-description');
        const shortDescription = postBody.querySelector('.short-description');
        const fullDescription = postBody.querySelector('.full-description');
        const postId = button.getAttribute('data-post-id');

        if (shortDescription.style.display === 'none') {
            // Currently expanded → collapse it
            shortDescription.style.display = 'block';
            fullDescription.style.display = 'none';
            button.textContent = 'See More...';
        } else {
            // Currently collapsed → expand it
            shortDescription.style.display = 'none';
            fullDescription.style.display = 'block';
            button.textContent = 'Show Less';

            // ✅ Track view only the FIRST time
            if (!button.dataset.viewed) {
                fetch(`/posts/${postId}/track-view`, {
                    method: 'POST',
                    headers: {
                        'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').content,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({})
                });

                // Mark this button as "viewed"
                button.dataset.viewed = "true";
            }
        }
    }





    document.getElementById('load-more-btn').addEventListener('click', function() {
        const btn = this;
        const page = parseInt(btn.getAttribute('data-page'));
        const instituteId = btn.getAttribute('data-institute');

        btn.disabled = true;
        btn.innerText = 'Loading...';

        fetch(`/institutes/${instituteId}/posts-scroll?page=${page}`)
            .then(res => res.text())
            .then(data => {
                const parser = new DOMParser();
                const html = parser.parseFromString(data, 'text/html');
                const posts = html.body.innerHTML;

                document.getElementById('uploaded-posts').insertAdjacentHTML('beforeend', posts);
                btn.setAttribute('data-page', page + 1);
                btn.disabled = false;
                btn.innerText = 'Load More';

                if (!posts.trim()) {
                    btn.style.display = 'none';
                }
            })
            .catch(() => {
                btn.disabled = false;
                btn.innerText = 'Load More';
            });
    });


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
</script>
