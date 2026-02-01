import React, { useState, useEffect } from 'react';
import {
    Search,
    Trash2,
    Calendar,
    MapPin,
    Eye,
    EyeOff,
    Building2,
    Clock
} from 'lucide-react';
import axiosClient from '../../lib/axios';
import './EventManagement.css';

const EventManagement = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchEvents();
    }, []);

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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this event?')) {
            try {
                await axiosClient.delete(`/api/admin/events/${id}`);
                setEvents(events.filter(e => e.id !== id));
            } catch (error) {
                console.error('Error deleting event:', error);
            }
        }
    };

    const filteredEvents = events.filter(event =>
        (event.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (event.institute?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

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
                </div>

                <div className="responsive-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Event Info</th>
                                <th>Organizer</th>
                                <th>Date</th>
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
                                    <tr key={event.id}>
                                        <td>
                                            <div className="event-cell">
                                                <div className="event-icon-box">
                                                    <Calendar size={18} />
                                                </div>
                                                <div className="event-meta">
                                                    <span className="event-title-text">{event.title}</span>
                                                    <span className="event-loc-text">
                                                        <MapPin size={12} /> {event.location || 'Online'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="inst-cell">
                                                <Building2 size={14} className="text-muted" />
                                                <span>{event.institute?.name || 'Admin'}</span>
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
                                            <span className={`status-pill ${event.is_active ? 'active' : 'inactive'}`}>
                                                {event.is_active ? 'Visible' : 'Hidden'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    className={`action-btn-sm ${event.is_active ? 'deactivate' : 'activate'}`}
                                                    title={event.is_active ? 'Hide Event' : 'Show Event'}
                                                    onClick={() => handleToggleStatus(event.id)}
                                                >
                                                    {event.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                                <button
                                                    className="action-btn-sm delete"
                                                    title="Delete Event"
                                                    onClick={() => handleDelete(event.id)}
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
        </div>
    );
};

export default EventManagement;
