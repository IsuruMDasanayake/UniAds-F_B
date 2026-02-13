import React from 'react';
import { Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

const TrendsInsights = ({ insights, style, loading = false }) => {
    if (loading || !insights) {
        return (
            <div className="trends-insights-box loading" style={style}>
                <div className="insights-header">
                    <div className="skeleton-loader" style={{ width: '20px', height: '20px', borderRadius: '50%' }}></div>
                    <div className="skeleton-loader" style={{ width: '120px', height: '18px', marginLeft: '12px' }}></div>
                </div>
                <ul className="insights-list">
                    {[...Array(2)].map((_, i) => (
                        <li key={i} className="insight-item">
                            <div className="skeleton-loader" style={{ width: '100%', height: '14px' }}></div>
                        </li>
                    ))}
                </ul>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="trends-insights-box"
            style={style}
        >
            <div className="insights-header">
                <div className="icon-wrapper">
                    <Lightbulb size={20} className="text-yellow-500" />
                </div>
                <h3>Trend Insights</h3>
            </div>
            <ul className="insights-list">
                {insights.map((insight, index) => (
                    <li key={index} className="insight-item">
                        {insight}
                    </li>
                ))}
            </ul>
        </motion.div>
    );
};

export default TrendsInsights;
