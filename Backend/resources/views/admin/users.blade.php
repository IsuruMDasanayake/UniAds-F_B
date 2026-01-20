<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard</title>
  <!-- Favicon -->
  <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
  <!-- Custom styles -->
  
  <link rel="stylesheet" href="{{ asset('admin/css/style.css') }}">
  <link rel="stylesheet" href="{{ asset('admin/css/usersview.css') }}">
  <link rel="stylesheet" href="{{ asset('admin/css/admindash.css') }}">
  <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
  
</head>

<body>
<div class="page-flex">
@include('admin.sidebar')
<div class="main-wrapper">
@include('admin.mainnavbar')

<!-- resources/views/backend/users.blade.php -->
<div class="user-table">
    <div class="user-table-header">
        <h2 class="title">User Management</h2>
        <button class="btn btn-success add-user-btn" onclick="openAddUserModal()">Add User</button>
    </div>
    <table class="table">
        <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody>
            @foreach($users as $user)
                <tr id="user-{{ $user->id }}">
                    <td>{{ $user->id }}</td>
                    <td class="user-name">{{ $user->name }}</td>
                    <td class="user-email">{{ $user->email }}</td>
                    <td class="user-role">{{ $user->role }}</td>
                    <td>
                        <button class="badge-active" onclick="editUser({{ $user->id }})">Edit</button>
                        <button class="badge-trashed" onclick="confirmDelete({{ $user->id }})">Delete</button>
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>
</div>


<!-- Edit User Modal -->
<div id="editUserModal" class="modal">
    <div class="modal-content">
        <span class="close-btn" onclick="closeEditModal()">×</span>

        <h3 class="modal-title">Edit User</h3>

        <form id="editUserForm">
            @csrf
            <input type="hidden" id="editUserId" name="id">

            <div class="form-group">
                <label for="editName">Name</label>
                <input type="text" id="editName" name="name" placeholder="Enter user name" required>
            </div>

            <div class="form-group">
                <label for="editEmail">Email</label>
                <input type="email" id="editEmail" name="email" placeholder="Enter email address" required>
            </div>

            <div class="form-group">
                <label for="editRole">Role</label>
                <select id="editRole" name="role" required>
                    <option value="" disabled selected>Select role</option>
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                    <option value="Institute">Institute</option>
                </select>
            </div>

            <div class="modal-actions">
                <button type="submit" class="btn btn-primary">Update</button>
                <button type="button" class="btn btn-secondary" onclick="closeEditModal()">Cancel</button>
            </div>
        </form>
    </div>
</div>

<form id="delete-form-{{ $user->id }}" method="POST" action="{{ route('users.destroy', $user->id) }}" style="display: none;">
    @csrf
    @method('DELETE')
</form>


<!-- Add User Modal -->
<div id="addUserModal" class="modal">
    <div class="modal-content">
        <span class="close-btn" onclick="closeAddUserModal()">×</span>

        <h3 class="modal-title">Add New User</h3>
        <form id="addUserForm">
            @csrf
            <div class="form-group">
                <label for="addName">Name</label>
                <input type="text" id="addName" name="name" placeholder="Enter user name" required>
            </div>

            <div class="form-group">
                <label for="addEmail">Email</label>
                <input type="email" id="addEmail" name="email" placeholder="Enter email address" required>
            </div>

            <div class="form-group">
                <label for="addRole">Role</label>
                <select id="addRole" name="role" required>
                    <option value="" disabled selected>Select role</option>
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                    <option value="Institute">Institute</option>
                </select>
            </div>

            <div class="form-group">
                <label for="addPassword">Password</label>
                <input type="password" id="addPassword" name="password" placeholder="Enter password" required>
            </div>

            <div class="modal-actions">
                <button type="submit" class="btn btn-primary">Add User</button>
                <button type="button" class="btn btn-secondary" onclick="closeAddUserModal()">Cancel</button>
            </div>
        </form>
    </div>
</div>


</div> <!-- main-wrapper -->
</div> <!-- page-flex -->

<script>
            function toggleDropdown() {
    const dropdown = document.getElementById('dropdown-menu');
    dropdown.classList.toggle('show');
}

// Close the dropdown if clicked outside
window.addEventListener('click', function (event) {
    const dropdown = document.getElementById('dropdown-menu');
    const profileButton = document.querySelector('.profile-btn');

    if (!dropdown.contains(event.target) && !profileButton.contains(event.target)) {
        dropdown.classList.remove('show');
    }
});



// Function to open the Edit User modal and populate the form with current data
function editUser(userId) {
    // Open the modal and populate it with user data
    var userRow = document.getElementById("user-" + userId);
    var userName = userRow.querySelector(".user-name").textContent;
    var userEmail = userRow.querySelector(".user-email").textContent;
    var userRole = userRow.querySelector(".user-role").textContent;

    // Populate modal fields with user data
    document.getElementById("editUserId").value = userId;
    document.getElementById("editName").value = userName;
    document.getElementById("editEmail").value = userEmail;
    document.getElementById("editRole").value = userRole;

    // Show the modal
    document.getElementById("editUserModal").style.display = "block";
    document.getElementById("overlay").style.display = "block";
}

// Function to close the Edit User modal
function closeEditModal() {
    document.getElementById("editUserModal").style.display = "none";
    document.getElementById("overlay").style.display = "none";
}

// Handle the form submission for editing the user
document.getElementById("editUserForm").addEventListener("submit", function(event) {
    event.preventDefault();

    // Get the form data
    var formData = new FormData(this);

    // Make the AJAX request to update the user data
    fetch("{{ route('admin.users') }}", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Update the table row with new user data
            var userId = data.user.id;
            var userRow = document.getElementById("user-" + userId);
            userRow.querySelector(".user-name").textContent = data.user.name;
            userRow.querySelector(".user-email").textContent = data.user.email;
            userRow.querySelector(".user-role").textContent = data.user.role;

            // Close the modal
            closeEditModal();
        } else {
            alert('Failed to update user');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('User Updated');
    });
});




function confirmDelete(userId) {
        if (confirm("Are you sure you want to delete this user? This action cannot be undone.")) {
            // If confirmed, submit the delete form dynamically
            document.getElementById(`delete-form-${userId}`).submit();
        }
    }






// Open Add User Modal
function openAddUserModal() {
    document.getElementById('addUserModal').style.display = 'block';
}

// Close Add User Modal
function closeAddUserModal() {
    document.getElementById('addUserModal').style.display = 'none';
}

// Handle Add User Form Submission
document.getElementById('addUserForm').addEventListener('submit', function(event) {
    event.preventDefault();

    // Gather form data
    const formData = new FormData(this);

    // Send AJAX request to add user
    fetch("{{ route('users.store') }}", {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Close the modal and refresh the page or dynamically update the table
            closeAddUserModal();
            location.reload();
        } else {
            alert('Failed to add user.');
        }
    })
    .catch(error => console.error('Error:', error));
});



        
</script>

</body>
</html>
