import React from 'react';
import { motion } from 'framer-motion';
import { FileSearch } from 'lucide-react';

const EmptyState = ({ search, status }) => {
    return (
        <motion.div
            className="empty-state-wrapper"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
        >
            <div className="empty-state-icon">
                <FileSearch size={48} />
            </div>
            <h3 className="empty-state-title">No posts found</h3>
            <p className="empty-state-subtitle">
                {search
                    ? `We couldn't find any posts matching "${search}"`
                    : status !== 'all'
                        ? `You don't have any ${status} posts at the moment.`
                        : "Start creating course posts to track their performance here."
                }
            </p>
            {!search && status === 'all' && (
                <p className="empty-state-hint">
                    Create your first course post to start tracking analytics.
                </p>
            )}
        </motion.div>
    );
};

export default EmptyState;
