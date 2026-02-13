import React from 'react';
import { FileText, BadgeCheck, Eye, Briefcase } from 'lucide-react';
import StatCard from './StatCard';

const PostsStatCards = ({ stats, loading }) => {
    const cards = [
        {
            label: "Total Posts",
            value: stats?.total_posts || 0,
            icon: FileText,
            color: "blue"
        },
        {
            label: "Active Posts",
            value: stats?.active_posts || 0,
            icon: BadgeCheck,
            color: "green"
        },
        {
            label: "Total Views",
            value: stats?.total_views || 0,
            icon: Eye,
            color: "purple"
        },
        {
            label: "Total Applications",
            value: stats?.total_applications || 0,
            icon: Briefcase,
            color: "amber"
        }
    ];

    return (
        <div className="stat-cards-row-v2" style={{ marginBottom: '2.5rem' }}>
            {cards.map((card, index) => (
                loading ? (
                    <div key={index} className="skeleton-loader" style={{ height: '120px' }}></div>
                ) : (
                    <StatCard
                        key={index}
                        icon={card.icon}
                        label={card.label}
                        value={card.value}
                        color={card.color}
                        change={null} // No time-series comparison for specific posts yet
                    />
                )
            ))}
        </div>
    );
};

export default PostsStatCards;
