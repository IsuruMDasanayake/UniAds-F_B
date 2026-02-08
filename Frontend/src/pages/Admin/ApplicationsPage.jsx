import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    User,
    Building2,
    BookOpen,
    Calendar
} from 'lucide-react';
import axiosClient from '../../lib/axios';
import './ApplicationsPage.css';

const ApplicationsPage = () => {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [institutes, setInstitutes] = useState([]);
    const [selectedInstitute, setSelectedInstitute] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchInstitutes();
    }, []);

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchApplications();
        }, 500);

        return () => clearTimeout(delayDebounceFn);
    }, [searchTerm, selectedInstitute, page]);

    const fetchInstitutes = async () => {
        try {
            const response = await axiosClient.get('/api/institutions');
            setInstitutes(response.data);
        } catch (error) {
            console.error('Error fetching institutes:', error);
        }
    };

    const fetchApplications = async () => {
        try {
            setLoading(true);
            const params = {
                page: page,
                search: searchTerm,
                institute_id: selectedInstitute
            };

            const response = await axiosClient.get('/api/admin/applications', { params });
            setApplications(response.data.data);
            setTotalPages(response.data.last_page);
        } catch (error) {
            console.error('Error fetching applications:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="applications-page admin-applications-scope">
            <div className="page-header mb-8">
                <div className="header-text">
                    <h1 className="text-2xl font-bold">Applications</h1>
                    <p className="text-muted">Monitor course inquiries and applications</p>
                </div>
            </div>

            <div className="table-controls p-0 mb-6 bg-transparent border-0 flex justify-between items-center gap-4">
                <div className="search-box flex-1 max-w-md">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search by student, course or institute..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1); // Reset to first page on search
                        }}
                    />
                </div>
                <div className="filter-box">
                    <Filter size={18} className="filter-icon" />
                    <select
                        className="admin-select"
                        value={selectedInstitute}
                        onChange={(e) => {
                            setSelectedInstitute(e.target.value);
                            setPage(1); // Reset to first page on filter
                        }}
                    >
                        <option value="all">All Institutes</option>
                        {institutes.map(inst => (
                            <option key={inst.id} value={inst.id}>{inst.institute_name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="admin-glass-card table-container">
                <div className="responsive-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Course</th>
                                <th>Institute</th>
                                <th>Applied At</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="4" className="text-center p-12">
                                        <div className="loader mx-auto mb-4"></div>
                                        <p className="text-muted">Loading applications...</p>
                                    </td>
                                </tr>
                            ) : applications.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center p-12">
                                        <p className="text-muted">No applications found.</p>
                                    </td>
                                </tr>
                            ) : (
                                applications.map((app) => (
                                    <tr key={app.id}>
                                        <td>
                                            <div className="user-info-sm">
                                                <User size={16} className="text-muted" />
                                                <span>{app.user?.name || 'Anonymous'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="course-info-sm">
                                                <BookOpen size={16} className="text-muted" />
                                                <span>{app.course_title}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="inst-info-sm">
                                                <Building2 size={16} className="text-muted" />
                                                <span>{app.institute?.institute_name || '-'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-2 text-sm text-muted">
                                                <Calendar size={14} />
                                                {app.applied_at ? new Date(app.applied_at).toLocaleString() : new Date(app.created_at).toLocaleString()}
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex justify-between items-center p-4 border-t border-white/5">
                        <button
                            className="px-4 py-2 text-sm text-white bg-white/5 rounded-lg disabled:opacity-50"
                            onClick={() => setPage(p => Math.max(1, p - 1))}
                            disabled={page === 1}
                        >
                            Previous
                        </button>
                        <span className="text-sm text-muted">
                            Page {page} of {totalPages}
                        </span>
                        <button
                            className="px-4 py-2 text-sm text-white bg-white/5 rounded-lg disabled:opacity-50"
                            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                            disabled={page === totalPages}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApplicationsPage;
