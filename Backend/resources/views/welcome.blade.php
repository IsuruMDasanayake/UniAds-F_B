<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <title>Welcome to UniAds</title>
    <link rel="stylesheet" href="{{ asset('css/welcome.css') }}">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>

<body class="welcome-body">

    <div class="container">
        <header class="header">
            <img src="{{ asset('images/logo.png') }}" alt="UniAds Logo" class="logo">
        </header>

        <main class="main-content">
            <h1>Welcome..!!</h1>
            <p>Your gateway to higher education in Sri Lanka. Find your ideal program, connect with top institutions,
                and start your educational journey with us.</p>

            <div class="services">
                <div class="service">
                    <i class="icon fa fa-university"></i>
                    <h3>Institution Profiles</h3>
                    <p>Discover leading universities and their offerings at a glance.</p>
                </div>
                <div class="service">
                    <i class="icon fa fa-book"></i>
                    <h3>Program Listings</h3>
                    <p>Explore degree, diploma, and master’s programs from various institutions.</p>
                </div>
                <div class="service">
                    <i class="icon fa fa-filter"></i>
                    <h3>Search & Filter</h3>
                    <p>Find the perfect course by location, duration, or study format.</p>
                </div>
                <div class="service">
                    <i class="icon fa fa-paper-plane"></i>
                    <h3>Course Applications</h3>
                    <p>Apply easily to your chosen courses and take the first step toward your future.</p>
                </div>
            </div>

            <p>Join UniAds today and take the next step toward your future!</p>
        </main>

        <!-- Auth Buttons now placed at the bottom -->
        <div class="auth-buttons mobile-move">
            <a href="{{ route('login') }}" class="auth-button login-button">Login</a>
            <a href="{{ route('register') }}" class="auth-button register-button">Register</a>
        </div>
    </div>

</body>

</html>
