import React, { useState, useEffect } from 'react';
import {
    Mail,
    Send,
    Users,
    Building2,
    Eye,
    History,
    CheckCircle,
    AlertCircle,
    X,
    Loader,
    FileText
} from 'lucide-react';
import axiosClient from '../../lib/axios';
import UserFilters from '../../components/Admin/UserFilters';
import InstituteFilters from '../../components/Admin/InstituteFilters';
import RecipientPreviewModal from '../../components/Admin/RecipientPreviewModal';
import './BroadcastMailPage.css';

const BroadcastMailPage = () => {
    // Form state
    const [targetType, setTargetType] = useState('users');
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [filters, setFilters] = useState({});
    const [recipientEmail, setRecipientEmail] = useState('');
    const [selectedInstitutes, setSelectedInstitutes] = useState([]);

    // Data state
    const [history, setHistory] = useState([]);
    const [previewData, setPreviewData] = useState(null);
    const [recipientCount, setRecipientCount] = useState(0);

    // UI state
    const [loading, setLoading] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [showConfirmDialog, setShowConfirmDialog] = useState(false);
    const [notification, setNotification] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [countLoading, setCountLoading] = useState(false);
    const [historyLoading, setHistoryLoading] = useState(false);

    // Template state
    const [templates, setTemplates] = useState([]);
    const [selectedTemplate, setSelectedTemplate] = useState('');

    // Fetch history on mount
    useEffect(() => {
        fetchHistory();
    }, []);

    // Fetch templates when target type changes
    useEffect(() => {
        fetchTemplates();
        setSelectedTemplate('');
    }, [targetType]);

    const fetchTemplates = async () => {
        try {
            const response = await axiosClient.get(`/api/admin/mail-templates?target_type=${targetType}`);
            setTemplates(response.data);
        } catch (error) {
            console.error('Error fetching templates:', error);
        }
    };

    const handleTemplateChange = (e) => {
        const templateId = e.target.value;
        setSelectedTemplate(templateId);

        if (templateId === '') return;

        const template = templates.find(t => t.id === parseInt(templateId));
        if (template) {
            setTitle(template.subject);
            setMessage(template.body);
        }
    };

    // Update recipient count when filters change
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            updateRecipientCount();
        }, 500);

        return () => clearTimeout(debounceTimer);
    }, [targetType, filters, recipientEmail, selectedInstitutes]);

    const updateRecipientCount = async () => {
        setCountLoading(true);
        try {
            const response = await axiosClient.post('/api/admin/broadcast-mail/count', {
                target_type: targetType,
                recipient_email: recipientEmail,
                filters,
                selected_institutes: selectedInstitutes
            });
            setRecipientCount(response.data.count);
        } catch (error) {
            console.error('Error fetching recipient count:', error);
            setRecipientCount(0);
        } finally {
            setCountLoading(false);
        }
    };

    const fetchHistory = async (page = 1) => {
        setHistoryLoading(true);
        try {
            const response = await axiosClient.get(`/api/admin/broadcast-mail/history?page=${page}`);
            setHistory(response.data);
            setCurrentPage(page);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setHistoryLoading(false);
        }
    };

    const handleTargetTypeChange = (type) => {
        setTargetType(type);
        setFilters({});
        setRecipientEmail('');
        setSelectedInstitutes([]);
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }));
    };

    const handlePreviewRecipients = async () => {
        setLoading(true);
        try {
            const response = await axiosClient.post('/api/admin/broadcast-mail/preview', {
                target_type: targetType,
                recipient_email: recipientEmail,
                filters,
                selected_institutes: selectedInstitutes
            });
            setPreviewData(response.data);
            setShowPreview(true);
        } catch (error) {
            console.error('Error previewing recipients:', error);
            showNotification('Failed to preview recipients', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmSend = () => {
        if (!title.trim() || !message.trim()) {
            showNotification('Please fill in title and message', 'error');
            return;
        }

        if (recipientCount === 0) {
            showNotification('No recipients found', 'error');
            return;
        }

        setShowConfirmDialog(true);
    };

    const handleSendMail = async () => {
        setShowConfirmDialog(false);
        setLoading(true);

        try {
            const response = await axiosClient.post('/api/admin/broadcast-mail/send', {
                title,
                message,
                target_type: targetType,
                recipient_email: recipientEmail,
                filters,
                selected_institutes: selectedInstitutes
            });

            showNotification(response.data.message, 'success');

            // Reset form
            setTitle('');
            setMessage('');
            setFilters({});
            setRecipientEmail('');
            setSelectedInstitutes([]);
            setShowPreview(false);
            setPreviewData(null);

            // Refresh history
            fetchHistory();
        } catch (error) {
            console.error('Error sending broadcast:', error);
            showNotification(error.response?.data?.error || 'Failed to send broadcast email', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (message, type) => {
        setNotification({ message, type });
        setTimeout(() => setNotification(null), 5000);
    };

    return (
        <div className="broadcast-mail-page admin-page-container">
            <div className="page-header mb-8">
                <div className="header-text">
                    <h1 className="text-2xl font-bold">Broadcast Email</h1>
                    <p className="text-muted">Send targeted emails to users and institutes</p>
                </div>
            </div>


            {/* Send Mail Form */}
            <div className="admin-glass-card form-card">
                <div className="card-header">
                    <Send size={24} />
                    <h2>Compose Broadcast</h2>
                </div>

                {/* Target Type Selector */}
                <div className="form-group">
                    <label>Target Audience</label>
                    <div className="target-selector">
                        <button
                            className={`target-btn ${targetType === 'users' ? 'active' : ''}`}
                            onClick={() => handleTargetTypeChange('users')}
                        >
                            <Users size={20} />
                            <span>Users</span>
                        </button>
                        <button
                            className={`target-btn ${targetType === 'institutes' ? 'active' : ''}`}
                            onClick={() => handleTargetTypeChange('institutes')}
                        >
                            <Building2 size={20} />
                            <span>Institutes</span>
                        </button>
                    </div>
                </div>

                {/* Filters */}
                <div className="form-group">
                    <label>Filters & Selection</label>
                    {targetType === 'users' ? (
                        <UserFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            recipientEmail={recipientEmail}
                            onEmailChange={setRecipientEmail}
                        />
                    ) : (
                        <InstituteFilters
                            filters={filters}
                            onFilterChange={handleFilterChange}
                            selectedInstitutes={selectedInstitutes}
                            onInstituteSelect={setSelectedInstitutes}
                        />
                    )}
                </div>

                {/* Recipient Count Display */}
                <div className="recipient-count-display">
                    <Users size={20} />
                    <span>
                        Estimated Recipients:
                        {countLoading ? (
                            <Loader size={16} className="spin inline-loader" />
                        ) : (
                            <strong> {recipientCount}</strong>
                        )}
                    </span>
                </div>

                {/* Template Selector */}
                <div className="form-group">
                    <label>Select Template <span className="text-muted text-xs font-normal ml-2">(Optional)</span></label>
                    <div className="relative">
                        <select
                            className="template-select w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white outline-none focus:border-blue-500 transition-colors"
                            value={selectedTemplate}
                            onChange={handleTemplateChange}
                        >
                            <option value="">Select a template...</option>
                            {templates.map(template => (
                                <option key={template.id} value={template.id}>
                                    {template.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Title Input */}
                <div className="form-group">
                    <label>Email Title</label>
                    <input
                        type="text"
                        placeholder="Enter email subject..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        maxLength={255}
                    />
                </div>

                {/* Message Input */}
                <div className="form-group">
                    <label>Message</label>
                    <textarea
                        placeholder="Enter your message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        rows={8}
                    />
                </div>

                {/* Action Buttons */}
                <div className="form-actions">
                    <button
                        className="btn-secondary"
                        onClick={handlePreviewRecipients}
                        disabled={loading || recipientCount === 0}
                    >
                        <Eye size={18} />
                        Preview Recipients
                    </button>
                    <button
                        className="btn-primary"
                        onClick={handleConfirmSend}
                        disabled={loading || !title.trim() || !message.trim() || recipientCount === 0}
                    >
                        {loading ? <Loader size={18} className="spin" /> : <Send size={18} />}
                        Send Broadcast
                    </button>
                </div>
            </div>

            {/* Preview Modal */}
            <RecipientPreviewModal
                show={showPreview}
                onClose={() => setShowPreview(false)}
                onConfirm={handleConfirmSend}
                previewData={previewData}
                loading={loading}
                targetType={targetType}
            />

            {/* Confirmation Dialog */}
            {showConfirmDialog && (
                <div className="modal-overlay" onClick={() => setShowConfirmDialog(false)}>
                    <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
                        <div className="confirm-header">
                            <AlertCircle size={32} color="#e42a19" />
                            <h3>Confirm Send</h3>
                        </div>
                        <p>
                            Are you sure you want to send this email to <strong>{recipientCount}</strong> recipient{recipientCount !== 1 ? 's' : ''}?
                        </p>
                        <p className="confirm-hint">
                            This action cannot be undone. The emails will be queued for delivery.
                        </p>
                        <div className="confirm-actions">
                            <button className="btn-secondary" onClick={() => setShowConfirmDialog(false)}>
                                Cancel
                            </button>
                            <button className="btn-primary" onClick={handleSendMail}>
                                <Send size={18} />
                                Yes, Send Now
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Notification */}
            {notification && (
                <div className={`notification ${notification.type}`}>
                    {notification.type === 'success' ? <CheckCircle size={20} /> : <AlertCircle size={20} />}
                    <span>{notification.message}</span>
                    <button onClick={() => setNotification(null)}>
                        <X size={16} />
                    </button>
                </div>
            )}

            {/* History Table */}
            <div className="admin-glass-card history-card">
                <div className="card-header">
                    <History size={24} />
                    <h2>Broadcast History</h2>
                </div>

                <div className="table-container">
                    <table className="history-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Target Type</th>
                                <th>Recipients</th>
                                <th>Sent By</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyLoading ? (
                                <tr>
                                    <td colSpan="5" className="text-center p-12">
                                        <div className="loader mx-auto mb-4"></div>
                                        <p className="text-muted">Loading history...</p>
                                    </td>
                                </tr>
                            ) : history.data && history.data.length > 0 ? (
                                history.data.map((item) => (
                                    <tr key={item.id}>
                                        <td>{item.title}</td>
                                        <td>
                                            <span className={`badge ${item.target_type}`}>
                                                {item.target_type === 'users' ? <Users size={14} /> : <Building2 size={14} />}
                                                {item.target_type}
                                            </span>
                                        </td>
                                        <td>{item.recipient_count}</td>
                                        <td>{item.creator?.name || 'Admin'}</td>
                                        <td>{new Date(item.created_at).toLocaleString()}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="no-data">
                                        No broadcast history yet
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {history.last_page > 1 && (
                    <div className="pagination">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => fetchHistory(currentPage - 1)}
                        >
                            Previous
                        </button>
                        <span>Page {currentPage} of {history.last_page}</span>
                        <button
                            disabled={currentPage === history.last_page}
                            onClick={() => fetchHistory(currentPage + 1)}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BroadcastMailPage;
