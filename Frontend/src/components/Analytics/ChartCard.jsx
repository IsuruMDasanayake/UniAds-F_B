import React from 'react';
import { motion } from 'framer-motion';
const ChartCard = ({ title, subtitle, children, loading, actions, className = "" }) => {
    if (loading) return <div className="skeleton-loader" style={{ height: '350px' }}></div>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`analytics-chart-card-v2 ${className}`}
        >
            <div className="card-header">
                <div className="header-content">
                    <h3 className="card-title">{title}</h3>
                    {subtitle && <p className="card-subtitle">{subtitle}</p>}
                </div>
                {actions && <div className="header-actions">{actions}</div>}
            </div>
            <div className="card-body">
                {children}
            </div>
        </motion.div>
    );
};

export default ChartCard;
