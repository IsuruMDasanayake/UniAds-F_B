<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to UniAds</title>
    <link rel="icon" type="image/x-icon" href="{{ asset('favicon.ico') }}">
    <link rel="stylesheet" href="{{ asset('css/index.css') }}">
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
</head>

<body>

    <!-- Header -->
    <header class="header">
        <div class="header-left">
            <div class="logo">UniAds</div>
            <div class="hamburger" onclick="toggleMenu()">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>

        <div class="header-menu" id="headerMenu">
            <nav>
                <a href="#features">Features</a>
                <a href="#about">About Us</a>
                <a href="#footer">Contact</a>
            </nav>

            <!-- Profile Dropdown -->
            <div class="profile-dropdown">
                <button onclick="toggleDropdown()" class="profile-btn">
                    <span class="username">{{ Auth::user()->name }}</span>
                </button>
                <div id="dropdown-menu" class="dropdown-content">
                    <a href="{{ route('profile.edit') }}">Account Settings</a>
                    <form action="{{ route('logout') }}" method="POST" style="display:inline;">
                        @csrf
                        <button type="submit" class="dropdown-link">Log Out</button>
                    </form>
                </div>
            </div>
        </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
        <div class="hero-slideshow">
            <img src="{{ asset('images/image3.jpg') }}" class="hero-slide active" alt="Slide 1">
            <img src="{{ asset('images/image2.jpg') }}" class="hero-slide" alt="Slide 2">
            <img src="{{ asset('images/image4.jpg') }}" class="hero-slide" alt="Slide 4">
            <img src="{{ asset('images/image5.jpg') }}" class="hero-slide" alt="Slide 5">
            <img src="{{ asset('images/image6.jpg') }}" class="hero-slide" alt="Slide 6">
            <img src="{{ asset('images/image7.jpg') }}" class="hero-slide" alt="Slide 7">
            <img src="{{ asset('images/image8.jpg') }}" class="hero-slide" alt="Slide 8">
            <img src="{{ asset('images/image9.jpg') }}" class="hero-slide" alt="Slide 9">

        </div>
        <div class="hero-content-container">
            <div class="square-box">
                <div class="hero-content">
                    <h1>Empowering Education with UniAds</h1>
                    <p>Your gateway to higher education in Sri Lanka. Explore, connect, and unlock your future.</p>
                    <a href="{{ url('/feed') }}" class="cta-btn">Discover More</a>
                </div>
            </div>
        </div>
    </section>

    <!-- Features Section -->
    <section class="features" id="features">
        <h2>What We Offer</h2>
        <div class="features-grid">
            <div class="feature-card">
                <img src="{{ asset('images/welcome/Institutions.png') }}" alt="Institutions">
                <h3>Institution Profiles</h3>
                <p>Discover top universities and institutions in Sri Lanka with detailed profiles.</p>
            </div>
            <div class="feature-card">
                <img src="{{ asset('images/welcome/Program.png') }}" alt="Programs">
                <h3>Program Listings</h3>
                <p>Find programs tailored to your goals, including degrees, diplomas, and more.</p>
            </div>
            <div class="feature-card">
                <img src="{{ asset('images/welcome/Search.png') }}" alt="Search">
                <h3>Search & Filter</h3>
                <p>Easily search and filter programs by location, duration, or study mode.</p>
            </div>
            <div class="feature-card">
                <img src="{{ asset('images/welcome/Apply.png') }}" alt="Apply">
                <h3>Course Applications</h3>
                <p>Apply directly to your desired programs with just a few clicks and start your academic journey.</p>
            </div>
        </div>
    </section>

    <!-- About Section -->
<section class="about" id="about">
    <h2>About UniAds</h2>

    <p>
        <strong>UniAds</strong> is a comprehensive digital platform designed to simplify and modernize how higher education
        opportunities are discovered and promoted in Sri Lanka. We serve as a trusted bridge between students, parents,
        and higher education institutions by providing accurate, verified, and up-to-date academic information in one
        centralized space.
    </p>

    <p>
        Our platform empowers students to explore universities, institutes, degree programs, diplomas, and master’s
        programs through detailed institution profiles, advanced course filtering, and transparent insights. At the same
        time, UniAds enables educational institutions to effectively showcase their offerings, engage with prospective
        students, and expand their digital presence in a competitive education landscape.
    </p>

    <p>
        With features such as course discovery, institution dashboards, direct communication, and application support,
        UniAds ensures that students can make informed academic decisions while institutions connect with the right
        audience at the right time.
    </p>

    <h3>Our Vision</h3>
    <p>
        To become Sri Lanka’s most trusted and innovative digital platform for discovering, comparing, and connecting
        with higher education opportunities.
    </p>

    <h3>Our Mission</h3>
    <p>
        Our mission is to provide a centralized, transparent, and user-friendly platform that empowers students to make
        informed educational decisions, while enabling higher education institutions to promote their academic offerings
        through modern, data-driven digital tools.
    </p>

    <p>
        <strong>UniAds is not just a platform — it is a partner in shaping academic futures.</strong>
    </p>
