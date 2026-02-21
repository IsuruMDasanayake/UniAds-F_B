import React, { useEffect, useState, useCallback } from 'react';
import axiosClient from '../../lib/axios';
import DataTable from '../../components/Analytics/DataTable';
import { BadgeCheck, Ban, Eye, Calendar, Image as ImageIcon, Heart, Users, Edit3, Trash2, Clock, MapPin, RefreshCw } from 'lucide-react';
import { getStorageUrl } from '../../lib/config';

// Modals
import EventDetailsModal from '../../components/Modals/EventDetailsModal';
import EditEventModal from '../../components/Modals/EditEventModal';
import DeleteConfirmModal from '../../components/Modals/DeleteConfirmModal';

// Components
import EventsStatCards from '../../components/Analytics/EventsStatCards';
import EventsTableCard from '../../components/Analytics/EventsTableCard';
import SkeletonTable from '../../components/Analytics/SkeletonTable';
import EmptyState from '../../components/Analytics/EmptyState';
import './EventsAnalyticsPage.css';

const EventsAnalyticsPage = () => {
    const [events, setEvents] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [sortConfig, setSortConfig] = useState({ key: '', direction: '' });
    const [pagination, setPagination] = useState({});

    // Modal States
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchEvents = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        else setIsUpdating(true);

        try {
            const { data } = await axiosClient.get(`/api/institute/analytics/events`, {
                params: {
                    page,
                    search,
                    status,
                    sort_by: sortConfig.key,
                    sort_order: sortConfig.direction
                }
            });
            setEvents(data.data);
            setStats(data.stats);
            setPagination({
                current_page: data.current_page,
                last_page: data.last_page,
                total: data.total,
            });
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
            setIsUpdating(false);
        }
    }, [page, search, status, sortConfig]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchEvents(!events.length);
        }, search ? 500 : 0);

        // Polling every 30 seconds
        const intervalId = setInterval(() => {
            fetchEvents(false);
        }, 30000);

        return () => {
            clearTimeout(timer);
            clearInterval(intervalId);
        };
    }, [search, page, status, sortConfig, fetchEvents, events.length === 0]);

    const handleToggleStatus = async (id, currentIsActive) => {
        // Optimistic update
        const updatedEvents = events.map(e =>
            e.id === id ? { ...e, is_active: !currentIsActive } : e
        );
        setEvents(updatedEvents);

        try {
            await axiosClient.patch(`/api/institute/events/${id}/status`);
        } catch (error) {
            console.error('Error toggling status:', error);
            fetchEvents(); // Revert on error
        }
    };

    const handleRowClick = (event) => {
        setSelectedEvent(event);
        setInfoModalOpen(true);
    };

    const handleEditClick = (e, event) => {
        e.stopPropagation();
        setSelectedEvent(event);
        setEditModalOpen(true);
    };

    const handleDeleteClick = (e, event) => {
        e.stopPropagation();
        setSelectedEvent(event);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedEvent) return;
        setIsDeleting(true);
        try {
            await axiosClient.delete(`/api/institute/analytics/events/${selectedEvent.id}`);
            setDeleteModalOpen(false);
            fetchEvents();
        } catch (error) {
            console.error('Error deleting event:', error);
            alert('Failed to delete event. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handleEventUpdated = (updatedEvent) => {
        setEvents(prev => prev.map(e => e.id === updatedEvent.id ? { ...e, ...updatedEvent } : e));
        fetchEvents(); // Refresh stats too
    };

    const columns = [
        {
            header: 'Event Information',
            accessor: 'event_title',
            render: (row) => (
                <div className="cell-content-wrapper">
                    <div className="event-thumbnail-wrapper">
                        {row.event_image ? (
                            <img
                                src={getStorageUrl(row.event_image)}
                                alt=""
                                className="event-thumbnail"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/default-event.jpg';
                                }}
                            />
                        ) : (
                            <div className="event-placeholder">
                                <ImageIcon size={20} />
                            </div>
                        )}
                        <div className="event-date-badge-v2">
                            <span className="day">{new Date(row.event_date).getDate()}</span>
                            <span className="month">{new Date(row.event_date).toLocaleString('default', { month: 'short' })}</span>
                        </div>
                    </div>
                    <div className="event-info-meta">
                        <span className="event-title" title={row.event_title}>{row.event_title}</span>
                        <span className="event-date">
                            <Clock size={12} />
                            {new Date(row.event_date).toLocaleDateString()}
                        </span>
                    </div>
                </div>
            )
        },
        {
            header: 'Views',
            accessor: 'view_count',
            render: (row) => (
                <div className="metric-cell">
                    <div className="metric-icon blue"><Eye size={14} /></div>
                    <span className="metric-value">{row.view_count || 0}</span>
                </div>
            )
        },
        {
            header: 'Interests',
            accessor: 'interested_count',
            render: (row) => (
                <div className="metric-cell">
                    <div className="metric-icon red"><Heart size={14} /></div>
                    <span className="metric-value">{row.interested_count || 0}</span>
                </div>
            )
        },
        {
            header: 'Declines',
            accessor: 'decline_count',
            render: (row) => (
                <div className="metric-cell">
                    <div className="metric-icon slate"><Users size={14} /></div>
                    <span className="metric-value">{row.decline_count || 0}</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'is_active',
            render: (row) => {
                const now = new Date();
                const eventDate = new Date(row.event_date);
                const isPast = eventDate < now;

                let label = row.is_active ? 'Active' : 'Deactive';
                let style = row.is_active ? 'active' : 'inactive';

                if (isPast) {
                    label = 'Expired';
                    style = 'expired';
                } else if (row.is_active) {
                    label = 'Upcoming';
                    style = 'upcoming';
                }

                return (
                    <span className={`status-badge-v2 ${style}`}>
                        <span className="dot"></span>
                        {label}
                    </span>
                );
            }
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="action-buttons-v2" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => handleToggleStatus(row.id, row.is_active)}
                        className={`action-btn-v2 ${row.is_active ? 'deactivate' : 'activate'}`}
                        title={row.is_active ? "Deactivate Event" : "Activate Event"}
                    >
                        {row.is_active ? <Ban size={18} /> : <BadgeCheck size={18} />}
                    </button>
                    <button
                        className="action-btn-v2 edit"
                        title="Edit Event"
                        onClick={(e) => handleEditClick(e, row)}
                    >
                        <Edit3 size={18} />
                    </button>
                    <button
                        className="action-btn-v2 delete"
                        title="Delete Event"
                        onClick={(e) => handleDeleteClick(e, row)}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div id="analytics-events-v2" className={isUpdating ? 'updating' : ''}>
            {/* Page Header */}
            <div className={`page-header-card-v2 ${isUpdating ? 'updating' : ''}`}>
                <div className="header-content-v2">
                    <div className="header-left-v2">
                        <h1 className="page-title-v2">Events Analytics</h1>
                        <p className="page-subtitle-v2">Monitor performance of your events across your institute.</p>
                    </div>
                </div>
            </div>

            {/* Stat Cards */}
            <EventsStatCards stats={stats} loading={loading} />

            {/* Main Table Card */}
            <EventsTableCard
                search={search}
                onSearchChange={(val) => { setSearch(val); setPage(1); }}
                status={status}
                onStatusChange={(val) => { setStatus(val); setPage(1); }}
                sortConfig={sortConfig}
                onSortChange={(val) => { setSortConfig(val); setPage(1); }}
                totalEvents={pagination.total || 0}
            >
                <div className="table-responsive-wrapper">
                    {loading ? (
                        <SkeletonTable rows={5} cols={6} />
                    ) : events.length > 0 ? (
                        <DataTable
                            columns={columns}
                            data={events}
                            pagination={pagination}
                            onPageChange={setPage}
                            loading={isUpdating}
                            showSearch={false}
                            onRowClick={handleRowClick}
                        />
                    ) : (
                        <EmptyState search={search} status={status} />
                    )}
                </div>
            </EventsTableCard>

            {/* Modal Components */}
            <EventDetailsModal
                isOpen={infoModalOpen}
                event={selectedEvent}
                onClose={() => setInfoModalOpen(false)}
            />

            <EditEventModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                event={selectedEvent}
                onUpdate={handleEventUpdated}
            />

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
                title={selectedEvent?.event_title}
            />
        </div>
    );
};

export default EventsAnalyticsPage;
