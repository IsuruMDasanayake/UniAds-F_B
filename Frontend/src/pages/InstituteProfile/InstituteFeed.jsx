import React from 'react';
import InstituteGallery from './InstituteGallery';
import InstitutePosts from './InstitutePosts';
import InstituteEvents from './InstituteEvents';
import './InstituteFeed.css';

const InstituteFeed = ({ institute, isOwner, posts, events, gallery, onGalleryUpdate, onEventsUpdate, onPostUpdate, user }) => {
    return (
        <div className="institute-feed-layout">
            <div className="feed-grid">
                {/* Left Sidebar - Gallery */}
                <div className="left-sidebar">
                    <InstituteGallery
                        institute={institute}
                        gallery={gallery}
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
        </div>
    );
};

export default InstituteFeed;
