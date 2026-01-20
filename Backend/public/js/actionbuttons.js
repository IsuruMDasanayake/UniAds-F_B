// Profile edit model
function openModal() {
    document.getElementById("editProfileModal").style.display = "flex";
}

function previewProfilePhoto() {
    const file = document.getElementById("profile_photo").files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("profilePhotoPreview").src =
                e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function previewCoverPhoto() {
    const file = document.getElementById("cover_photo").files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            document.getElementById("coverPhotoPreview").src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function closeEditProfileModal() {
    document.getElementById("editProfileModal").style.display = "none";
}



// Open Add Post Modal
function openAddPostModal() {
    document.getElementById("addPostModal").style.display = "flex";
}

// Close Add Post Modal
function closeAddPostModal() {
    document.getElementById("addPostModal").style.display = "none";
}
// JavaScript to preview the uploaded image
function previewPostImage(inputEl) {
  const preview = document.getElementById('imagePreview');

  if (inputEl.files && inputEl.files[0]) {
    const file = inputEl.files[0];

    if (!file.type.startsWith('image/')) {
      // Not an image – clear preview
      preview.src = '';
      preview.style.display = 'none';
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    preview.src = objectUrl;
    preview.style.display = 'block';

    // Free memory when done displaying
    preview.onload = () => URL.revokeObjectURL(objectUrl);
  } else {
    // No file selected – hide preview
    preview.src = '';
    preview.style.display = 'none';
  }
}




// Open the Add Event Modal and update the URL
function openAddEventModal() {
    document.getElementById("addEventModal").style.display = "flex";
}

// Close the Add Event Modal and revert the URL
function closeAddEventModal() {
    document.getElementById("addEventModal").style.display = "none";
}

// Preview the uploaded event image
function previewEventImage(inputEl) {
    const preview = document.getElementById('eventImagePreview');

    if (inputEl.files && inputEl.files[0]) {
        const file = inputEl.files[0];

        // Ensure the selected file is an image
        if (!file.type.startsWith('image/')) {
            preview.src = '';
            preview.style.display = 'none';
            return;
        }

        const objectUrl = URL.createObjectURL(file);
        preview.src = objectUrl;
        preview.style.display = 'block';

        // Release memory once the image is loaded
        preview.onload = () => URL.revokeObjectURL(objectUrl);
    } else {
        preview.src = '';
        preview.style.display = 'none';
    }
}


