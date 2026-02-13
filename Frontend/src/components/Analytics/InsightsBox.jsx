import React from 'react';
import { Lightbulb } from 'lucide-react';
import './InsightsBox.css';

const InsightsBox = ({ insights, loading = false }) => {
    if (loading || !insights) {
        return (
            <div className="analytics-insights-box loading">
                <div className="insights-header">
                    <div className="skeleton-loader" style={{ width: '24px', height: '24px', borderRadius: '50%' }}></div>
                    <div className="skeleton-loader" style={{ width: '180px', height: '18px', marginLeft: '12px' }}></div>
                </div>
                <ul className="insights-list">
                    {[...Array(3)].map((_, i) => (
                        <li key={i} className="insight-item">
                            <div className="skeleton-loader" style={{ width: '100%', height: '14px' }}></div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <div className="analytics-insights-box">
            <div className="insights-header">
                <Lightbulb size={24} />
                <h3 className="insights-title">Performance Insights</h3>
            </div>
            <ul className="insights-list">
                {insights.map((insight, index) => (
                    <li key={index} className="insight-item">
                        {insight}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default InsightsBox;
