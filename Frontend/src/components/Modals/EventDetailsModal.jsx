import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, MapPin, Users } from 'lucide-react';
import axiosClient from '../../lib/axios';
import { getStorageUrl } from '../../lib/config';

// Ensure the CSS file that contains .modern-modal-overlay etc is imported.
// It seems to be in EventsPage.css or InstituteModals.css. 
// Ideally should be in a shared CSS, but for now we rely on parent importing it or import it here if needed.
// Importing InstituteModals.css as it was updated with these styles.
// Importing the dedicated CSS file to prevent conflicts
import './EventDetailsModal.css';

const EventDetailsModal = ({ isOpen, event, onClose, onInterestToggle }) => {

    React.useEffect(() => {
        if (isOpen && event?.id) {
            axiosClient.post(`/api/events/${event.id}/track-view`).catch(err => {
                console.error("Failed to track event view:", err?.message || err);
            });
        }
    }, [isOpen, event?.id]);

    // Internal helper for date formatting to match EventsPage logic
    const formatDate = (dateString) => {
        if (!dateString) return '';
        const d = new Date(dateString);
        return d.toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
        });
    };

    // Using createPortal to ensure z-index correctness as previously established
    return createPortal(
        <AnimatePresence>
            {isOpen && event && (
                <motion.div
                    className="modern-modal-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="modern-modal-window"
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button className="modal-close-trigger" onClick={onClose}>
                            <X size={24} />
                        </button>

                        <div className="modal-content-grid">
                            <div className="modal-media-side">
                                <img
                                    src={event.event_image ? getStorageUrl(event.event_image) : 'https://via.placeholder.com/600x400?text=No+Image'}
                                    alt={event.event_title}
                                />
                                <div className="modal-media-overlay">
                                    <div className="event-meta-pill">
                                        <Calendar size={18} />
                                        <span>{formatDate(event.event_date)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="modal-info-side">
                                <div className="modal-header-details">
                                    <h2>{event.event_title}</h2>
                                </div>

                                <div className="modal-location-strip">
                                    <MapPin size={20} />
                                    <div>
                                        <strong>{event.main_location || 'Campus Location'}</strong>
                                        <span>{event.sub_location || 'Event Hall'}</span>
                                    </div>
                                </div>

                                <div className="modal-body-text">
                                    <h4>About the Event</h4>
                                    <p>{event.event_description || 'Detailed description coming soon.'}</p>
                                </div>

                                <div className="modal-sticky-footer">
                                    <div className="attendee-count">
                                        <Users size={20} />
                                        <span><strong>{event.interested_count || 0}</strong> people are interested</span>
                                    </div>

                                    {/* Only show interest button if handler is provided (e.g. for students) */}
                                    {/* {onInterestToggle && (
                                        <button
                                            className={`modal-action-btn ${event.is_interested ? 'active' : ''}`}
                                            onClick={() => onInterestToggle(event.id)}
                                        >
                                            {event.is_interested ? 'Interested (Leave?)' : 'I am Interested'}
                                        </button>
                                    )} */}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>,
        document.body
    );
};

export default EventDetailsModal;
