import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Trash2, Calendar, ChevronLeft, ChevronRight, Loader2, FileClock } from 'lucide-react';
import axiosClient from '../../../lib/axios';
import './ActivityLogsTab.css';

const ActivityLogsTab = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState(false);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        total: 0
    });

    const [filters, setFilters] = useState({
        category: 'All',
        start_date: '',
        end_date: '',
        page: 1
    });

    const categories = ['All', 'Content', 'Application', 'Account', 'Subscription', 'General'];

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.category !== 'All') params.append('category', filters.category);
            if (filters.start_date) params.append('start_date', filters.start_date);
            if (filters.end_date) params.append('end_date', filters.end_date);
            params.append('page', filters.page);

            const response = await axiosClient.get(`/api/institute/activity-logs?${params.toString()}`);
            setLogs(response.data.data?.data || []);
            setPagination({
                current_page: response.data.data?.current_page ?? 1,
                last_page: response.data.data?.last_page ?? 1,
                total: response.data.data?.total ?? 0
            });
        } catch (error) {
            console.error("Failed to fetch logs:", error?.message || error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, [filters.category, filters.start_date, filters.end_date, filters.page]);

    const handleExportCsv = async () => {
        setExporting(true);
        try {
            const params = new URLSearchParams();
            if (filters.category !== 'All') params.append('category', filters.category);
            if (filters.start_date) params.append('start_date', filters.start_date);
            if (filters.end_date) params.append('end_date', filters.end_date);

            const response = await axiosClient.get(`/api/institute/activity-logs/export?${params.toString()}`, {
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `activity_logs_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error("Export failed:", error?.message || error);
        } finally {
            setExporting(false);
        }
    };

    const handleClearLogs = async () => {
        if (window.confirm("Are you sure you want to clear all activity logs? This action cannot be undone.")) {
            try {
                await axiosClient.delete('/api/institute/activity-logs/clear');
                fetchLogs();
            } catch (error) {
                console.error("Failed to clear logs:", error?.message || error);
            }
        }
    };

    const getCategoryClass = (category) => {
        switch (category) {
            case 'Content': return 'al-cat-content';
            case 'Application': return 'al-cat-app';
            case 'Account': return 'al-cat-account';
            case 'Subscription': return 'al-cat-sub';
            default: return 'al-cat-general';
        }
    };

    return (
        <div className="al-container">
            <div className="al-header">
                <div className="al-title">
                    {/* <FileClock className="text-blue-500" size={24} /> */}
                    <div>
                        <h3>Activity Logs</h3>
                        <p>Track all administrative actions performed in your dashboard.</p>
                    </div>
                </div>
                <div className="al-actions">
                    <button
                        className="al-btn-export"
                        onClick={handleExportCsv}
                        disabled={exporting || logs.length === 0}
                    >
                        {exporting ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                        Export CSV
                    </button>
                    {/* <button
                        className="al-btn-clear"
                        onClick={handleClearLogs}
                        disabled={logs.length === 0}
                    >
                        <Trash2 size={16} />
                        Clear All
                    </button> */}
                </div>
            </div>

            <div className="al-filters">
                <div className="al-filter-group">
                    <label>Category</label>
                    <select
                        value={filters.category}
                        onChange={(e) => setFilters({ ...filters, category: e.target.value, page: 1 })}
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="al-filter-group">
                    <label>Start Date</label>
                    <div className="al-date-input">
                        <Calendar size={14} />
                        <input
                            type="date"
                            value={filters.start_date}
                            onChange={(e) => setFilters({ ...filters, start_date: e.target.value, page: 1 })}
                        />
                    </div>
                </div>

                <div className="al-filter-group">
                    <label>End Date</label>
                    <div className="al-date-input">
                        <Calendar size={14} />
                        <input
                            type="date"
                            value={filters.end_date}
                            onChange={(e) => setFilters({ ...filters, end_date: e.target.value, page: 1 })}
                        />
                    </div>
                </div>

                <button
                    className="al-btn-reset"
                    onClick={() => setFilters({ category: 'All', start_date: '', end_date: '', page: 1 })}
                >
                    Reset
                </button>
            </div>

            <div className="al-table-wrapper">
                {loading ? (
                    <div className="al-loading">
                        <Loader2 className="animate-spin text-blue-500" size={32} />
                        <p>Loading activities...</p>
                    </div>
                ) : logs.length > 0 ? (
                    <>
                        <table className="al-table">
                            <thead>
                                <tr>
                                    <th>Action Type</th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>Date &amp; Time</th>
                                    <th>User</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="font-semibold">{log.action_type}</td>
                                        <td className="text-gray-600 al-description-cell">{log.description}</td>
                                        <td>
                                            <span className={`al-cat-badge ${getCategoryClass(log.category)}`}>
                                                {log.category}
                                            </span>
                                        </td>
                                        <td className="whitespace-nowrap">
                                            {new Date(log.created_at).toLocaleString()}
                                        </td>
                                        <td>{log.user?.name || 'Admin'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="al-pagination">
                            <button
                                disabled={filters.page === 1}
                                onClick={() => setFilters({ ...filters, page: filters.page - 1 })}
                                className="al-pag-btn"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <span className="al-pag-info">
                                Page <strong>{pagination.current_page}</strong> of {pagination.last_page}
                                <span className="al-total-count">({pagination.total} total)</span>
                            </span>
                            <button
                                disabled={filters.page === pagination.last_page}
                                onClick={() => setFilters({ ...filters, page: filters.page + 1 })}
                                className="al-pag-btn"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="al-empty">
                        <FileClock size={48} className="text-gray-300" />
                        <p>No activities found matching your criteria.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityLogsTab;
