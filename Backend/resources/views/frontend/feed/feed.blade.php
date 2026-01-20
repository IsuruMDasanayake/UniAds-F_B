<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>Feed</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <!-- Add CSS and FontAwesome -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css" rel="stylesheet">

    <link rel="stylesheet" href="{{ asset('css/feed.css') }}">
    <link rel="stylesheet" href="{{ asset('css/posts.css') }}">
    <link rel="stylesheet" href="{{ asset('css/events.css') }}">
    <style>

    </style>
</head>

<body>


    {{-- Include the Navbar --}}
    @include('frontend.navbar')

    <main>
        {{-- Left Side Column with Toggle Arrow --}}
        <div class="left-side-wrapper">
            {{-- <div class="toggle-arrow" onclick="toggleLeftSidebar()">&#x2192;</div> --}}

            <div class="left-side-card" id="leftSidebar">
                @include('frontend.feed.programs')
            </div>
        </div>


        {{-- Content Area --}}
        <div class="middle-section">
            @include('frontend.feed.posts', ['posts' => $posts])
        </div>

        {{-- Right Side Toggle Container --}}
        <div class="right-toggle-container">
            <!-- Right Arrow Toggle Button -->
            <div class="right-toggle-arrow" onclick="toggleRightSidebar()">
                <i class="fa fa-angle-left"></i>
            </div>

            <div class="left-column" id="rightSideSection">
                @include('frontend.feed.events', ['events' => $events])
            </div>
        </div>

    </main>

    <script src="{{ asset('js/navbar.js') }}"></script>
    <script src="{{ asset('js/programs.js') }}"></script>
    <script>
        function toggleLeftSidebar() {
            const sidebar = document.getElementById('leftSidebar');
            sidebar.classList.toggle('show');
        }


        function toggleRightSidebar() {
            const sidebar = document.querySelector('.upcoming-events-card');
            const arrow = document.querySelector('.right-toggle-arrow');

            sidebar.classList.toggle('active');
            arrow.classList.toggle('active');
        }


        let page = 2;
        let loading = false;

        window.addEventListener('scroll', () => {
            if (loading) return;

            const scrollTop = window.scrollY;
            const scrollHeight = document.body.scrollHeight;
            const clientHeight = window.innerHeight;

            if (scrollTop + clientHeight >= scrollHeight - 150) {
                loadMorePosts();
            }
        });

        function loadMorePosts() {
            loading = true;
            document.getElementById('loading').style.display = 'block';

            fetch(`/posts/load-more?page=${page}`)
                .then(res => res.json())
                .then(data => {
                    document.getElementById('post-container').insertAdjacentHTML('beforeend', data.html);
                    page = data.next_page;
                    loading = false;
                    if (!data.has_more) {
                        document.getElementById('loading').innerText = "No more posts.";
                    } else {
                        document.getElementById('loading').style.display = 'none';
                    }
                });
        }



        document.addEventListener('DOMContentLoaded', function () {
            let eventPage = 1;
            let loadingEvents = false;
            let eventsLastPage = false;

            window.addEventListener('scroll', () => {
                const scrollTop = window.scrollY;
                const windowHeight = window.innerHeight;
                const docHeight = document.documentElement.scrollHeight;

                if (scrollTop + windowHeight > docHeight - 100) { // near bottom
                    if (!eventsLastPage && !loadingEvents) {
                        loadingEvents = true;
                        eventPage++;

                        fetch(`/load-more-events?page=${eventPage}`)
                            .then(res => res.json())
                            .then(data => {
                                if (data.html) {
                                    document.getElementById('event-content').insertAdjacentHTML('beforeend', data.html);
                                }
                                eventsLastPage = data.last_page;
                                loadingEvents = false;
                            });
                    }
                }
            });
        });

    </script>

</body>

</html>