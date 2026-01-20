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
                    <h2 class="title">Reviews & Ratings</h2>
                </div>
                <table class="table">

                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Commented User</th>
                            <th>Rating</th>
                            <th>Comment</th>
                            <th>Institute</th>
                            <th>Posted At</th>
                            <th>Reason</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach ($ratings as $rating)
                            <tr>
                                <td>{{ $rating->id }}</td>
                                <td>{{ $rating->user->name ?? 'Unknown User' }}</td>
                                <td>{{ str_repeat('★', $rating->rating) }}{{ str_repeat('☆', 5 - $rating->rating) }}
                                </td>
                                <td>{{ $rating->comment }}</td>
                                <td>{{ $rating->institute->institute_name ?? 'Unknown Institute' }}</td>
                                <td>{{ $rating->created_at->format('Y-m-d') }}</td>
                                <td>{{ $rating->report_reason ?? '—' }}</td>
                                <td>
                                    <form action="{{ route('admin.delete.review', $rating->id) }}" method="POST"
                                        onsubmit="return confirm('Delete this review?');">
                                        @csrf
                                        @method('DELETE')
                                        <button
                                            class="badge-trashed">Delete</button>
                                    </form>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>

                </table>
            </div>
        </div>
    </div>

    <script></script>
</body>

</html>
