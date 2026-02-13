import React from 'react';
import { Percent, BookX, Calendar } from 'lucide-react';
import './ConversionMetrics.css';

const ConversionMetrics = ({ conversion, contentHealth, loading = false }) => {
    if (loading || !conversion || !contentHealth) {
        return (
            <div className="analytics-conversion-metrics loading">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="conversion-card skeleton-card">
                        <div className="conversion-icon skeleton-loader" style={{ width: '40px', height: '40px', borderRadius: '10px' }}></div>
                        <div className="conversion-content">
                            <div className="skeleton-loader" style={{ width: '80px', height: '12px', marginBottom: '8px' }}></div>
                            <div className="skeleton-loader" style={{ width: '100px', height: '20px', marginBottom: '4px' }}></div>
                            <div className="skeleton-loader" style={{ width: '120px', height: '12px' }}></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    const metrics = [
        {
            icon: Percent,
            label: 'Conversion Rate',
            value: `${conversion.conversion_rate}%`,
            color: 'blue',
            subtitle: 'Applications / Views'
        },
        {
            icon: BookX,
            label: 'Inactive Courses',
            value: contentHealth.inactive_courses,
            color: contentHealth.inactive_courses > 0 ? 'red' : 'green',
            subtitle: `${contentHealth.active_courses} active`
        },
        {
            icon: Calendar,
            label: 'Upcoming Events',
            value: contentHealth.upcoming_events,
            color: contentHealth.upcoming_events > 0 ? 'green' : 'yellow',
            subtitle: `${contentHealth.expired_events} expired`
        },
    ];

    return (
        <div className="analytics-conversion-metrics">
            {metrics.map((metric, index) => (
                <div key={index} className={`conversion-card ${metric.color}`}>
                    <div className="conversion-icon">
                        <metric.icon size={20} />
                    </div>
                    <div className="conversion-content">
                        <p className="conversion-label">{metric.label}</p>
                        <h4 className="conversion-value">{metric.value}</h4>
                        <p className="conversion-subtitle">{metric.subtitle}</p>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ConversionMetrics;
