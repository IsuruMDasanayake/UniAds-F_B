<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Dashboard</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">

    <link rel="stylesheet" href="{{ asset('admin/css/style.css') }}">
    <link rel="stylesheet" href="{{ asset('admin/css/institutemanage.css') }}">
    <link rel="stylesheet" href="{{ asset('admin/css/admindash.css') }}">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
</head>

<body>
    <div class="page-flex">
        @include('admin.sidebar')
        <div class="main-wrapper">
            @include('admin.mainnavbar')

            <div class="institute-table">
                <div class="institute-table-header">
                    <h2 class="title">Institutes Management</h2>
                </div>

                <!-- Unapproved Institutes Section -->
                <h3 class="subtitle">Unapproved Institutes</h3>
                <table class="table unapproved-institutes">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Institute Name</th>
                            <th>Location</th>
                            <th>Email</th>
                            <th>Website</th>
                            <th>Contact Number</th>
                            <th>Government Reg. No</th>
                            <th>Profile Photo</th>
                            <th>Cover Photo</th>
                            <th>Bio</th>
                            <th>Is Premium</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($unapprovedInstitutes as $institute)
                            <tr id="institute-{{ $institute->id }}">
                                <td>{{ $institute->id }}</td>
                                <td>{{ $institute->institute_name }}</td>
                                <td>{{ $institute->location }}</td>
                                <td>{{ $institute->email }}</td>
                                <td>{{ $institute->website }}</td>
                                <td>{{ $institute->contact_number }}</td>
                                <td>{{ $institute->gov_register_number }}</td>
                                <td>
                                    @if ($institute->profile_photo)
                                        <img src="{{ asset('storage/' . $institute->profile_photo) }}" alt="Profile"
                                            class="photo-preview">
                                    @else
                                        N/A
                                    @endif
                                </td>
                                <td>
                                    @if ($institute->cover_photo)
                                        <img src="{{ asset('storage/' . $institute->cover_photo) }}" alt="Cover"
                                            class="photo-preview">
                                    @else
                                        N/A
                                    @endif
                                </td>
                                <td>{{ $institute->bio ?? 'N/A' }}</td>
                                <td>{{ $institute->is_premium ? 'Yes' : 'No' }}</td>
                                <td>
                                    <button class="badge-active"
                                        onclick="openEditModal({{ json_encode($institute) }})">Edit</button>
                                    <button class="badge-trashed"
                                        onclick="deleteInstitute({{ $institute->id }})">Delete</button>
                                    <button class="badge-success"
                                        onclick="approveInstitute({{ $institute->id }})">Approve</button>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>

                <!-- Approved Institutes Section -->
                <h3 class="subtitle">Approved Institutes</h3>
                <table class="table approved-institutes">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Institute Name</th>
                            <th>Location</th>
                            {{-- <th>Website</th> --}}
                            <th>Contact Number</th>
                            <th>Government Reg. No</th>
                            <th>Profile Photo</th>
                            <th>Cover Photo</th>
                            <th>Is Premium</th>
                            <th>Premium Expire Date</th>
                            <th>Follow Count</th>
                            
                            <th>Trial Status</th>
                            <th>Profile Views</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($approvedInstitutes as $institute)
                            <tr id="institute-{{ $institute->id }}">
                                <td>{{ $institute->id }}</td>
                                <td>{{ $institute->institute_name }}</td>
                                <td>{{ $institute->location }}</td>
                                {{-- <td>{{ $institute->website }}</td> --}}
                                <td>{{ $institute->contact_number }}</td>
                                <td>{{ $institute->gov_register_number }}</td>
                                <td>
                                    @if ($institute->profile_photo)
                                        <img src="{{ asset('storage/' . $institute->profile_photo) }}" alt="Profile"
                                            class="photo-preview">
                                    @else
                                        N/A
                                    @endif
                                </td>
                                <td>
                                    @if ($institute->cover_photo)
                                        <img src="{{ asset('storage/' . $institute->cover_photo) }}" alt="Cover"
                                            class="photo-preview">
                                    @else
                                        N/A
                                    @endif
                                </td>
                                <td>{{ $institute->is_premium ? 'Yes' : 'No' }}</td>
                                <td>{{ $institute->premium_expires_at ?? 'N/A' }}</td>
                                <td>{{ $institute->followers_count ?? 0 }}</td>
                                
                                <td>{{ $institute->trial_status ?? 'N/A' }}</td>
                                <td>{{ $institute->profile_views ?? 0 }}</td>
                                <td>{{ $institute->created_at }}</td>

                                <td>
                                    <button class="badge-active"
                                        onclick="openEditModal({{ json_encode($institute) }})">Edit</button>
                                    <button class="badge-trashed"
                                        onclick="deleteInstitute({{ $institute->id }})">Del</button>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>

            </div>

            <!-- Edit Institute Modal -->
            <div id="editInstituteModal" class="modal">
                <div class="modal-content">
                    <span class="close-btn" onclick="closeEditModal()">×</span>
                    <h3 class="modal-title">Edit Institute</h3>
                    <form id="editInstituteForm" method="POST" enctype="multipart/form-data">
                        @csrf
                        @method('PATCH')
                        <input type="hidden" id="editInstituteId" name="id">

                        <!-- Profile Photo -->
                        <div class="form-group">
                            <label for="editProfilePhoto">Profile Photo</label>
                            <div class="photo-preview">
                                <img id="profilePhotoPreview" src="" alt="Profile Photo">
                            </div>
                            <input type="file" id="editProfilePhoto" name="profile_photo" accept="image/*"
                                onchange="previewProfilePhoto(event)">
                        </div>

                        <!-- Cover Photo -->
                        <div class="form-group">
                            <label for="editCoverPhoto">Cover Photo</label>
                            <div class="photo-preview">
                                <img id="coverPhotoPreview" src="" alt="Cover Photo">
                            </div>
                            <input type="file" id="editCoverPhoto" name="cover_photo" accept="image/*"
                                onchange="previewCoverPhoto(event)">
                        </div>

                        <!-- Other Fields -->
                        <div class="form-group">
                            <label for="editInstituteName">Institute Name</label>
                            <input type="text" id="editInstituteName" name="institute_name"
                                placeholder="Enter institute name" required>
                        </div>

                        <div class="form-group">
                            <label for="editLocation">Location</label>
                            <input type="text" id="editLocation" name="location" placeholder="Enter location"
                                required>
                        </div>

                        <div class="form-group">
                            <label for="editEmail">Email</label>
                            <input type="email" id="editEmail" name="email" placeholder="Enter email" required>
                        </div>

                        <div class="form-group">
                            <label for="editWebsite">Website</label>
                            <input type="url" id="editWebsite" name="website" placeholder="Enter website"
                                required>
                        </div>

                        <div class="form-group">
                            <label for="editContactNumber">Contact Number</label>
                            <input type="tel" id="editContactNumber" name="contact_number"
                                placeholder="Enter contact number" required>
                        </div>

                        <div class="form-group">
                            <label for="editGovRegisterNumber">Government Registration Number</label>
                            <input type="text" id="editGovRegisterNumber" name="gov_register_number"
                                placeholder="Enter registration number" required>
                        </div>

                        <div class="form-group">
                            <label for="editIsPremium">Premium Status</label>
                            <select id="editIsPremium" name="is_premium" required>
                                <option value="0">No</option>
                                <option value="1">Yes</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="editBio">Bio</label>
                            <textarea id="editBio" name="bio" placeholder="Enter bio" rows="4"></textarea>
                        </div>

                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Save Changes</button>
                            <button type="button" class="btn btn-secondary"
                                onclick="closeEditModal()">Cancel</button>
                        </div>
                    </form>
                </div>
            </div>

            <script>
                function toggleDropdown() {
                    const dropdown = document.getElementById('dropdown-menu');
                    dropdown.classList.toggle('show');
                }

                // Close the dropdown if clicked outside
                window.addEventListener('click', function(event) {
                    const dropdown = document.getElementById('dropdown-menu');
                    const profileButton = document.querySelector('.profile-btn');

                    if (!dropdown.contains(event.target) && !profileButton.contains(event.target)) {
                        dropdown.classList.remove('show');
                    }
                });
                // Preview Profile Photo
                function previewProfilePhoto(event) {
                    const reader = new FileReader();
                    reader.onload = function() {
                        document.getElementById("profilePhotoPreview").src = reader.result;
                    };
                    reader.readAsDataURL(event.target.files[0]);
                }

                // Preview Cover Photo
                function previewCoverPhoto(event) {
                    const reader = new FileReader();
                    reader.onload = function() {
                        document.getElementById("coverPhotoPreview").src = reader.result;
                    };
                    reader.readAsDataURL(event.target.files[0]);
                }

                // Open Edit Modal
                function openEditModal(institute) {
                    document.getElementById("editInstituteId").value = institute.id;
                    document.getElementById("editInstituteName").value = institute.institute_name;
                    document.getElementById("editLocation").value = institute.location;
                    document.getElementById("editEmail").value = institute.email;
                    document.getElementById("editWebsite").value = institute.website;
                    document.getElementById("editContactNumber").value = institute.contact_number;
                    document.getElementById("editGovRegisterNumber").value = institute.gov_register_number;
                    document.getElementById("editBio").value = institute.bio;

                    // set premium dropdown
                    document.getElementById("editIsPremium").value = institute.is_premium ? 1 : 0;

                    document.getElementById("editInstituteForm").action = `/admin/institutesmanage/${institute.id}`;
                    document.getElementById("editInstituteModal").style.display = "block";
                }


                // Close Edit Modal
                function closeEditModal() {
                    document.getElementById("editInstituteModal").style.display = "none";
                }

                // Delete Institute
                function deleteInstitute(id) {
                    if (confirm("Are you sure you want to delete this institute?")) {
                        fetch(`/admin/institutes/${id}`, {
                                method: "DELETE",
                                headers: {
                                    "X-CSRF-TOKEN": "{{ csrf_token() }}"
                                }
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    document.getElementById(`institute-${id}`).remove();
                                    alert("Institute deleted successfully!");
                                } else alert("Failed to delete the institute.");
                            })
                            .catch(error => console.error("Error:", error));
                    }
                }

                // Approve Institute
                function approveInstitute(id) {
                    if (confirm("Are you sure you want to approve this institute?")) {
                        fetch(`/admin/institutesmanage/${id}/approve`, {
                                method: "PATCH",
                                headers: {
                                    "X-CSRF-TOKEN": "{{ csrf_token() }}"
                                }
                            })
                            .then(response => response.json())
                            .then(data => {
                                if (data.success) {
                                    alert("Institute approved successfully!");
                                    location.reload();
                                } else alert("Approval failed.");
                            })
                            .catch(error => console.error("Error:", error));
                    }
                }
            </script>
</body>

</html>
