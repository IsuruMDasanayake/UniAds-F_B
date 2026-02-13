import React, { useEffect, useState } from 'react';
import axiosClient from '../../lib/axios';
import DataTable from '../../components/Analytics/DataTable';
import { BadgeCheck, Ban, Eye, Calendar, Image as ImageIcon } from 'lucide-react';
import { getStorageUrl } from '../../lib/config';
import './EventsAnalyticsPage.css';

const EventsAnalyticsPage = () => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({});

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchEvents();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, page]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const { data } = await axiosClient.get(`/api/institute/analytics/events?page=${page}&search=${search}`);
            setEvents(data.data);
            setPagination({
                current_page: data.current_page,
                last_page: data.last_page,
                from: data.from,
                to: data.to,
                total: data.total,
                prev_page_url: data.prev_page_url,
                next_page_url: data.next_page_url,
            });
        } catch (error) {
            console.error('Error fetching events:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id, currentStatus) => {
        const updatedEvents = events.map(e =>
            e.id === id ? { ...e, status: currentStatus === 'active' ? 'cancelled' : 'active' } : e
        );
        setEvents(updatedEvents);

        try {
            await axiosClient.patch(`/api/institute/events/${id}/status`);
        } catch (error) {
            console.error('Error toggling status:', error);
            fetchEvents();
        }
    };

    const columns = [
        {
            header: 'Event Name',
            accessor: 'title',
            render: (row) => (
                <div className="cell-content-wrapper">
                    <div className="event-thumbnail-wrapper">
                        {row.media_url ? (
                            <img src={getStorageUrl(row.media_url)} alt="" className="event-thumbnail" />
                        ) : (
                            <div className="event-placeholder"><ImageIcon size={20} /></div>
                        )}
                        <div className="event-date-badge">
                            {new Date(row.start_date).getDate()}
                        </div>
                    </div>
                    <span className="event-title">{row.title}</span>
                </div>
            )
        },
        {
            header: 'Views',
            accessor: 'views_count',
            render: (row) => (
                <div className="flex items-center gap-1 text-slate-600">
                    <Eye size={16} />
                    <span>{row.views_count}</span>
                </div>
            )
        },
        {
            header: 'Date',
            accessor: 'start_date',
            render: (row) => (
                <div className="flex items-center gap-1 text-slate-600">
                    <Calendar size={16} />
                    <span>{new Date(row.start_date).toLocaleDateString()}</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status', // active, cancelled, upcoming, past
            render: (row) => {
                let statusClass = 'status-inactive';
                if (row.status === 'active') statusClass = 'status-active';
                if (row.status === 'upcoming') statusClass = 'status-upcoming';

                return (
                    <span className={`status-badge ${statusClass}`}>
                        {row.status}
                    </span>
                );
            }
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="action-buttons">
                    <button
                        onClick={() => handleToggleStatus(row.id, row.status)}
                        className="action-btn toggle"
                        title={row.status === 'active' ? "Cancel Event" : "Activate Event"}
                    >
                        {row.status === 'active' ? <Ban size={18} /> : <BadgeCheck size={18} />}
                    </button>
                </div>
            )
        }
    ];

    return (
        <div id="analytics-events-page">
            <div className="page-header">
                <h1 className="page-title">Events</h1>
                <p className="page-subtitle">Track your upcoming and past events.</p>
            </div>

            <DataTable
                columns={columns}
                data={events}
                pagination={pagination}
                onPageChange={setPage}
                searchQuery={search}
                onSearchChange={setSearch}
                loading={loading}
            />
        </div>
    );
};

export default EventsAnalyticsPage;
