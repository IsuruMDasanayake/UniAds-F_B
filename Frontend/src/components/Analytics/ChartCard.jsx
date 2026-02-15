import React from 'react';
import { motion } from 'framer-motion';
const ChartCard = ({ title, subtitle, children, loading, actions, className = "" }) => {
    if (loading) {
        return (
            <div className={`analytics-chart-card-v2 loading ${className}`}>
                <div className="card-header">
                    <div className="header-content">
                        <div className="skeleton-loader" style={{ width: '150px', height: '18px', marginBottom: '8px' }}></div>
                        <div className="skeleton-loader" style={{ width: '250px', height: '14px' }}></div>
                    </div>
                </div>
                <div className="card-body">
                    <div className="skeleton-loader" style={{ width: '100%', height: '280px', borderRadius: '12px' }}></div>
                </div>
            </div>
        );
    }

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
