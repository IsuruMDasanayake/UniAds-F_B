import React, { useState, useEffect } from 'react';
import {
    FileLock,
    FileText,
    RotateCcw,
    Plus,
    Save,
    Trash2,
    ChevronRight,
    ShieldCheck,
    Layout,
    X,
    Edit2
} from 'lucide-react';
import ActionConfirmModal from '../../components/Modals/ActionConfirmModal';
import axiosClient from '../../lib/axios';
import './PolicyManagement.css';

const PolicyManagement = () => {
    const [activeTab, setActiveTab] = useState('privacy');
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPolicy, setCurrentPolicy] = useState(null);
    const [expandedSections, setExpandedSections] = useState({});

    // Modal States
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [sectionToDelete, setSectionToDelete] = useState(null);
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        fetchPolicies();
    }, [activeTab]);

    const fetchPolicies = async () => {
        try {
            setLoading(true);
            const endpoint = activeTab === 'privacy' ? '/api/admin/policies/privacy' :
                activeTab === 'terms' ? '/api/admin/policies/terms' :
                    '/api/admin/policies/refund';
            const response = await axiosClient.get(endpoint);
            setPolicies(response.data);
        } catch (error) {
            console.error('Error fetching policies:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        if (!currentPolicy) return;

        try {
            setIsProcessing(true);
            const endpoint = activeTab === 'privacy' ? '/api/admin/policies/privacy' :
                activeTab === 'terms' ? '/api/admin/policies/terms' :
                    '/api/admin/policies/refund';

            if (currentPolicy.id) {
                const resp = await axiosClient.put(`${endpoint}/${currentPolicy.id}`, currentPolicy);
                setPolicies(policies.map(p => p.id === currentPolicy.id ? resp.data.data || currentPolicy : p));
            } else {
                const resp = await axiosClient.post(endpoint, currentPolicy);
                setPolicies([...policies, resp.data.data]);
            }
            setIsEditModalOpen(false);
            setCurrentPolicy(null);
        } catch (error) {
            console.error('Error saving policy item:', error);
        } finally {
            setIsProcessing(false);
        }
    };

    const confirmDelete = async () => {
        if (!sectionToDelete) return;

        try {
            setIsProcessing(true);
            const endpoint = activeTab === 'privacy' ? '/api/admin/policies/privacy' :
                activeTab === 'terms' ? '/api/admin/policies/terms' :
                    '/api/admin/policies/refund';
            await axiosClient.delete(`${endpoint}/${sectionToDelete}`);
            setPolicies(policies.filter(p => p.id !== sectionToDelete));
            setIsDeleteModalOpen(false);
        } catch (error) {
            console.error('Error deleting policy item:', error);
        } finally {
            setIsProcessing(false);
            setSectionToDelete(null);
        }
    };

    const toggleSection = (id) => {
        setExpandedSections(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const openEditModal = (policy = null) => {
        if (policy) {
            setCurrentPolicy({ ...policy });
        } else {
            setCurrentPolicy({ title: '', content: '', order_index: (policies.length > 0 ? Math.max(...policies.map(p => p.order_index)) + 1 : 1) });
        }
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (id) => {
        setSectionToDelete(id);
        setIsDeleteModalOpen(true);
    };

    return (
        <div className="policy-management-page admin-policy-scope">
            <div className="page-header mb-8">
                <div className="header-text">
                    <h1 className="text-2xl font-bold">Policy Management</h1>
                    <p className="text-muted">Maintain legal documents and platform rules</p>
                </div>
            </div>

            <div className="policy-container">
                <div className="policy-sidebar">
                    <div className="admin-glass-card tabs-card">
                        <button
                            className={`tab-btn ${activeTab === 'privacy' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('privacy'); setCurrentPolicy(null); }}
                        >
                            <FileLock size={18} /> Privacy Policy
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'terms' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('terms'); setCurrentPolicy(null); }}
                        >
                            <FileText size={18} /> Terms & Conditions
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'refund' ? 'active' : ''}`}
                            onClick={() => { setActiveTab('refund'); setCurrentPolicy(null); }}
                        >
                            <RotateCcw size={18} /> Refund Policy
                        </button>
                    </div>
                </div>

                <div className="policy-content">
                    <div className="admin-glass-card table-container p-6">
                        <div className="content-header mb-6">
                            <h3 className="text-lg font-bold">
                                {activeTab === 'privacy' ? 'Privacy Policy' : activeTab === 'terms' ? 'Terms & Conditions' : 'Refund Policy'} Sections
                            </h3>
                            <button className="add-section-btn" onClick={() => openEditModal()}>
                                <Plus size={16} /> Add Section
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center p-12">
                                <div className="loader mx-auto"></div>
                            </div>
                        ) : (
                            <div className="responsive-table">
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>ID</th>
                                            <th>Title</th>
                                            <th>Content</th>
                                            <th>Order</th>
                                            <th className="text-center">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {policies.length === 0 ? (
                                            <tr>
                                                <td colSpan="5" className="text-center p-12 text-muted">No sections defined yet.</td>
                                            </tr>
                                        ) : (
                                            policies.sort((a, b) => a.order_index - b.order_index).map(p => (
                                                <tr key={p.id}>
                                                    <td>{p.id}</td>
                                                    <td className="text-sm">{p.title}</td>
                                                    <td>
                                                        <div className="policy-content-cell">
                                                            <div className={`content-text ${expandedSections[p.id] ? 'expanded' : 'truncated'}`}>
                                                                {p.content}
                                                            </div>
                                                            <button
                                                                className="toggle-text-btn"
                                                                onClick={() => toggleSection(p.id)}
                                                            >
                                                                {expandedSections[p.id] ? 'See Less' : 'See More'}
                                                            </button>
                                                        </div>
                                                    </td>
                                                    <td>{p.order_index}</td>
                                                    <td>
                                                        <div className="actions-cell">
                                                            <button className="icon-btn edit" title="Edit Section" onClick={() => openEditModal(p)}>
                                                                <Edit2 size={18} />
                                                            </button>
                                                            <button className="icon-btn delete" title="Delete Section" onClick={() => openDeleteModal(p.id)}>
                                                                <Trash2 size={18} />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Add/Edit Modal */}
            {isEditModalOpen && currentPolicy && (
                <div className="modal-overlay" onClick={() => setIsEditModalOpen(false)}>
                    <div className="modal-content policy-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header-section">
                            <h2>{currentPolicy.id ? 'Edit Policy Section' : 'Add New Section'}</h2>
                            <button className="modal-close" onClick={() => setIsEditModalOpen(false)}>&times;</button>
                        </div>
                        <div className="modal-body-section">
                            <form onSubmit={handleSave} className="flex flex-col h-full">
                                <div className="modal-body-scroll flex-1 overflow-y-auto pr-2">
                                    <div className="form-group mb-4">
                                        <label className="modal-label">Section Title</label>
                                        <input
                                            type="text"
                                            className="modal-input"
                                            placeholder="e.g., Information Collection"
                                            value={currentPolicy.title}
                                            onChange={e => setCurrentPolicy({ ...currentPolicy, title: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group mb-4 flex-1 flex flex-col">
                                        <label className="modal-label">Content</label>
                                        <textarea
                                            className="modal-textarea"
                                            placeholder="Enter full section content..."
                                            rows="10"
                                            value={currentPolicy.content}
                                            onChange={e => setCurrentPolicy({ ...currentPolicy, content: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group mb-4">
                                        <label className="modal-label">Order Index</label>
                                        <input
                                            type="number"
                                            className="modal-input"
                                            value={currentPolicy.order_index}
                                            onChange={e => setCurrentPolicy({ ...currentPolicy, order_index: parseInt(e.target.value) || 0 })}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-actions">
                                    <button
                                        type="button"
                                        className="cancel-btn"
                                        onClick={() => setIsEditModalOpen(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="submit-btn"
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? 'Saving...' : currentPolicy.id ? 'Save Changes' : 'Add Section'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            <ActionConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                isProcessing={isProcessing}
                title="Delete Policy Section"
                message="Are you sure you want to delete this section? This action cannot be undone."
                confirmText="Yes, Delete Section"
                type="danger"
            />
        </div>
    );
};

export default PolicyManagement;
