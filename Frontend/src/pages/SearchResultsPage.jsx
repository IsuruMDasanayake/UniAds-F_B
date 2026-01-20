import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, BookOpen, Building2, Calendar, MapPin, Loader2, Star, ChevronRight } from 'lucide-react';
import axiosClient from '../lib/axios';
import { getStorageUrl } from '../lib/config';
import Navbar from '../components/Navbar';
import './SearchResultsPage.css';

function SearchResultsPage() {
    const [searchParams] = useSearchParams();
    const query = searchParams.get('query') || '';
    const [user, setUser] = useState(null);
    const [results, setResults] = useState({ posts: [], institutes: [], events: [] });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchResults = async () => {
            setLoading(true);
            try {
                const [userRes, searchRes] = await Promise.all([
                    axiosClient.get('/api/user'),
                    axiosClient.get(`/api/search?query=${query}`)
                ]);
                setUser(userRes.data);
                setResults(searchRes.data);
            } catch (error) {
                console.error('Error fetching search results:', error);
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            fetchResults();
        } else {
            setLoading(false);
        }
    }, [query]);

    const hasResults = results.posts.length > 0 || results.institutes.length > 0 || results.events.length > 0;

    return (
        <div className="search-results-page">
            <Navbar user={user} />

            <main className="results-container">
                <header className="search-header">
                    {query ? (
                        <>
                            <h1>Search Results</h1>
                            <p>Showing findings for "<span className="query-highlight">{query}</span>"</p>
                        </>
                    ) : (
                        <h1>Global Search</h1>
                    )}
                </header>

                {loading ? (
                    <div className="search-loading">
                        <div className="ui-loader loader-blk">
                            <svg viewBox="22 22 44 44" className="multiColor-loader">
                                <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation"></circle>
                            </svg>
                        </div>
                        <p>Finding the best results for you...</p>
                    </div>
                ) : !hasResults ? (
                    <div className="empty-results">
                        <Search size={64} style={{ color: '#e2e8f0' }} />
                        <h3>No results found</h3>
                        <p>Try searching for something else, like "Business", "Computing", or "IIT".</p>
                    </div>
                ) : (
                    <div className="results-sections">
                        {/* Courses Section */}
                        {results.posts.length > 0 && (
                            <section className="section-group">
                                <div className="section-title">
                                    <BookOpen size={24} />
                                    <h2>Courses & Programs</h2>
                                </div>
                                <div className="results-grid">
                                    {results.posts.map(post => (
                                        <div key={post.id} className="result-card">
                                            <div className="card-image-box">
                                                <img src={post.image ? getStorageUrl(post.image) : '/images/course-default.png'} alt={post.title} />
                                            </div>
                                            <div className="card-content">
                                                <h3>{post.title}</h3>
                                                <div className="card-meta">
                                                    <span><Building2 size={14} /> {post.institute?.institute_name}</span>
                                                    <span><MapPin size={14} /> {post.location}</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Institutes Section */}
                        {results.institutes.length > 0 && (
                            <section className="section-group">
                                <div className="section-title">
                                    <Building2 size={24} />
                                    <h2>Educational Institutes</h2>
                                </div>
                                <div className="results-grid">
                                    {results.institutes.map(inst => (
                                        <div key={inst.id} className="result-card institute-card">
                                            <div className="inst-logo-box">
                                                <img src={inst.profile_photo ? getStorageUrl(inst.profile_photo) : '/images/default-logo.png'} alt={inst.institute_name} />
                                            </div>
                                            <h3 className="inst-name">{inst.institute_name}</h3>
                                            <p className="inst-location">{inst.location || 'Education Institute'}</p>
                                            <Link to={`/institutions`} className="view-inst-btn">
                                                View Profile
                                            </Link>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Events Section */}
                        {results.events.length > 0 && (
                            <section className="section-group">
                                <div className="section-title">
                                    <Calendar size={24} />
                                    <h2>Upcoming Events</h2>
                                </div>
                                <div className="results-grid">
                                    {results.events.map(event => (
                                        <div key={event.id} className="result-card">
                                            <div className="card-image-box">
                                                <img src={event.event_banner ? getStorageUrl(event.event_banner) : '/images/event-default.png'} alt={event.event_title} />
                                            </div>
                                            <div className="card-content">
                                                <h3>{event.event_title}</h3>
                                                <div className="card-meta">
                                                    <span><Star size={14} /> {event.interested_count} Interested</span>
                                                    <span><ChevronRight size={14} /> View Details</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}

export default SearchResultsPage;
