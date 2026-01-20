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
                    <h2 class="title">Posts</h2>
                </div>
                <table class="table">
                    <thead>
                        <th>Institute</th>
                        <th>Title</th>
                        <th>Small Description</th>
                        <th>Description</th>
                        <th>Course Name</th>
                        <th>Course Type</th>
                        <th>Location</th>
                        <th>Duration</th>
                        <th>Course Format</th>
                        <th>Attendance Type</th>
                        <th>Likes Count</th>
                        <th>Actions</th>
                    </thead>
                    <tbody>
                        @foreach ($posts as $post)
                            <tr>
                                <td>{{ $post->institute ? $post->institute->institute_name : 'N/A' }}</td>
                                <td data-label="Title">{{ $post->title }}</td>
                                <td data-label="Small Description">{!! nl2br(e($post->small_description)) !!}</td>
                                <td data-label="Description">
                                    <div class="description-wrapper">
                                        <span class="short-text">
                                            {{ Str::limit(strip_tags($post->description), 50) }}
                                        </span>
                                        <span class="full-text" style="display: none;">
                                            {!! nl2br(e($post->description)) !!}
                                        </span>
                                        <button type="button" class="toggle-btn">See More</button>
                                    </div>
                                </td>

                                <td data-label="Course Name">{{ $post->course_name }}</td>
                                <td data-label="Course Type">{{ $post->course_type }}</td>
                                <td data-label="Location">{{ $post->location }}</td>
                                <td data-label="Duration">{{ $post->duration }}</td>
                                <td data-label="Course Format">{{ $post->course_format }}</td>
                                <td data-label="Attendance Type">{{ $post->attendance_type }}</td>
                                <td data-label="Likes Count">{{ $post->likes_count }}</td>
                                <td data-label="Actions">
                                    <form action="{{ route('posts.destroy', $post->id) }}" method="POST"
                                        onsubmit="return confirm('Are you sure you want to delete this post?');">
                                        @csrf
                                        @method('DELETE')
                                        <button type="submit" class="badge-trashed">Delete</button>
                                    </form>
                                </td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
</body>

<script>
    $(document).ready(function() {
        $(".toggle-btn").click(function() {
            const wrapper = $(this).closest(".description-wrapper");
            const shortText = wrapper.find(".short-text");
            const fullText = wrapper.find(".full-text");

            if (fullText.is(":visible")) {
                fullText.hide();
                shortText.show();
                $(this).text("See More");
            } else {
                fullText.show();
                shortText.hide();
                $(this).text("Show Less");
            }
        });
    });
</script>


</html>
