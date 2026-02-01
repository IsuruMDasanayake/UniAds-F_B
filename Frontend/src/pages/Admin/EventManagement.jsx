import React, { useState, useEffect } from 'react';
import {
    Search,
    Trash2,
    Calendar,
    MapPin,
    Eye,
    EyeOff,
    Building2,
    Clock,
    Filter,
    X,
    MessageSquare,
    Heart,
    ThumbsDown,
    FileText,
    Activity
} from 'lucide-react';
import axiosClient from '../../lib/axios';
import ActionConfirmModal from '../../components/Modals/ActionConfirmModal';
import './EventManagement.css';

const EventManagement = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [institutes, setInstitutes] = useState([]);
    const [selectedInstitute, setSelectedInstitute] = useState('');
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '' });
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const API_BASE_URL = 'http://localhost:8000';

    useEffect(() => {
        fetchEvents();
        fetchInstitutes();
    }, []);

    const fetchInstitutes = async () => {
        try {
            const response = await axiosClient.get('/api/institutions');
            setInstitutes(response.data);
        } catch (error) {
            console.error('Error fetching institutes:', error);
        }
    };

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/api/admin/events');
            setEvents(response.data);
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const resp = await axiosClient.post(`/api/admin/events/${id}/toggle-status`);
            setEvents(events.map(e =>
                e.id === id ? { ...e, is_active: resp.data.is_active } : e
            ));
        } catch (error) {
            console.error('Error toggling event status:', error);
        }
    };

    const handleDeleteClick = (event) => {
        setDeleteModal({
            isOpen: true,
            id: event.id,
            title: event.event_title
        });
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        setIsDeleting(true);
        try {
            await axiosClient.delete(`/api/admin/events/${deleteModal.id}`);
            setEvents(events.filter(e => e.id !== deleteModal.id));
            setDeleteModal({ isOpen: false, id: null, title: '' });
        } catch (error) {
            console.error('Error deleting event:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const openDetails = (event) => {
        setSelectedEvent(event);
        setShowDetailsModal(true);
    };

    const filteredEvents = events.filter(event => {
        const matchesSearch = (event.event_title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (event.institute?.institute_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesInstitute = selectedInstitute === '' || event.institute_id === parseInt(selectedInstitute);

        return matchesSearch && matchesInstitute;
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    return (
        <div className="event-management-page admin-event-scope">
            <div className="page-header mb-8">
                <div className="header-text">
                    <h1 className="text-2xl font-bold">Event Management</h1>
                    <p className="text-muted">Monitor and moderate upcoming institutional events</p>
                </div>
            </div>

            <div className="admin-glass-card table-container">
                <div className="table-controls p-6">
                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search events or organizers..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-box">
                        <Filter size={18} className="filter-icon" />
                        <select
                            className="admin-select"
                            value={selectedInstitute}
                            onChange={(e) => setSelectedInstitute(e.target.value)}
                        >
                            <option value="">All Institutes</option>
                            {institutes.map(inst => (
                                <option key={inst.id} value={inst.id}>
                                    {inst.institute_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="responsive-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Event Info</th>
                                <th>Organizer</th>
                                <th>Date</th>
                                <th className="text-center">Metrics</th>
                                <th>Status</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center p-12">
                                        <div className="loader mx-auto mb-4"></div>
                                        <p className="text-muted">Loading events...</p>
                                    </td>
                                </tr>
                            ) : filteredEvents.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center p-12">
                                        <p className="text-muted">No events found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredEvents.map((event) => (
                                    <tr key={event.id} onClick={() => openDetails(event)} style={{ cursor: 'pointer' }}>
                                        <td>
                                            <div className="event-cell">
                                                <div className="event-img-box">
                                                    {event.event_image ? (
                                                        <img
                                                            src={`${API_BASE_URL}/storage/${event.event_image}`}
                                                            alt={event.event_title}
                                                            className="event-table-img"
                                                        />
                                                    ) : (
                                                        <div className="event-image-placeholder">
                                                            <Calendar size={18} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="event-meta">
                                                    <span className="event-title-text">{event.event_title}</span>
                                                    <span className="event-loc-text">
                                                        <MapPin size={12} /> {event.main_location}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="inst-cell">
                                                <Building2 size={14} className="text-muted" />
                                                <span>{event.institute?.institute_name || (event.institute_id ? `Unknown ID: ${event.institute_id}` : 'Admin')}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="date-cell">
                                                <span className="event-time-text">
                                                    <Clock size={12} /> {new Date(event.event_date).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="metrics-cell">
                                                <div className="metric-item" title="Views">
                                                    <Eye size={14} />
                                                    <span>{event.view_count || 0}</span>
                                                </div>
                                                <div className="metric-item" title="Interests">
                                                    <Heart size={14} />
                                                    <span>{event.interested_count || 0}</span>
                                                </div>
                                                <div className="metric-item" title="Declines">
                                                    <ThumbsDown size={14} />
                                                    <span>{event.decline_count || 0}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="status-cell">
                                                {(() => {
                                                    const isExpired = new Date(event.event_date) < new Date().setHours(0, 0, 0, 0);
                                                    if (!event.is_active) {
                                                        return <span className="status-pill inactive">Hidden</span>;
                                                    }
                                                    return isExpired ?
                                                        <span className="status-pill expired">Expired</span> :
                                                        <span className="status-pill active">Visible</span>;
                                                })()}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    className={`action-btn-sm ${event.is_active ? 'activate' : 'deactivate'}`}
                                                    title={event.is_active ? 'Hide Event' : 'Show Event'}
                                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(event.id); }}
                                                >
                                                    {event.is_active ? <Eye size={16} /> : <EyeOff size={16} />}
                                                </button>
                                                <button
                                                    className="action-btn-sm delete"
                                                    title="Delete Event"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(event); }}
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedEvent && (
                <div className="modal-overlay event-details-modal" onClick={() => setShowDetailsModal(false)}>
                    <div className="modal-content glass-effect" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="text-xl font-bold">Event Details</h2>
                            <button className="close-btn" onClick={() => setShowDetailsModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body p-6">
                            <div className="event-details-grid">
                                <div className="event-details-image">
                                    {selectedEvent.event_image ? (
                                        <img
                                            src={`${API_BASE_URL}/storage/${selectedEvent.event_image}`}
                                            alt={selectedEvent.event_title}
                                        />
                                    ) : (
                                        <div className="image-placeholder">No Image Available</div>
                                    )}
                                </div>
                                <div className="event-details-info">
                                    <h3 className="event-title text-2xl font-bold mb-4">{selectedEvent.event_title}</h3>

                                    <div className="info-row">
                                        <Building2 size={18} />
                                        <span>{selectedEvent.institute?.institute_name || (selectedEvent.institute_id ? `Unknown ID: ${selectedEvent.institute_id}` : 'Admin')}</span>
                                    </div>

                                    <div className="info-row">
                                        <Calendar size={18} />
                                        <span>{new Date(selectedEvent.event_date).toLocaleDateString()}</span>
                                    </div>

                                    <div className="info-row">
                                        <MapPin size={18} />
                                        <span>{selectedEvent.main_location} </span>
                                    </div>
                                    <div className="info-row">
                                        <Activity size={18} />
                                        <span className={`status-pill ${selectedEvent.is_active ? 'active' : 'inactive'}`}>
                                            {selectedEvent.is_active ? 'Visible' : 'Expired'}
                                        </span>
                                    </div>


                                    <div className="event-metrics-summary mt-6">
                                        <div className="metric">
                                            <Eye size={18} />
                                            <span>{selectedEvent.view_count || 0} Views</span>
                                        </div>
                                        <div className="metric">
                                            <Heart size={18} />
                                            <span>{selectedEvent.interested_count || 0} Interests</span>
                                        </div>
                                        <div className="metric">
                                            <ThumbsDown size={18} />
                                            <span>{selectedEvent.decline_count || 0} Declines</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="event-description-section mt-8">
                                <span className="section-label">Description</span>
                                <div className="description-content pre-wrap">
                                    {selectedEvent.event_description}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ActionConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, title: '' })}
                onConfirm={confirmDelete}
                title="Delete Event"
                message={`Are you sure you want to delete "${deleteModal.title}"? This action cannot be undone.`}
                isLoading={isDeleting}
                type="danger"
            />
        </div>
    );
};

export default EventManagement;
