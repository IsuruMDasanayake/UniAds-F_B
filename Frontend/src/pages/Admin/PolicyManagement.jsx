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
    Layout
} from 'lucide-react';
import axiosClient from '../../lib/axios';
import './PolicyManagement.css';

const PolicyManagement = () => {
    const [activeTab, setActiveTab] = useState('privacy');
    const [policies, setPolicies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPolicy, setCurrentPolicy] = useState(null);

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
            const endpoint = activeTab === 'privacy' ? '/api/admin/policies/privacy' :
                activeTab === 'terms' ? '/api/admin/policies/terms' :
                    '/api/admin/policies/refund';

            if (currentPolicy.id) {
                await axiosClient.put(`${endpoint}/${currentPolicy.id}`, currentPolicy);
                setPolicies(policies.map(p => p.id === currentPolicy.id ? currentPolicy : p));
            } else {
                const resp = await axiosClient.post(endpoint, currentPolicy);
                setPolicies([...policies, resp.data.data]);
            }
            setCurrentPolicy(null);
        } catch (error) {
            console.error('Error saving policy item:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Delete this policy section?')) {
            try {
                const endpoint = activeTab === 'privacy' ? '/api/admin/policies/privacy' :
                    activeTab === 'terms' ? '/api/admin/policies/terms' :
                        '/api/admin/policies/refund';
                await axiosClient.delete(`${endpoint}/${id}`);
                setPolicies(policies.filter(p => p.id !== id));
            } catch (error) {
                console.error('Error deleting policy item:', error);
            }
        }
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
                    <div className="admin-glass-card p-6">
                        <div className="content-header mb-6">
                            <h3 className="text-lg font-bold capitalize">
                                {activeTab.replace('-', ' ')} Sections
                            </h3>
                            <button className="add-section-btn" onClick={() => setCurrentPolicy({ title: '', content: '', order_index: 0 })}>
                                <Plus size={16} /> Add Section
                            </button>
                        </div>

                        {loading ? (
                            <div className="text-center p-12">
                                <div className="loader mx-auto"></div>
                            </div>
                        ) : (
                            <div className="sections-list">
                                {policies.length === 0 && !currentPolicy && (
                                    <p className="text-muted text-center p-8">No sections defined yet.</p>
                                )}

                                {policies.map(p => (
                                    <div key={p.id} className="policy-item-card mb-4">
                                        <div className="item-info">
                                            <span className="item-title">{p.title}</span>
                                            <p className="item-preview">{p.content.substring(0, 80)}...</p>
                                        </div>
                                        <div className="item-actions">
                                            <button className="icon-btn edit" onClick={() => setCurrentPolicy(p)}>
                                                <ChevronRight size={18} />
                                            </button>
                                            <button className="icon-btn delete" onClick={() => handleDelete(p.id)}>
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {currentPolicy && (
                    <div className="policy-editor-overlay">
                        <div className="admin-glass-card editor-modal p-8">
                            <div className="editor-header mb-6">
                                <h2 className="text-xl font-bold">{currentPolicy.id ? 'Edit Section' : 'New Section'}</h2>
                                <button className="close-btn" onClick={() => setCurrentPolicy(null)}><X size={20} /></button>
                            </div>
                            <form onSubmit={handleSave}>
                                <div className="form-group mb-4">
                                    <label>Section Title</label>
                                    <input
                                        type="text"
                                        className="modal-input"
                                        value={currentPolicy.title}
                                        onChange={e => setCurrentPolicy({ ...currentPolicy, title: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="form-group mb-6">
                                    <label>Content</label>
                                    <textarea
                                        className="modal-textarea"
                                        rows="10"
                                        value={currentPolicy.content}
                                        onChange={e => setCurrentPolicy({ ...currentPolicy, content: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="modal-footer">
                                    <button type="submit" className="btn-save"><Save size={18} /> Save Section</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PolicyManagement;
