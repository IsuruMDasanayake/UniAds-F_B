import React from 'react';
import { Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

const TrendsInsights = ({ insights, style }) => {
    if (!insights || insights.length === 0) return null;

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
