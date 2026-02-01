import React, { useState, useEffect } from 'react';
import { Search, Filter, Shield, MoreVertical, Building2, CheckCircle, XCircle, AlertCircle, Eye, Crown } from 'lucide-react';
import axiosClient from '../../lib/axios';
import ActionConfirmModal from '../../components/Modals/ActionConfirmModal';
import './InstituteManagement.css';

const InstituteManagement = () => {
    const [institutes, setInstitutes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');

    // Confirmation Modal State
    const [confirmModal, setConfirmModal] = useState({
        isOpen: false,
        type: 'success', // 'success' | 'danger'
        title: '',
        message: '',
        confirmText: '',
        instituteId: null,
        action: null // 'approve' | 'unapprove'
    });
    const [isProcessingAction, setIsProcessingAction] = useState(false);

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

    const handleApprove = (id) => {
        setConfirmModal({
            isOpen: true,
            type: 'success',
            title: 'Approve Institute',
            message: 'Are you sure you want to approve this institute? They will gain access to the platform.',
            confirmText: 'Yes, Approve',
            instituteId: id,
            action: 'approve'
        });
    };

    const handleUnapprove = (id) => {
        setConfirmModal({
            isOpen: true,
            type: 'danger',
            title: 'Unapprove Institute',
            message: 'Are you sure you want to unapprove this institute? Their access will be revoked immediately.',
            confirmText: 'Yes, Unapprove',
            instituteId: id,
            action: 'unapprove'
        });
    };

    const executeConfirmation = () => {
        const { instituteId, action } = confirmModal;
        if (!instituteId || !action) return;

        setIsProcessingAction(true);

        if (action === 'approve') {
            axiosClient.post(`/api/admin/institutes/${instituteId}/approve`)
                .then(() => {
                    setInstitutes(institutes.map(inst =>
                        inst.id === instituteId ? { ...inst, status: 'approved' } : inst
                    ));
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                })
                .catch(err => {
                    console.error('Error approving institute:', err);
                    alert('Failed to approve institute');
                })
                .finally(() => {
                    setIsProcessingAction(false);
                });
        } else if (action === 'unapprove') {
            axiosClient.post(`/api/admin/institutes/${instituteId}/unapprove`)
                .then(() => {
                    setInstitutes(institutes.map(inst =>
                        inst.id === instituteId ? { ...inst, status: 'unapproved' } : inst
                    ));
                    setConfirmModal(prev => ({ ...prev, isOpen: false }));
                })
                .catch(err => {
                    console.error('Error unapproving institute:', err);
                    alert('Failed to unapprove institute');
                })
                .finally(() => {
                    setIsProcessingAction(false);
                });
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
        const nameMatch = (inst.institute_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
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
                                <th>Website</th>
                                <th>Contact No.</th>
                                <th>Gov. Reg. No</th>
                                <th>Status</th>
                                <th>Tier</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="8" className="text-center p-12">
                                        <div className="flex flex-col items-center justify-center space-y-4">
                                            <div className="loading-spinner"></div>
                                            <p className="text-muted text-sm animate-pulse">Loading institutes...</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredInstitutes.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="text-center p-12">
                                        <p className="text-muted">No institutes found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredInstitutes.map((inst) => (
                                    <tr key={inst.id}>
                                        <td>
                                            <div className="institute-cell">
                                                <div className="inst-avatar">
                                                    {inst.profile_photo ? (
                                                        <img
                                                            src={`http://localhost:8000/storage/${inst.profile_photo}`}
                                                            alt={inst.institute_name}
                                                            className="inst-photo"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'block';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <Building2
                                                        size={18}
                                                        className="placeholder-icon"
                                                        style={{ display: inst.profile_photo ? 'none' : 'block' }}
                                                    />
                                                </div>
                                                <div className="inst-meta">
                                                    <span className="inst-name-text">{inst.institute_name}</span>
                                                    <span className="inst-email-text">{inst.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{inst.location || 'Not specified'}</td>
                                        <td>
                                            {inst.website ? (
                                                <a href={inst.website} target="_blank" rel="noopener noreferrer" className="visit-link">
                                                    Visit
                                                </a>
                                            ) : (
                                                <span className="text-muted text-sm">-</span>
                                            )}
                                        </td>
                                        <td className="text-sm font-mono">{inst.contact_number || '-'}</td>
                                        <td className="text-sm font-mono">{inst.gov_register_number || '-'}</td>
                                        <td>
                                            <span className={`status-pill ${(inst.status || '').toLowerCase()}`}>
                                                {inst.status === 'approved' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                                                {inst.status ? inst.status.charAt(0).toUpperCase() + inst.status.slice(1) : 'Unknown'}
                                            </span>
                                        </td>
                                        <td>
                                            <span
                                                className={`premium-badge ${inst.is_premium ? 'premium' : 'basic'}`}
                                            >
                                                <Crown size={14} />
                                                {inst.is_premium ? '' : ''}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                {inst.status === 'unapproved' && (
                                                    <button
                                                        className="action-btn-sm approve"
                                                        title="Approve Institute"
                                                        onClick={() => handleApprove(inst.id)}
                                                    >
                                                        <CheckCircle size={18} />
                                                    </button>
                                                )}
                                                {inst.status === 'approved' && (
                                                    <button
                                                        className="action-btn-sm unapprove"
                                                        title="Unapprove Institute"
                                                        onClick={() => handleUnapprove(inst.id)}
                                                    >
                                                        <XCircle size={18} />
                                                    </button>
                                                )}
                                                <a
                                                    href={`/institutions/${inst.id}/profile`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="action-btn-sm view"
                                                    title="View Public Profile"
                                                >
                                                    <Eye size={18} />
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
            {/* Confirmation Modal */}
            <ActionConfirmModal
                isOpen={confirmModal.isOpen}
                onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                onConfirm={executeConfirmation}
                isProcessing={isProcessingAction}
                title={confirmModal.title}
                message={confirmModal.message}
                confirmText={confirmModal.confirmText}
                type={confirmModal.type}
            />
        </div>
    );
};

export default InstituteManagement;
