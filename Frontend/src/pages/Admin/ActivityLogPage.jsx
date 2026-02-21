import React, { useState, useEffect } from 'react';
import axiosClient from '../../lib/axios';
import {
    History,
    Search,
    User,
    Activity,
    Calendar,
    RefreshCw,
    XCircle,
    Clock,
    UserCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import './ActivityLogPage.css';

const ActivityLogPage = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        actions: [],
        admins: []
    });
    const [search, setSearch] = useState('');
    const [selectedAdmin, setSelectedAdmin] = useState('');
    const [selectedAction, setSelectedAction] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0
    });

    const fetchFilters = async () => {
        try {
            const response = await axiosClient.get('/api/admin/activity-logs/filters');
            setFilters(response.data);
        } catch (error) {
            console.error('Error fetching filters', error);
        }
    };

    const fetchLogs = async (page = 1, isSilent = false) => {
        if (!isSilent) setLoading(true);
        try {
            const params = {
                page,
                search: search || undefined,
                admin_id: selectedAdmin || undefined,
                action: selectedAction || undefined,
                start_date: startDate || undefined,
                end_date: endDate || undefined,
                per_page: 20
            };
            const response = await axiosClient.get('/api/admin/activity-logs', { params });
            setLogs(response.data.data);
            setPagination({
                current_page: response.data.current_page,
                last_page: response.data.last_page,
                total: response.data.total
            });
        } catch (error) {
            console.error('Error fetching logs', error);
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchFilters();
        const intervalId = setInterval(() => fetchLogs(pagination.current_page, true), 30000);
        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchLogs(1);
        }, 500); // Debounce search
        return () => clearTimeout(timer);
    }, [search, selectedAdmin, selectedAction, startDate, endDate]);

    const handleClearFilters = () => {
        setSearch('');
        setSelectedAdmin('');
        setSelectedAction('');
        setStartDate('');
        setEndDate('');
    };

    const getActionClass = (action) => {
        const act = action.toLowerCase();
        if (act.includes('deleted')) return 'deleted';
        if (act.includes('updated')) return 'updated';
        if (act.includes('created')) return 'created';
        if (act.includes('approved')) return 'approved';
        if (act.includes('sent')) return 'sent';
        return 'default';
    };

    return (
        <div className="activity-management-page admin-activity-log-scope">
            <div className="page-header mb-8">
                <div className="header-text">
                    <h1 className="text-2xl font-bold">Activity Logs</h1>
                    <p className="text-muted">Audit trail of all administrative actions</p>
                </div>
                <button className="log-refresh-btn" onClick={() => fetchLogs(pagination.current_page)}>
                    <RefreshCw size={20} className={loading ? 'spin' : ''} />
                    <span>Refresh Logs</span>
                </button>
            </div>

            <div className="admin-glass-card table-container">
                <div className="log-controls-wrapper">
                    <div className="search-and-filters p-6">
                        <div className="log-main-filters">
                            <div className="log-search-box">
                                <Search size={18} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search by description..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>

                            <div className="log-filter-group">
                                <UserCircle size={18} className="filter-icon" />
                                <select value={selectedAdmin} onChange={(e) => setSelectedAdmin(e.target.value)}>
                                    <option value="">All Admins</option>
                                    {filters.admins.map(admin => (
                                        <option key={admin.id} value={admin.id}>{admin.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="log-filter-group">
                                <Activity size={18} className="filter-icon" />
                                <select value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)}>
                                    <option value="">All Action Types</option>
                                    {filters.actions.map(action => (
                                        <option key={action} value={action}>{action}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="log-secondary-filters mt-4">
                            <div className="date-range-inputs">
                                <div className="log-date-input">
                                    <Calendar size={16} className="date-icon" />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        title="Start Date"
                                    />
                                </div>
                                <span className="date-separator">to</span>
                                <div className="log-date-input">
                                    <Calendar size={16} className="date-icon" />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        title="End Date"
                                    />
                                </div>
                            </div>

                            <button className="log-clear-btn" onClick={handleClearFilters}>
                                <XCircle size={18} />
                                <span>Clear Filters</span>
                            </button>
                        </div>
                    </div>
                </div>

                <div className="responsive-table">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Administrator</th>
                                <th>Action</th>
                                <th>Subject</th>
                                <th>Description</th>
                                <th className="text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence mode="popLayout">
                                {loading && logs.length === 0 ? (
                                    <tr>
                                        <td colSpan="5" className="text-center p-12">
                                            <div className="log-loader mx-auto mb-4"></div>
                                            <p className="text-muted">Fetching activity logs...</p>
                                        </td>
                                    </tr>
                                ) : logs.length > 0 ? (
                                    logs.map((log) => (
                                        <motion.tr
                                            key={log.id}
                                            className="log-row"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                        >
                                            <td>
                                                <div className="log-admin-cell">
                                                    <div className="log-admin-avatar">
                                                        {log.admin?.profile_picture ? (
                                                            <img
                                                                src={log.admin.profile_picture.startsWith('http') ? log.admin.profile_picture : `${axiosClient.defaults.baseURL}/storage/${log.admin.profile_picture}`}
                                                                alt=""
                                                                className="avatar-img"
                                                            />
                                                        ) : (
                                                            <div className="avatar-placeholder">
                                                                {log.admin?.name?.charAt(0) || 'A'}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="log-admin-details">
                                                        <span className="admin-name-text">{log.admin?.name || 'Unknown Admin'}</span>
                                                        <span className="admin-role-text">Administrator</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <span className={`log-action-tag ${getActionClass(log.action)}`}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td>
                                                <span className="log-subject-badge">{log.subject_type}</span>
                                            </td>
                                            <td>
                                                <p className="log-desc-text">{log.description}</p>
                                            </td>
                                            <td className="text-right">
                                                <div className="log-time-display">
                                                    <Clock size={14} />
                                                    <span>{formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}</span>
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center p-12">
                                            <div className="log-empty-state">
                                                <History size={48} className="mx-auto mb-4 opacity-20" />
                                                <p className="text-muted">No activity logs found matching your criteria.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>

                {pagination.last_page > 1 && (
                    <div className="pagination-wrapper p-6">
                        <span className="pagination-count">
                            Showing page {pagination.current_page} of {pagination.last_page} ({pagination.total} records)
                        </span>
                        <div className="pagination-actions">
                            <button
                                className="log-page-btn"
                                disabled={pagination.current_page === 1}
                                onClick={() => fetchLogs(pagination.current_page - 1)}
                            >
                                Previous
                            </button>
                            <button
                                className="log-page-btn"
                                disabled={pagination.current_page === pagination.last_page}
                                onClick={() => fetchLogs(pagination.current_page + 1)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogPage;
