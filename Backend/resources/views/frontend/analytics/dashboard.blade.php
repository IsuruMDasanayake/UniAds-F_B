<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Analytics Dashboard</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    {{-- Optional icons/fonts --}}
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">

    {{-- Your custom feed styles --}}
    <link rel="stylesheet" href="{{ asset('css/feed.css') }}">
    <link rel="stylesheet" href="{{ asset('css/analytics.css') }}">
    <script src="{{ asset('js/navbar.js') }}"></script>
    <script src="https://cdn.tailwindcss.com"></script>
</head>

<body>

    @include('frontend.navbar')

    <!-- Main Header -->
    <div class="main-header">
        Analytics Dashboard
    </div>
    <!-- Sidebar Toggle for Mobile -->
    <div class="sidebar-toggle" onclick="toggleSidebar()">
        <span>Menu</span>
        <i id="chevron-icon" class="fas fa-chevron-down"></i>
    </div>

    <div class="dashboard-wrapper">

        <!-- Sidebar -->
        <aside class="sidebar">
            <button class="nav-button" data-section="overview">Overview Stats</button>
            <button class="nav-button" data-section="trends">Trends Over Time</button>
            <button class="nav-button" data-section="posts">Post Analytics</button>
            <button class="nav-button" data-section="events">Event Engagement</button>
            <button class="nav-button" data-section="ads">Manage Ads</button>
            <button class="nav-button" data-section="ratings">Reviews & Ratings</button>
            <button class="nav-button" data-section="subscription">Subscription Status</button>
        </aside>


        <!-- Main Content -->
        <div class="main-content">
            <div class="content-area">
                <div class="main-card">

                    {{-- Welcome Section (Default) --}}
                    <div class="card-section" id="welcome-section">
                        <h2 class="welcome-heading">
                            Welcome, {{ $institute->institute_name ?? 'Your Institute' }}! 👋
                        </h2>
                        <p class="welcome-subtext">
                            We're glad to have you on UniAds Premium. This dashboard gives you a powerful overview of
                            how your institute is performing — from student engagement to course applications and more.
                        </p>
                        <p class="welcome-subtext">
                            Use the navigation on the left to explore detailed insights into your posts, followers,
                            feedback, and event engagement. Let your data guide your next big move!
                        </p>
                        <div class="welcome-highlight">
                            Need help? <a href="#">Visit the support center</a> or <a href="#">contact
                                UniAds</a> for assistance.
                        </div>
                    </div>

                    {{-- Overview Stats --}}
                    <div>
                        @include('frontend.analytics.overview')
                    </div>

                    {{-- Other Sections... --}}
                    <div>
                        @include('frontend.analytics.trends')
                    </div>

                    <div>
                        @include('frontend.analytics.posts', ['posts' => $posts])
                    </div>

                    <div>
                        @include('frontend.analytics.events')
                    </div>

                    <div>
                        @include('frontend.analytics.ads')
                    </div>

                    <div>
                        @include('frontend.analytics.ratings')
                    </div>

                    <div>
                        @include('frontend.analytics.subscription')
                    </div>
                </div>


            </div>
        </div>
    </div>

</body>
<script>
    document.addEventListener("DOMContentLoaded", function() {
        const buttons = document.querySelectorAll(".nav-button");
        const sections = document.querySelectorAll(".card-section");

        buttons.forEach(btn => {
            btn.addEventListener("click", function() {
                // Remove active class
                buttons.forEach(b => b.classList.remove("active"));
                this.classList.add("active");

                // Get clicked section
                const sectionId = this.getAttribute("data-section") + "-section";

                // Hide all sections
                sections.forEach(sec => sec.style.display = "none");

                // Show selected section
                const target = document.getElementById(sectionId);
                if (target) target.style.display = "block";
            });
        });
    });



    function toggleSidebar() {
        const sidebar = document.querySelector('.sidebar');
        const chevron = document.getElementById('chevron-icon');

        sidebar.classList.toggle('show');
        chevron.classList.toggle('fa-chevron-down');
        chevron.classList.toggle('fa-chevron-up');
    }

    document.addEventListener("DOMContentLoaded", function() {
        const buttons = document.querySelectorAll(".nav-button");
        const sections = document.querySelectorAll(".card-section");

        buttons.forEach(btn => {
            btn.addEventListener("click", function() {
                // Remove active class from all buttons
                buttons.forEach(b => b.classList.remove("active"));
                this.classList.add("active");

                // Hide all sections
                sections.forEach(sec => sec.style.display = "none");

                // Show selected section
                const sectionId = this.getAttribute("data-section") + "-section";
                const target = document.getElementById(sectionId);
                if (target) target.style.display = "block";

                // Auto-hide sidebar on mobile
                if (window.innerWidth <= 768) {
                    const sidebar = document.querySelector('.sidebar');
                    const chevron = document.getElementById('chevron-icon');

                    if (sidebar.classList.contains('show')) {
                        sidebar.classList.remove('show');
                        chevron.classList.remove('fa-chevron-up');
                        chevron.classList.add('fa-chevron-down');
                    }
                }
            });
        });
    });
</script>

</html>
