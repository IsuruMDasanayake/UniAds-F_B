<div class="left-section">
    <h2>&nbsp;&nbsp;&nbsp;Institute Gallery</h2><br>

    <!-- Check if logged-in user is the owner of the institute -->
    @if (Auth::check() && Auth::id() == $institute->user_id)
        <!-- Choose Image Button -->
        <button id="chooseImageBtn" onclick="triggerFileInput()">Choose Image</button>
    @endif

    <!-- Hidden File Input -->
    <input id="imageInput" type="file" name="image" style="display: none;" onchange="onImageSelected()">

    <!-- Upload Image Button -->
    <button id="uploadImageBtn" style="display: none;" onclick="uploadImage()">Upload Image</button>

    <!-- Display Images -->
    <div id="gallery" class="gallery">
        @foreach ($institute->gallery()->orderBy('created_at', 'desc')->get() as $image)
            <div class="gallery-item" data-id="{{ $image->id }}">
                <img src="{{ asset('storage/' . $image->image_path) }}" alt="Gallery Image" class="clickable-image"
                    onclick="openImageModal('{{ asset('storage/' . $image->image_path) }}')">

                <!-- Delete Button for logged-in institute only -->
                @if (Auth::check() && Auth::id() == $institute->user_id)
                    <button class="delete-img-btn" onclick="deleteImage({{ $image->id }})">🗑️</button>
                @endif
            </div>
        @endforeach
    </div>
</div>

<!-- Image Modal -->
<div id="imageModal" class="image-modal" onclick="outsideClick(event)">
    <span class="close-modal" onclick="closeImageModal()">&times;</span>
    <img class="modal-content" id="modalImage">
</div>


<!-- Include Font Awesome for the trash icon -->
<link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">


<script>
    let selectedImage = null; // To store the selected image

    // Function to open the file input when "Choose Image" button is clicked
    function triggerFileInput() {
        document.getElementById('imageInput').click();
    }

    // Function when an image is selected
    function onImageSelected() {
        const fileInput = document.getElementById('imageInput');
        const uploadButton = document.getElementById('uploadImageBtn');
        const chooseImageBtn = document.getElementById('chooseImageBtn');

        if (fileInput.files && fileInput.files[0]) {
            selectedImage = fileInput.files[0]; // Store selected image
            chooseImageBtn.style.display = 'none'; // Hide "Choose Image" button
            uploadButton.style.display = 'inline-block'; // Show "Upload Selected Image" button
        }
    }

    // Function to upload the selected image
    function uploadImage() {
        if (!selectedImage) {
            alert('Please choose an image first!');
            return;
        }

        const formData = new FormData();
        formData.append('image', selectedImage);

        // Use the institute ID dynamically if needed
        const instituteId = '{{ $institute->id }}'; // Pass this in your Blade view

        fetch(`/institute/gallery/store/${instituteId}`, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.message === 'Image uploaded successfully!') {
                    // Prepend the new image to the gallery
                    const gallery = document.getElementById('gallery');
                    const newImageDiv = document.createElement('div');
                    newImageDiv.classList.add('gallery-item');
                    newImageDiv.innerHTML = `
                <img src="/storage/${data.image.image_path}" alt="Gallery Image">
                <!-- Show delete button only for the logged-in institute -->
                @if (Auth::check() && Auth::user()->id == $institute->user_id)
                    <button class="delete-img-btn" onclick="deleteImage(${data.image.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                @endif
            `;
                    gallery.insertBefore(newImageDiv, gallery.firstChild); // Add it at the top
                    document.getElementById('uploadImageBtn').style.display =
                        'none'; // Hide the upload button again
                    document.getElementById('chooseImageBtn').style.display =
                        'inline-block'; // Show the choose image button again
                    document.getElementById('imageInput').value = ''; // Reset the file input
                    selectedImage = null; // Clear selected image
                } else {
                    alert('Failed to upload image. Please try again.');
                }
            })
            .catch(error => {
                console.error('Error uploading image:', error);
                alert('Image size should be below 2MB. Please try again.');
            });
    }

    // Function to delete an image
    function deleteImage(imageId) {
        fetch(`/institute/gallery/${imageId}`, {
                method: 'DELETE',
                headers: {
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                    'Content-Type': 'application/json',
                },
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    document.querySelector(`.gallery-item[data-id="${imageId}"]`).remove();
                } else {
                    alert('Failed to delete image');
                }
            })
            .catch(error => console.error('Error:', error));
    }




    function openImageModal(src) {
        const modal = document.getElementById("imageModal");
        const modalImg = document.getElementById("modalImage");
        modal.style.display = "flex"; // use flex for centering
        modalImg.src = src;
    }

    function closeImageModal() {
        document.getElementById("imageModal").style.display = "none";
    }

    // Close if click outside image
    function outsideClick(event) {
        const modal = document.getElementById("imageModal");
        const modalImg = document.getElementById("modalImage");
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }
</script>
