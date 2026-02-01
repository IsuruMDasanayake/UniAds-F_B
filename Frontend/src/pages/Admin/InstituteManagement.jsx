import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    CheckCircle,
    XCircle,
    ExternalLink,
    Crown,
    AlertCircle,
    Building2
} from 'lucide-react';
import axiosClient from '../../lib/axios';
import './InstituteManagement.css';

const InstituteManagement = () => {
    const [institutes, setInstitutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    useEffect(() => {
        fetchInstitutes();
    }, []);

    const fetchInstitutes = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/api/admin/institutes');
            setInstitutes(response.data);
        } catch (error) {
            console.error('Error fetching institutes:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            await axiosClient.post(`/api/admin/institutes/${id}/approve`);
            setInstitutes(institutes.map(inst =>
                inst.id === id ? { ...inst, status: 'approved' } : inst
            ));
        } catch (error) {
            console.error('Error approving institute:', error);
        }
    };

    const handleTogglePremium = async (id) => {
        try {
            const resp = await axiosClient.post(`/api/admin/institutes/${id}/toggle-premium`);
            setInstitutes(institutes.map(inst =>
                inst.id === id ? { ...inst, is_premium: resp.data.is_premium } : inst
            ));
        } catch (error) {
            console.error('Error toggling premium status:', error);
        }
    };

    const filteredInstitutes = institutes.filter(inst => {
        const nameMatch = (inst.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const emailMatch = (inst.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesSearch = nameMatch || emailMatch;
        const matchesStatus = statusFilter === 'All' || inst.status === statusFilter.toLowerCase();
        return matchesSearch && matchesStatus;
    });

    return (
        <div className="institute-management-page admin-institute-scope">
            <div className="page-header mb-8">
                <div className="header-text">
                    <h1 className="text-2xl font-bold">Institute Management</h1>
                    <p className="text-muted">Review applications and manage institutional profiles</p>
                </div>
            </div>

            <div className="admin-glass-card table-container">
                <div className="table-controls p-6">
                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by institute name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-box">
                        <Filter size={18} className="filter-icon" />
                        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                            <option value="All">All Status</option>
                            <option value="Approved">Approved</option>
                            <option value="Unapproved">Pending Review</option>
                        </select>
                    </div>
                </div>

                <div className="responsive-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Institute</th>
                                <th>Location</th>
                                <th>Status</th>
                                <th>Tier</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center p-12">
                                        <div className="loader mx-auto mb-4"></div>
                                        <p className="text-muted">Loading institutes...</p>
                                    </td>
                                </tr>
                            ) : filteredInstitutes.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center p-12">
                                        <p className="text-muted">No institutes found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredInstitutes.map((inst) => (
                                    <tr key={inst.id}>
                                        <td>
                                            <div className="institute-cell">
                                                <div className="inst-avatar">
                                                    <Building2 size={18} />
                                                </div>
                                                <div className="inst-meta">
                                                    <span className="inst-name-text">{inst.name}</span>
                                                    <span className="inst-email-text">{inst.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{inst.city || 'Not specified'}</td>
                                        <td>
                                            <span className={`status-pill ${(inst.status || '').toLowerCase()}`}>
                                                {inst.status === 'approved' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                                {inst.status ? inst.status.charAt(0).toUpperCase() + inst.status.slice(1) : 'Unknown'}
                                            </span>
                                        </td>
                                        <td>
                                            <button
                                                className={`premium-toggle ${inst.is_premium ? 'premium' : 'basic'}`}
                                                onClick={() => handleTogglePremium(inst.id)}
                                                title={inst.is_premium ? 'Downgrade to Basic' : 'Upgrade to Premium'}
                                            >
                                                <Crown size={14} />
                                                {inst.is_premium ? 'Premium' : 'Basic'}
                                            </button>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                {inst.status === 'unapproved' && (
                                                    <button
                                                        className="action-btn-sm approve"
                                                        title="Approve Institute"
                                                        onClick={() => handleApprove(inst.id)}
                                                    >
                                                        <CheckCircle size={16} /> Approve
                                                    </button>
                                                )}
                                                <a
                                                    href={`/institutions/${inst.id}/profile`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="action-btn-sm view"
                                                    title="View Public Profile"
                                                >
                                                    <ExternalLink size={16} /> View
                                                </a>
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

export default InstituteManagement;
