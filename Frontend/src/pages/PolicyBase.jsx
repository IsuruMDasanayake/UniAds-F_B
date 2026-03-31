import React, { useEffect, useState } from 'react';
import axiosClient from '../lib/axios';
import './PolicyPages.css';

const PolicyBase = ({ title, type }) => {
    const [sections, setSections] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lastUpdated, setLastUpdated] = useState(null);

    useEffect(() => {
        const fetchPolicy = async () => {
            try {
                setLoading(true);
                const response = await axiosClient.get(`/api/policies/${type}`);
                const sections = response.data.data || [];
                setSections(sections);

                // Find most recent updated_at
                if (sections.length > 0) {
                    const latest = sections.reduce((prev, current) => {
                        return (new Date(prev.updated_at) > new Date(current.updated_at)) ? prev : current;
                    });
                    setLastUpdated(new Date(latest.updated_at).toLocaleDateString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric'
                    }));
                }
            } catch (error) {
                console.error(`Error fetching ${type} policy:`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchPolicy();
    }, [type]);

    if (loading) {
        return (
            <div className="policy-page-root">
                <div className="policy-loading">
                    <div className="ui-loader loader-blk">
                        <svg viewBox="22 22 44 44" className="multiColor-loader">
                            <circle cx="44" cy="44" r="20.2" fill="none" strokeWidth="3.6" className="loader-circle loader-circle-animation"></circle>
                        </svg>
                    </div>
                    <p>Loading Policies...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="policy-page-root">
            <div className="policy-page-layout">
                <aside className="policy-sidebar">
                    <h2>Table of Content</h2>
                    <ul>
                        {sections.map(section => (
                            <li key={section.id}>
                                <a href={`#section-${section.id}`}>{section.title}</a>
                            </li>
                        ))}
                    </ul>
                </aside>

                <main className="policy-content">
                    {lastUpdated && <span className="last-updated">Last Updated: {lastUpdated}</span>}
                    <h1>{title}</h1>

                    {sections.length === 0 ? (
                        <p className="text-center">No policy content available yet.</p>
                    ) : (
                        sections.map(section => (
                            <section key={section.id} id={`section-${section.id}`} className="policy-section">
                                <h2>{section.title}</h2>
                                <p>{section.content}</p>
                            </section>
                        ))
                    )}
                </main>
            </div>
        </div>
    );
};

export default PolicyBase;
