import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatCard.css';

const StatCard = ({ icon: Icon, label, value, change, color = 'blue', delay = 0, loading = false }) => {
    if (loading) {
        return (
            <div className={`analytics-stat-card-component loading ${color}`}>
                <div className={`stat-icon-wrapper skeleton-loader ${color}`} style={{ width: '48px', height: '48px', borderRadius: '12px' }}></div>
                <div className="stat-content">
                    <div className="skeleton-loader" style={{ width: '80px', height: '14px', marginBottom: '8px' }}></div>
                    <div className="skeleton-loader" style={{ width: '120px', height: '24px' }}></div>
                </div>
            </div>
        );
    }

    const hasChange = change !== undefined && change !== null;
    const isPositive = change >= 0;
    const isNeutral = change === 0;

    const formatValue = (val) => {
        if (typeof val === 'number') {
            return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(val);
        }
        if (typeof val === 'string' && !isNaN(val) && val.trim() !== '') {
            return new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 }).format(Number(val));
        }
        return val;
    };

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
                <h3 className="stat-value">{formatValue(value)}</h3>
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
