import React from 'react';
import { Calendar, Heart, Eye, Users, Clock, History } from 'lucide-react';
import StatCard from './StatCard';

const EventsStatCards = ({ stats, loading }) => {
    const cards = [
        {
            label: "Total Events",
            value: stats?.total_events || 0,
            icon: Calendar,
            color: "blue"
        },
        {
            label: "Interests / Likes",
            value: stats?.total_interests || 0,
            icon: Heart,
            color: "red"
        },
        {
            label: "Total Views",
            value: stats?.total_views || 0,
            icon: Eye,
            color: "purple"
        },
        {
            label: "Decline Count",
            value: stats?.total_declines || 0,
            icon: Users,
            color: "slate"
        },
        {
            label: "Upcoming Events",
            value: stats?.upcoming_events || 0,
            icon: Clock,
            color: "green"
        },
        {
            label: "Past Events",
            value: stats?.past_events || 0,
            icon: History,
            color: "amber"
        }
    ];

    return (
        <div className="stat-cards-row-v2" style={{ marginBottom: '2.5rem' }}>
            {cards.map((card, index) => (
                <StatCard
                    key={index}
                    icon={card.icon}
                    label={card.label}
                    value={card.value}
                    color={card.color}
                    change={null}
                    loading={loading}
                />
            ))}
        </div>
    );
};

export default EventsStatCards;
