import React from 'react';
import './PeriodFilter.css';

const PeriodFilter = ({ period, setPeriod, size = 'medium' }) => {
    const periods = [
        { value: 7, label: 'Last 7 Days' },
        { value: 30, label: 'Last 30 Days' },
        { value: 90, label: 'Last 90 Days' },
    ];

    return (
        <div className={`analytics-period-filter ${size}`}>
            {periods.map(({ value, label }) => (
                <button
                    key={value}
                    className={`period-btn ${period === value ? 'active' : ''}`}
                    onClick={() => setPeriod(value)}
                >
                    <span className="last-word">Last </span>
                    {label.replace('Last ', '')}
                </button>
            ))}
        </div>
    );
};

export default PeriodFilter;
