import React from 'react';
import { Repeat } from 'lucide-react';

const TrendsHeader = ({ range, setRange, compare, setCompare, loading }) => {
    const periods = [
        { value: '7', label: 'Last 7 Days' },
        { value: '30', label: 'Last 30 Days' },
        { value: '90', label: 'Last 90 Days' },
    ];

    return (
        <div className="trends-header-v2">
            <div className="header-text">
                <h1 className="trends-page-title-v2">Performance Trends</h1>
                <p className="trends-page-subtitle-v2">Visualize growth and engagement over time</p>
            </div>

            <div className="trends-controls-group-v2">
                <div className="analytics-period-filter-v2">
                    {periods.map(({ value, label }) => (
                        <button
                            key={value}
                            className={`period-btn-v2 ${range === value ? 'active' : ''}`}
                            onClick={() => setRange(value)}
                            disabled={loading}
                        >
                            {label}
                        </button>
                    ))}
                </div>


            </div>
        </div>
    );
};

export default TrendsHeader;
