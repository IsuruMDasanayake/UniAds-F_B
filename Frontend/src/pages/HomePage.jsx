import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './HomePage.css';

const slides = [
    'http://localhost:8000/images/1%20(1).jpg',
    'http://localhost:8000/images/1%20(2).jpg',
    'http://localhost:8000/images/1%20(3).jpg',
    'http://localhost:8000/images/1%20(4).jpg',
    'http://localhost:8000/images/1%20(5).jpg',
    'http://localhost:8000/images/1%20(6).jpg',
    'http://localhost:8000/images/1%20(7).jpg',
    'http://localhost:8000/images/1%20(10).jpg'
];

const HomePage = () => {
    const navigate = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);

    // Redirect authenticated users
    useEffect(() => {
        const token = localStorage.getItem('ACCESS_TOKEN');
        const userStr = localStorage.getItem('APP_USER');

        if (token) {
            if (userStr) {
                try {
                    const user = JSON.parse(userStr);
                    if (user.role === 'Admin') {
                        navigate('/admin/dashboard');
                        return;
                    }
                } catch (e) {
                    console.error('Error parsing user data:', e);
                }
            }
            navigate('/feed');
        }
    }, [navigate]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % slides.length);
        }, 3000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="home-page-container">
            {/* Header */}
            <header className="home-header">
                <div className="home-header-left">
                    <Link to="/" className="home-logo">
                        <img src="/images/logo.png" alt="UniAds Logo" className="logo-img" />
                    </Link>
                    <div className="home-hamburger" onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}>
                        <span></span>
                        <span></span>
                        <span></span>
                    </div>
                </div>

                <div className={`home-header-menu ${menuOpen ? 'show' : ''}`} id="headerMenu">
                    <nav>
                        <a href="#features">Features</a>
                        <a href="#about">About Us</a>
                        <a href="#contact">Contact</a>
                    </nav>

                    {/* Login/Register Buttons */}
                    <div className="home-auth-buttons">
                        <Link to="/login" className="home-login-btn">Login</Link>
                        <Link to="/register" className="home-register-btn">Register</Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="home-hero">
                <div className="home-hero-slideshow">
                    {slides.map((slide, index) => (
                        <img
                            key={index}
                            src={slide}
                            alt={`Slide ${index + 1}`}
                            className={`home-hero-slide ${index === currentSlide ? 'active' : ''}`}
                        />
                    ))}
                </div>
                <div className="home-hero-content-container">
                    <div className="home-square-box">
                        <div className="home-hero-content">
                            <h1>Empowering Education with UniAds</h1>
                            <p>Your gateway to higher education in Sri Lanka. Explore, connect, and unlock your future.</p>
                            <Link to="/login" className="home-cta-btn">Discover More</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="home-features" id="features">
                <h2>What We Offer</h2>
                <div className="home-features-grid">
                    <div className="home-feature-card">
                        <img src="http://localhost:8000/images/welcome/Institutions.png" alt="Institutions" />
                        <h3>Institution Profiles</h3>
                        <p>Discover top universities and institutions in Sri Lanka with detailed profiles.</p>
                    </div>
                    <div className="home-feature-card">
                        <img src="http://localhost:8000/images/welcome/Program.png" alt="Programs" />
                        <h3>Program Listings</h3>
                        <p>Find programs tailored to your goals, including degrees, diplomas, and more.</p>
                    </div>
                    <div className="home-feature-card">
                        <img src="http://localhost:8000/images/welcome/Search.png" alt="Search" />
                        <h3>Search & Filter</h3>
                        <p>Easily search and filter programs by location, duration, or study mode.</p>
                    </div>
                    <div className="home-feature-card">
                        <img src="http://localhost:8000/images/welcome/Apply.png" alt="Apply" />
                        <h3>Course Applications</h3>
                        <p>Apply directly to your desired programs with just a few clicks and start your academic journey.</p>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="home-about" id="about">
                <h2>About UniAds</h2>
                <p>
                    <strong>UniAds</strong> is a comprehensive digital platform designed to simplify and modernize how higher education
                    opportunities are discovered and promoted in Sri Lanka. We serve as a trusted bridge between students, parents,
                    and higher education institutions by providing accurate, verified, and up-to-date academic information in one
                    centralized space.
                </p>
                <p>
                    With features such as course discovery, institution dashboards, direct communication, and application support,
                    UniAds ensures that students can make informed academic decisions while institutions connect with the right
                    audience at the right time.
                </p>
                <h3>Our Vision</h3>
                <p>To become Sri Lanka’s most trusted and innovative digital platform for discovering, comparing, and connecting with higher education opportunities.</p>
                <h3>Our Mission</h3>
                <p>To provide a centralized, transparent, and user-friendly platform that empowers students to make informed educational decisions, while enabling higher education institutions to promote their academic offerings.</p>
            </section>

            {/* Contact Section */}
            <section className="home-contact" id="contact">
                <div className="home-contact-container">
                    <div className="home-contact-header">
                        <h2>Get in Touch</h2>
                        <p>Have questions, feedback, or partnership inquiries? We’d love to hear from you!</p>
                    </div>

                    <div className="home-contact-wrapper">
                        <div className="home-contact-info">
                            <div>
                                <h3>Contact Information</h3>
                                <div className="home-contact-item"><i className="fas fa-map-marker-alt"></i> SIBA Campus, Kandy, Sri Lanka</div>
                                <div className="home-contact-item"><i className="fas fa-envelope"></i> support@uniads.com</div>
                                <div className="home-contact-item"><i className="fas fa-phone"></i> +94 77 230 0279</div>
                            </div>

                            <div className="home-social-links">
                                <a href="https://web.facebook.com/profile.php?id=61579680668904" target="_blank" className="home-social-btn"><i className="fab fa-facebook-f"></i></a>
                                <a href="https://instagram.com" target="_blank" className="home-social-btn"><i className="fab fa-instagram"></i></a>
                                <a href="https://linkedin.com" target="_blank" className="home-social-btn"><i className="fab fa-linkedin-in"></i></a>
                            </div>
                        </div>

                        <form className="home-contact-form">
                            <h3>Send Us a Message</h3>
                            <div className="home-form-group">
                                <label>Name</label>
                                <input type="text" placeholder="John Doe" required />
                            </div>
                            <div className="home-form-group">
                                <label>Email</label>
                                <input type="email" placeholder="john@example.com" required />
                            </div>
                            <div className="home-form-group">
                                <label>Message</label>
                                <textarea rows="5" placeholder="How can we help you?" required></textarea>
                            </div>
                            <button type="submit" className="home-contact-btn">Send Message</button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <div className="home-footer-container">
                    <div className="home-footer-brand">
                        <img src="/images/logo.png" alt="UniAds Logo" className="footer-logo-img" />
                        <p>Discover. Decide. Succeed.</p>
                    </div>
                    <div className="home-footer-links">
                        <a href="/privacy-policy">Privacy Policy</a>
                        <a href="/terms-conditions">Terms & Conditions</a>
                        <a href="/refund-policy">Refund Policy</a>
                        <a href="mailto:support@uniads.com">Contact Us</a>
                    </div>
                    <div className="home-footer-social">
                        <a href="https://wa.me/94772300279" target="_blank"><i className="fab fa-whatsapp"></i></a>
                        <a href="https://web.facebook.com/profile.php?id=61579680668904" target="_blank"><i className="fab fa-facebook-f"></i></a>
                    </div>
                </div>
                <div className="home-footer-bottom">
                    <p>&copy; 2025 UniAds V1.0. All Rights Reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HomePage;
