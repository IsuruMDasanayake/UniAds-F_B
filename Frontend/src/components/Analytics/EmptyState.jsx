import React from 'react';
import { motion } from 'framer-motion';
import { FileSearch } from 'lucide-react';

const EmptyState = ({
    search,
    status,
    icon: Icon = FileSearch,
    title = "No results found",
    subtitle: customSubtitle,
    type = "items"
}) => {
    return (
        <motion.div
            className="empty-state-wrapper"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="empty-state-icon">
                <Icon size={48} />
            </div>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-subtitle">
                {customSubtitle || (search
                    ? `We couldn't find any ${type} matching "${search}"`
                    : status !== 'all'
                        ? `You don't have any ${status} ${type} at the moment.`
                        : `Start tracking your ${type} performance here.`
                )}
            </p>
        </motion.div>
    );
};

export default EmptyState;
