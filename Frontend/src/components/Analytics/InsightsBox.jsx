import React from 'react';
import { Lightbulb } from 'lucide-react';
import './InsightsBox.css';

const InsightsBox = ({ insights }) => {
    if (!insights || insights.length === 0) return null;

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
