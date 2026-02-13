import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatCard.css';

const StatCard = ({ icon: Icon, label, value, change, color = 'blue', delay = 0 }) => {
    const hasChange = change !== undefined && change !== null;
    const isPositive = change >= 0;
    const isNeutral = change === 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay }}
            className={`analytics-stat-card-component ${color}`}
        >
            <div className={`stat-icon-wrapper`}>
                <Icon size={24} />
            </div>
            <div className="stat-content">
                <p className="stat-label">{label}</p>
                <h3 className="stat-value">{value}</h3>
                {hasChange && !isNeutral && (
                    <div className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
                        {isPositive ? (
                            <TrendingUp size={14} />
                        ) : (
                            <TrendingDown size={14} />
                        )}
                        <span>{Math.abs(change)}%</span>
                    </div>
                )}
                {hasChange && isNeutral && (
                    <div className="stat-change neutral">
                        <span>No change</span>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default StatCard;
