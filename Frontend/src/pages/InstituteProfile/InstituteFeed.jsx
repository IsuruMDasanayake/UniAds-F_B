import React from 'react';
import InstituteGallery from './InstituteGallery';
import InstitutePosts from './InstitutePosts';
import InstituteEvents from './InstituteEvents';
import { motion } from 'framer-motion';
import './InstituteFeed.css';

const InstituteFeed = ({ institute, isOwner, posts, events, onGalleryUpdate, onEventsUpdate, onPostUpdate, user }) => {
    return (
        <motion.div 
            className="institute-feed-layout"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
        >
            <div className="feed-grid">
                {/* Left Sidebar - Gallery */}
                <div className="left-sidebar">
                    <InstituteGallery
                        institute={institute}
                        isOwner={isOwner}
                        onGalleryUpdate={onGalleryUpdate}
                    />
                </div>

                {/* Center - Posts */}
                <div className="center-content">
                    <InstitutePosts
                        posts={posts}
                        institute={institute}
                        isOwner={isOwner}
                        user={user}
                        onPostUpdate={onPostUpdate}
                    />
                </div>

                {/* Right Sidebar - Events */}
                <div className="right-sidebar">
                    <InstituteEvents
                        events={events}
                        institute={institute}
                        isOwner={isOwner}
                        onEventsUpdate={onEventsUpdate}
                        isSidebar={true}
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default InstituteFeed;
