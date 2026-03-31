import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Edit2, Trash2, Database } from 'lucide-react';
import axiosClient from '../../lib/axios';
import ActionConfirmModal from '../../components/Modals/ActionConfirmModal';
import CareerGuidanceModal from '../../components/Admin/Modals/CareerGuidanceModal';
import './CareerGuidanceManagement.css';

const CareerGuidanceManagement = () => {
    const [activeView, setActiveView] = useState('crud'); // 'crud' or 'sql'
    const [guidances, setGuidances] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedGuidance, setSelectedGuidance] = useState(null);

    // Delete States
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    // SQL Executor States
    const [sqlQuery, setSqlQuery] = useState('');
    const [sqlExecuting, setSqlExecuting] = useState(false);
    const [sqlResult, setSqlResult] = useState(null);

    useEffect(() => {
        if (activeView === 'crud') {
            fetchGuidances();
        }
    }, [activeView]);

    const fetchGuidances = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/api/admin/career-guidance');
            setGuidances(response.data.data || []);
        } catch (error) {
            console.error('Error fetching career guidances:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (formData) => {
        if (modalMode === 'add') {
            await axiosClient.post('/api/admin/career-guidance', formData);
        } else {
            await axiosClient.put(`/api/admin/career-guidance/${selectedGuidance.id}`, formData);
        }
        fetchGuidances();
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        setIsDeleting(true);
        try {
            await axiosClient.delete(`/api/admin/career-guidance/${deleteModal.id}`);
            setGuidances(guidances.filter(g => g.id !== deleteModal.id));
            setDeleteModal({ isOpen: false, id: null, title: '' });
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Failed to delete record.');
        } finally {
            setIsDeleting(false);
        }
    };

    const executeSql = async () => {
        if (!sqlQuery.trim()) return;
        setSqlExecuting(true);
        setSqlResult(null);
        try {
            const response = await axiosClient.post('/api/admin/career-guidance/sql', { query: sqlQuery });
            setSqlResult({ type: 'success', data: response.data.data });
            if (response.data.type !== 'select') {
               // Refresh CRUD data implicitly in background if a mutation happened
               fetchGuidances();
            }
        } catch (error) {
            console.error('SQL Execution Error:', error);
            setSqlResult({ 
                type: 'error', 
                message: error.response?.data?.error || error.message || 'Execution failed' 
            });
        } finally {
            setSqlExecuting(false);
        }
    };

    const filteredGuidances = guidances.filter(g => {
        const term = searchTerm.toLowerCase();
        return (g.career_field?.toLowerCase() || '').includes(term) ||
               (g.career_category?.toLowerCase() || '').includes(term) ||
               (g.education_level?.toLowerCase() || '').includes(term);
    });

    return (
        <div className="cgm-page admin-category-scope">
            <div className="page-header mb-8">
                <div className="header-text">
                    <h1 className="text-2xl font-bold">Career Guidance</h1>
                    <p className="text-muted">Manage career paths, stats, and roadmap metadata</p>
                </div>
                {activeView === 'crud' && (
                    <button className="add-category-btn" onClick={() => { setModalMode('add'); setSelectedGuidance(null); setShowModal(true); }}>
                        <PlusCircle size={20} />
                        <span>Add New Path</span>
                    </button>
                )}
            </div>

            <div className="cgm-tabs">
                <button 
                    className={`cgm-tab-btn ${activeView === 'crud' ? 'active' : ''}`}
                    onClick={() => setActiveView('crud')}
                >
                    Standard Management
                </button>
                <button 
                    className={`cgm-tab-btn ${activeView === 'sql' ? 'active' : ''}`}
                    onClick={() => setActiveView('sql')}
                >
                    <Database size={16} /> SQL Executor
                </button>
            </div>

            <div className="admin-glass-card">
                {activeView === 'crud' ? (
                    <>
                        <div className="table-controls p-6">
                            <div className="search-box" style={{ maxWidth: '400px' }}>
                                <Search size={18} className="search-icon" />
                                <input
                                    type="text"
                                    placeholder="Search by field, category, or education..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="responsive-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th style={{ width: '60px' }}>ID</th>
                                        <th>Category</th>
                                        <th>Career Field</th>
                                        <th>Education Target</th>
                                        <th>Avg Salary (LKR)</th>
                                        <th className="text-center">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr><td colSpan="6" className="text-center p-12"><div className="loader mx-auto mb-4"></div><p className="text-muted">Loading data...</p></td></tr>
                                    ) : filteredGuidances.length === 0 ? (
                                        <tr><td colSpan="6" className="text-center p-12"><p className="text-muted">No records found.</p></td></tr>
                                    ) : (
                                        filteredGuidances.map((g) => (
                                            <tr key={g.id}>
                                                <td><span className="id-badge">#{g.id}</span></td>
                                                <td><span className="main-cat-badge">{g.career_category || 'N/A'}</span></td>
                                                <td className="font-semibold">{g.career_field}</td>
                                                <td>{g.education_level || '--'}</td>
                                                <td><span className="count-badge">{g.average_starting_salary_lkr || 'N/A'}</span></td>
                                                <td>
                                                    <div className="actions-cell">
                                                        <button
                                                            className="icon-btn edit"
                                                            title="Edit Record"
                                                            onClick={() => { setModalMode('edit'); setSelectedGuidance(g); setShowModal(true); }}
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            className="icon-btn delete"
                                                            title="Delete Record"
                                                            onClick={() => setDeleteModal({ isOpen: true, id: g.id, title: g.career_field })}
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="cgm-sql-container">
                        <div className="cgm-sql-header">
                            <h3>Raw SQL Executor</h3>
                            <p>Execute raw bulk queries (SELECT, UPDATE, INSERT, DELETE) directly against the `career_guidances` table. Note: DROP/ALTER queries are disabled for safety.</p>
                        </div>
                        
                        <textarea
                            className="cgm-sql-editor"
                            placeholder="e.g., UPDATE career_guidances SET global_demand_level = 'High' WHERE career_category = 'IT';"
                            value={sqlQuery}
                            onChange={(e) => setSqlQuery(e.target.value)}
                        />
                        
                        <div className="cgm-sql-actions">
                            <button 
                                className="cgm-sql-execute-btn" 
                                onClick={executeSql} 
                                disabled={sqlExecuting || !sqlQuery.trim()}
                            >
                                {sqlExecuting ? 'Executing...' : 'Execute Query'}
                            </button>
                        </div>

                        {sqlResult && (
                            <div className="cgm-sql-results">
                                {sqlResult.type === 'error' ? (
                                    <div className="cgm-sql-message error">{sqlResult.message}</div>
                                ) : (
                                    <>
                                        {sqlResult.data.type === 'execute' ? (
                                            <div className="cgm-sql-message success">{sqlResult.data.message}</div>
                                        ) : (
                                            <>
                                                <h4>Query Results ({sqlResult.data.data.length} rows)</h4>
                                                {sqlResult.data.data.length > 0 ? (
                                                    <div style={{ overflowX: 'auto' }}>
                                                        <table className="cgm-sql-results-table">
                                                            <thead>
                                                                <tr>
                                                                    {Object.keys(sqlResult.data.data[0]).map(key => (
                                                                        <th key={key}>{key}</th>
                                                                    ))}
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {sqlResult.data.data.map((row, i) => (
                                                                    <tr key={i}>
                                                                        {Object.values(row).map((val, j) => (
                                                                            <td key={j}>{val !== null ? String(val) : <i>null</i>}</td>
                                                                        ))}
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                ) : (
                                                    <p className="text-muted" style={{ padding: '1rem' }}>Query returned 0 rows.</p>
                                                )}
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <CareerGuidanceModal
                show={showModal}
                onClose={() => setShowModal(false)}
                mode={modalMode}
                guidanceData={selectedGuidance}
                onSave={handleSave}
            />

            <ActionConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, title: '' })}
                onConfirm={confirmDelete}
                isProcessing={isDeleting}
                title="Delete Career Guidance"
                message={`Are you sure you want to delete the path "${deleteModal.title}"? This action cannot be undone.`}
                confirmText="Yes, Delete"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
};

export default CareerGuidanceManagement;
