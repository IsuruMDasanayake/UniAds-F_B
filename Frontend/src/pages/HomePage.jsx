import { useEffect, useState } from 'react';
import { BACKEND_URL, getStorageUrl } from '../lib/config';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../lib/axios';
import { useSettings } from '../context/SettingsContext';
import AccessDeniedModal from '../components/Modals/AccessDeniedModal';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import './HomePage.css';

const HomePage = () => {
    const navigate = useNavigate();
    const { settings, loading } = useSettings();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [menuOpen, setMenuOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({ isOpen: false, title: '', message: '' });

    // Contact form state
    const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState({ type: '', message: '' });
    const [feedbacks, setFeedbacks] = useState([]);
    const [partners, setPartners] = useState([]);
    const [testimonialIndex, setTestimonialIndex] = useState(0);
    const [cardsPerView, setCardsPerView] = useState(3);

    // Dynamic slides from settings or fallback to defaults
    const displaySlides = (settings.home_slides_urls && settings.home_slides_urls.length > 0)
        ? settings.home_slides_urls
        : [
            `${BACKEND_URL}/images/image1.jpg`,
            `${BACKEND_URL}/images/image2.jpg`,
            `${BACKEND_URL}/images/image3.jpg`,
            `${BACKEND_URL}/images/image4.jpg`,
            `${BACKEND_URL}/images/image5.jpg`,
            `${BACKEND_URL}/images/image6.jpg`,
            `${BACKEND_URL}/images/image7.jpg`,
            `${BACKEND_URL}/images/image8.jpg`
        ];

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
                    console.error('Error parsing user data:', e?.message || e);
                }
            }
            navigate('/feed');
        }
    }, [navigate]);

    useEffect(() => {
        const fetchFeedbacks = async () => {
            try {
                const response = await axiosClient.get('/api/feedbacks/public');
                setFeedbacks(response.data.data || []);
            } catch (error) {
                console.error('Error fetching feedbacks:', error?.message || error);
            }
        };

        const fetchPartners = async () => {
            try {
                const response = await axiosClient.get('/api/institutes/partners');
                setPartners(response.data.data || []);
            } catch (error) {
                console.error('Error fetching partners:', error?.message || error);
            }
        };

        fetchFeedbacks();
        fetchPartners();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide(prev => (prev + 1) % displaySlides.length);
        }, 5000); // Increased hero interval for better experience

        return () => clearInterval(interval);
    }, [displaySlides]);

    // Carousel Responsiveness
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth < 768) setCardsPerView(1);
            else if (window.innerWidth < 1100) setCardsPerView(2);
            else setCardsPerView(3);
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Testimonial Auto-slide
    useEffect(() => {
        if (feedbacks.length <= cardsPerView) return;
        const interval = setInterval(() => {
            setTestimonialIndex(prev => {
                const maxIndex = feedbacks.length - cardsPerView;
                return prev >= maxIndex ? 0 : prev + 1;
            });
        }, 5000);
        return () => clearInterval(interval);
    }, [feedbacks.length, cardsPerView]);

    const handleContactSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: '', message: '' });

        try {
            await axiosClient.post('/api/contact', contactForm);
            setStatus({ type: 'success', message: 'Thank you for your message! We will get back to you soon.' });
            setContactForm({ name: '', email: '', message: '' });
        } catch (error) {
            console.error('Contact form error:', error?.message || error);
            setStatus({
                type: 'error',
                message: error.response?.data?.message || 'Failed to send message. Please try again later.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const stripHtml = (html) => {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
    };

    const getSocialIcon = (platform) => {
        switch (platform.toLowerCase()) {
            case 'facebook': return 'fab fa-facebook-f';
            case 'instagram': return 'fab fa-instagram';
            case 'linkedin': return 'fab fa-linkedin-in';
            case 'twitter': return 'fab fa-twitter';
            case 'whatsapp': return 'fab fa-whatsapp';
            case 'youtube': return 'fab fa-youtube';
            default: return 'fas fa-share-alt';
        }
    };

    const handleAuthClick = (e, path, type) => {
        if (type === 'login' && !settings.allow_login) {
            e.preventDefault();
            setModalConfig({
                isOpen: true,
                title: "Login Disabled",
                message: "Login functionality is currently disabled by the administrator. Please try again later."
            });
            return;
        }
        if (type === 'register' && !settings.allow_user_registration) {
            e.preventDefault();
            setModalConfig({
                isOpen: true,
                title: "Registration Disabled",
                message: "New registrations are currently disabled by the administrator. Please contact support if you need assistance."
            });
            return;
        }
    };

    if (loading) {
        return (
            <div className="homepage-loader-container">
                <img src="/images/logo.png" alt="Loading..." className="homepage-loader-logo" />
                <div className="homepage-loader-spinner"></div>
                <div className="homepage-loader-text">Loading UniAds...</div>
            </div>
        );
    }

    return (
        <div className="home-page-container">
            {/* Header */}
            <header className="home-header">
                <div className="home-header-left">
                    <Link to="/" className="home-logo">
                        <img src={settings.logo_url || "/images/logo.png"} alt={`${settings.site_name} Logo`} className="logo-img" />
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
                        <Link to="/login" className="home-login-btn" onClick={(e) => handleAuthClick(e, '/login', 'login')}>Login</Link>
                        <Link to="/register" className="home-register-btn" onClick={(e) => handleAuthClick(e, '/register', 'register')}>Register</Link>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="home-hero">
                <div className="home-hero-slideshow">
                    {displaySlides.map((slide, index) => (
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
                            <h1>Empowering Education with {settings.site_name}</h1>
                            <p>{settings.tagline || 'Your gateway to higher education in Sri Lanka. Explore, connect, and unlock your future.'}</p>
                            <Link to="/login" className="home-cta-btn" onClick={(e) => handleAuthClick(e, '/login', 'login')}>Discover More</Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Partners Marquee Section */}
            {settings.show_partners && partners.length > 0 && (
                <section className="home-partners">
                    <div className="home-partners-container">
                        <div className="section-header-mini">
                            <span className="subtitle">Our Partners</span>
                            <h2>Collaborating with Excellence</h2>
                        </div>
                        
                        <div className="partners-marquee-container">
                            <motion.div 
                                className="partners-marquee-track"
                                animate={{ 
                                    x: [0, -1035] 
                                }}
                                transition={{ 
                                    x: {
                                        repeat: Infinity,
                                        repeatType: "loop",
                                        duration: 30,
                                        ease: "linear"
                                    }
                                }}
                            >
                                {/* Duplicated for infinite effect */}
                                {[...partners, ...partners, ...partners].map((partner, index) => (
                                    <div key={`${partner.id}-${index}`} className="partner-logo-card">
                                        <img 
                                            src={getStorageUrl(partner.logo)} 
                                            alt={partner.institute_name} 
                                            title={partner.institute_name}
                                        />
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </section>
            )}

            {/* Features Section */}
            <section className="home-features" id="features">
                <h2>What We Offer</h2>
                <div className="home-features-grid">
                    <div className="home-feature-card">
                        <img src={`${BACKEND_URL}/images/welcome/Institutions.png`} alt="Institutions" />
                        <h3>Institution Profiles</h3>
                        <p>Discover top universities and institutions in Sri Lanka with detailed profiles.</p>
                    </div>
                    <div className="home-feature-card">
                        <img src={`${BACKEND_URL}/images/welcome/Program.png`} alt="Programs" />
                        <h3>Program Listings</h3>
                        <p>Find programs tailored to your goals, including degrees, diplomas, and more.</p>
                    </div>
                    <div className="home-feature-card">
                        <img src={`${BACKEND_URL}/images/welcome/Search.png`} alt="Search" />
                        <h3>Search & Filter</h3>
                        <p>Easily search and filter programs by location, duration, or study mode.</p>
                    </div>
                    <div className="home-feature-card">
                        <img src={`${BACKEND_URL}/images/welcome/Apply.png`} alt="Apply" />
                        <h3>Course Applications</h3>
                        <p>Apply directly to your desired programs with just a few clicks and start your academic journey.</p>
                    </div>
                </div>
            </section>

            {/* About Section */}
            <section className="home-about" id="about">
                <h2>About {settings.site_name || 'UniAds'}</h2>
                {settings.about_text ? (
                    <p style={{ whiteSpace: 'pre-line' }}>{settings.about_text}</p>
                ) : (
                    <>
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
                    </>
                )}
                <h3>🌟 Our Vision</h3>
                <p>{settings.vision_text || ''}</p>
                <h3>🎯 Our Mission</h3>
                <p>{settings.mission_text || ''}</p>
            </section>

            {/* Testimonials Section */}
            {settings.show_testimonials && feedbacks.length > 0 && (
                <section className="home-testimonials" id="testimonials">
                    <div className="home-testimonials-container">
                        <h2>What Our Users Say</h2>
                        
                        <div className="testimonials-carousel-wrapper">
                            {feedbacks.length > cardsPerView && (
                                <button 
                                    className="carousel-control prev" 
                                    onClick={() => setTestimonialIndex(prev => prev > 0 ? prev - 1 : feedbacks.length - cardsPerView)}
                                >
                                    <ChevronLeft size={24} />
                                </button>
                            )}

                            <div className="testimonials-carousel-stage">
                                <motion.div 
                                    className="testimonials-carousel-track"
                                    animate={{ x: `-${testimonialIndex * (100 / cardsPerView)}%` }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                >
                                    {feedbacks.map((feedback) => (
                                        <div 
                                            key={feedback.id} 
                                            className="testimonial-card-wrapper"
                                            style={{ flex: `0 0 ${100 / cardsPerView}%` }}
                                        >
                                            <div className="testimonial-card">
                                                <div className="testimonial-quote-icon">
                                                    <Quote size={20} />
                                                </div>
                                                <div className="testimonial-header">
                                                    <img 
                                                        src={feedback.user?.profile_picture ? getStorageUrl(feedback.user.profile_picture) : `https://ui-avatars.com/api/?name=${encodeURIComponent(feedback.user?.name || 'U')}&background=random`} 
                                                        alt={feedback.user?.name} 
                                                        className="testimonial-avatar"
                                                    />
                                                    <div className="testimonial-info">
                                                        <h4>{feedback.user?.name}</h4>
                                                        <p>{feedback.role}</p>
                                                    </div>
                                                </div>
                                                <div className="testimonial-rating">
                                                    {[...Array(5)].map((_, i) => (
                                                        <i key={i} className={`fas fa-star ${i < feedback.rating ? 'active' : ''}`}></i>
                                                    ))}
                                                </div>
                                                <p className="testimonial-message">"{stripHtml(feedback.message)}"</p>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            </div>

                            {feedbacks.length > cardsPerView && (
                                <button 
                                    className="carousel-control next" 
                                    onClick={() => setTestimonialIndex(prev => {
                                        const maxIndex = feedbacks.length - cardsPerView;
                                        return prev < maxIndex ? prev + 1 : 0;
                                    })}
                                >
                                    <ChevronRight size={24} />
                                </button>
                            )}
                        </div>

                        {feedbacks.length > cardsPerView && (
                            <div className="carousel-dots">
                                {[...Array(feedbacks.length - cardsPerView + 1)].map((_, i) => (
                                    <button 
                                        key={i} 
                                        className={`dot ${i === testimonialIndex ? 'active' : ''}`}
                                        onClick={() => setTestimonialIndex(i)}
                                    ></button>
                                ))}
                            </div>
                        )}
                    </div>
                </section>
            )}

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
                                <div className="home-contact-item"><i className="fas fa-map-marker-alt"></i> {settings.address_text || 'Kandy, Sri Lanka'}</div>
                                <div className="home-contact-item"><i className="fas fa-envelope"></i> {settings.contact_email || ''}</div>
                                <div className="home-contact-item"><i className="fas fa-phone"></i> {settings.support_phone || ''}</div>
                            </div>

                            <div className="home-social-links">
                                {settings.social_links?.map((link, index) => (
                                    <a key={index} href={link.url} target="_blank" rel="noopener noreferrer" className="home-social-btn">
                                        <i className={getSocialIcon(link.platform)}></i>
                                    </a>
                                ))}
                            </div>
                        </div>

                        <form className="home-contact-form" onSubmit={handleContactSubmit}>
                            <h3>Send Us a Message</h3>
                            
                            {status.message && (
                                <div className={`status-message ${status.type}`}>
                                    {status.message}
                                </div>
                            )}

                            <div className="home-form-group">
                                <label>Name:</label>
                                <input 
                                    type="text" 
                                    placeholder="John Doe" 
                                    required 
                                    value={contactForm.name}
                                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="home-form-group">
                                <label>Email:</label>
                                <input 
                                    type="email" 
                                    placeholder="john@example.com" 
                                    required 
                                    value={contactForm.email}
                                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="home-form-group">
                                <label>Message:</label>
                                <textarea 
                                    rows="3" 
                                    placeholder="How can we help you?" 
                                    required
                                    value={contactForm.message}
                                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                    disabled={isSubmitting}
                                ></textarea>
                            </div>
                            <button type="submit" className="home-contact-btn" disabled={isSubmitting}>
                                {isSubmitting ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="home-footer">
                <div className="home-footer-container">
                    <div className="home-footer-brand">
                        <img src={settings.logo_url || "/images/logo.png"} alt={`${settings.site_name} Logo`} className="footer-logo-img" />
                        <p>{settings.tagline || 'Discover. Decide. Succeed.'}</p>
                    </div>
                    <div className="home-footer-links">
                        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
                        <a href="/terms-conditions" target="_blank" rel="noopener noreferrer">Terms & Conditions</a>
                        <a href="/refund-policy" target="_blank" rel="noopener noreferrer">Refund Policy</a>
                        <a href={`mailto:${settings.contact_email || 'support@uniads.com'}`}>Contact Us</a>
                    </div>
                    <div className="home-footer-social">
                        {settings.social_links?.map((link, index) => (
                            <a key={index} href={link.url} target="_blank" rel="noopener noreferrer">
                                <i className={getSocialIcon(link.platform)}></i>
                            </a>
                        ))}
                    </div>
                </div>
                <div className="home-footer-bottom">
                    <p>&copy; {new Date().getFullYear()} UniAds V1.0. All Rights Reserved.</p>
                </div>
            </footer>

            <AccessDeniedModal
                isOpen={modalConfig.isOpen}
                onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
                title={modalConfig.title}
                message={modalConfig.message}
            />
        </div>
    );
};

export default HomePage;
