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
    <link rel="stylesheet" href="{{ asset('admin/css/modal.css') }}">
    <script src="https://code.jquery.com/jquery-3.6.0.min.js"></script>
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
    </script>
</head>
<body>
    <div class="page-flex">
        @include('admin.sidebar')
        <div class="main-wrapper">
            @include('admin.mainnavbar')

            <div class="user-table">
                <div class="user-table-header">
                    <h2 class="title">Refund Policy Management</h2>
                    <button class="btn btn-success" onclick="openModal('addModal')">Add New Section</button>
                </div>
                <table class="table">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Title</th>
                            <th>Content</th>
                            <th>Order</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($refundSections as $section)
                            <tr>
                                <td>{{ $section->id }}</td>
                                <td>{{ $section->title }}</td>
                                <td><span class="short-text">
                                            {{ Str::limit(strip_tags($section->content), 100) }}
                                        </span>
                                        <span class="full-text" style="display: none;">
                                            {!! nl2br(e($section->content)) !!}
                                        </span>
                                        <button type="button" class="toggle-btn">See More</button></td>
                                <td>{{ $section->order_index }}</td>
                                <td>
                                    <button class="badge-active" data-id="{{ $section->id }}"
                                        data-title="{{ $section->title }}"
                                        data-content="{{ htmlentities($section->content) }}"
                                        data-order="{{ $section->order_index }}" onclick="openEditModal(this)">
                                        Edit
                                    </button>
                                    <button onclick="openDeleteModal('{{ $section->id }}')"
                                        class="badge-trashed">Delete</button>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </div>
    </div>
    <!-- Add Modal -->
    <div id="addModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('addModal')">&times;</span>
            <h2>Add New Section</h2>
            <form action="{{ route('refund_policy.store') }}" method="POST">
                @csrf
                <label for="title">Title:</label>
                <input type="text" id="title" name="title" required>

                <label for="content">Content:</label>
                <textarea id="content" name="content" rows="4" required></textarea>

                <label for="order">Order:</label>
                <input type="number" id="order_index" name="order_index" required>

                <button type="submit" class="btn btn-success">Add Section</button>
            </form>
        </div>
    </div>
    <!-- Edit Modal -->
    <div id="editModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('editModal')">&times;</span>
            <h2>Edit Refund Policy Section</h2>
            <form id="editForm" method="POST">
                @csrf
                @method('PUT')
                <label for="editTitle">Title:</label>
                <input type="text" id="editTitle" name="title" required>

                <label for="editContent">Content:</label>
                <textarea id="editContent" name="content" rows="4" required></textarea>

                <label for="editOrder">Order:</label>
                <input type="number" id="editOrder" name="order_index" required>

                <button type="submit" class="btn btn-primary">Save Changes</button>
            </form>
        </div>
    </div>

    <!-- Delete Modal -->
    <div id="deleteModal" class="modal">
        <div class="modal-content">
            <span class="close" onclick="closeModal('deleteModal')">&times;</span>
            <h2>Delete Refund Policy Section</h2>
            <p>Are you sure you want to delete this section?</p>
            <form id="deleteForm" method="POST">
                @csrf
                @method('DELETE')
                <button type="submit" class="btn btn-danger">Yes, Delete</button>
                <button type="button" class="btn btn-secondary" onclick="closeModal('deleteModal')">Cancel</button>
            </form>
        </div>
    </div>
    <script>
        function openEditModal(button) {
        const id = button.getAttribute('data-id');
        const title = button.getAttribute('data-title');
        const content = button.getAttribute('data-content');
        const order = button.getAttribute('data-order');

        const form = document.getElementById('editForm');
        form.action = '/admin/refund-policy/' + id;

        document.getElementById('editTitle').value = title;

        // Decode entities so <b>, <i> show as raw HTML in textarea
        document.getElementById('editContent').value = decodeHTMLEntities(content);

        document.getElementById('editOrder').value = order;

        document.getElementById('editModal').style.display = 'block';
    }

    function decodeHTMLEntities(text) {
        const textarea = document.createElement('textarea');
        textarea.innerHTML = text;
        return textarea.value;
    }

    function openDeleteModal(id) {
        const form = document.getElementById('deleteForm');
        form.action = '/admin/refund-policy/' + id;

        document.getElementById('deleteModal').style.display = 'block';
    }

    function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    function openModal(modalId) {
        document.getElementById(modalId).style.display = 'block';
    }
    function closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }
    // Close modals when clicking outside of them
    window.onclick = function(event) {
        const modals = ['addModal', 'editModal', 'deleteModal'];
        modals.forEach(modalId => {
            const modal = document.getElementById(modalId);
            if (event.target == modal) {
                modal.style.display = "none";
            }
        });
    }
        // Toggle "See More" functionality
    document.querySelectorAll('.toggle-btn').forEach(button => {
        button.addEventListener('click', function() {
            const descriptionWrapper = this.parentElement;
            const shortText = descriptionWrapper.querySelector('.short-text');
            const fullText = descriptionWrapper.querySelector('.full-text');

            if (shortText.style.display === 'none') {
                shortText.style.display = 'inline';
                fullText.style.display = 'none';
                this.textContent = 'See More';
            } else {
                shortText.style.display = 'none';
                fullText.style.display = 'inline';
                this.textContent = 'See Less';
            }
        });
    });
    </script>
</body>
</html>