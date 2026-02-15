import React from 'react';
import StatCard from './StatCard';
import { Star, MessageSquare, Flag, User } from 'lucide-react';

const RatingsStatCards = ({ stats, loading }) => {
    return (
        <div className="stat-cards-row-v2">
            <StatCard
                icon={Star}
                label="Average Rating"
                value={stats?.avg_rating || 0}
                color="yellow"
                loading={loading}
                isFullWidth={false}
            />
            <StatCard
                icon={User}
                label="Total Reviews"
                value={stats?.total_reviews || 0}
                color="blue"
                loading={loading}
                isFullWidth={false}
            />
            <StatCard
                icon={Flag}
                label="Reported Reviews"
                value={stats?.reported_count || 0}
                color="red"
                loading={loading}
                isFullWidth={false}
            />
            <StatCard
                icon={MessageSquare}
                label="Reviews with Comments"
                value={stats?.commented_count || 0}
                color="green"
                loading={loading}
                isFullWidth={false}
            />
        </div>
    );
};

export default RatingsStatCards;