</section>

    <!-- Contact Section -->
    <section class="contact" id="contact">
        <div class="contact-container">
            <div class="contact-header">
                <h2>Get in Touch</h2>
                <p>Have questions, feedback, or partnership inquiries? We’d love to hear from you!</p>
            </div>

            <div class="contact-wrapper">
                <div class="contact-info">
                    <h3>Contact Information</h3>
                    <p><i class="fas fa-map-marker-alt"></i> SIBA Campus, Kandy, Sri Lanka</p>
                    <p><i class="fas fa-envelope"></i> support@uniads.com</p>
                    <p><i class="fas fa-phone"></i> +94 77 230 0279</p>
                    <p><i class="fab fa-whatsapp"></i> <a href="https://wa.me/94772300279" target="_blank">Chat on
                            WhatsApp</a></p>

                    <div class="social-links">
                        <a href="https://web.facebook.com/profile.php?id=61579680668904" target="_blank"><i
                                class="fab fa-facebook-f"></i></a>
                        <a href="https://instagram.com" target="_blank"><i class="fab fa-instagram"></i></a>
                        <a href="https://linkedin.com" target="_blank"><i class="fab fa-linkedin-in"></i></a>
                    </div>
                </div>

                <form class="contact-form" action="{{ route('contact.submit') }}" method="POST">
                    @csrf
                    <h3>Send Us a Message</h3>
                    <div class="form-group">
                        <label>Name</label>
                        <input type="text" name="name" placeholder="John Doe" required>
                    </div>
                    <div class="form-group">
                        <label>Email</label>
                        <input type="email" name="email" placeholder="john@example.com" required>
                    </div>
                    <div class="form-group">
                        <label>Message</label>
                        <textarea name="message" rows="5" placeholder="How can we help you?" required></textarea>
                    </div>
                    <button type="submit" class="contact-btn">Send Message</button>
                </form>
            </div>
        </div>
    </section>


    <!-- Footer -->
    <footer class="footer">
        <div class="footer-container">
            <!-- Logo / Brand -->
            <div class="footer-brand">
                <h2>UniAds</h2>
                <p>Discover. Decide. Succeed.</p>
            </div>

            <!-- Footer Navigation -->
            <div class="footer-links">
                <a href="/privacy-policy">Privacy Policy</a>
                <a href="/terms-conditions">Terms & Conditions</a>
                <a href="/refund-policy">Refund Policy</a>
                <a href="mailto:support@uniads.com">Contact Us</a>
            </div>

            <!-- Social Links -->
            <div class="footer-social">
                <a href="https://wa.me/94772300279" target="_blank" aria-label="WhatsApp">
                    <i class="fab fa-whatsapp"></i>
                </a>
                <a href="https://web.facebook.com/profile.php?id=61579680668904" target="_blank" aria-label="Facebook">
                    <i class="fab fa-facebook-f"></i>
                </a>
                <a href="https://instagram.com" target="_blank" aria-label="Instagram">
                    <i class="fab fa-instagram"></i>
                </a>
                <a href="https://linkedin.com" target="_blank" aria-label="LinkedIn">
                    <i class="fab fa-linkedin-in"></i>
                </a>
            </div>
        </div>

        <!-- Copyright -->
        <div class="footer-bottom">
            <p>&copy; 2025 UniAds V1.0. All Rights Reserved.</p>
        </div>
    </footer>



    <script>
        function toggleDropdown() {
            const dropdown = document.getElementById('dropdown-menu');
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        }

        function toggleMenu() {
            document.getElementById('headerMenu').classList.toggle('show');
        }

        // Close dropdown if clicked outside
        window.addEventListener('click', function (event) {
            const dropdown = document.getElementById('dropdown-menu');
            const profileBtn = document.querySelector('.profile-btn');
            if (!dropdown.contains(event.target) && !profileBtn.contains(event.target)) {
                dropdown.style.display = 'none';
            }
        });

        // Hero slideshow logic
        document.addEventListener("DOMContentLoaded", function () {
            const slides = document.querySelectorAll(".hero-slide");
            let currentIndex = 0;

            function changeSlide() {
                slides[currentIndex].classList.remove("active");
                currentIndex = (currentIndex + 1) % slides.length;
                slides[currentIndex].classList.add("active");
            }

            setInterval(changeSlide, 3000);
        });
    </script>
</body>

</html>