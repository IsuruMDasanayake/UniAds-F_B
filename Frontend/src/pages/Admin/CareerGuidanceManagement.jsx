import React, { useState, useEffect } from 'react';
import { PlusCircle, Search, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import axiosClient from '../../lib/axios';
import ActionConfirmModal from '../../components/Modals/ActionConfirmModal';
import CareerGuidanceModal from '../../components/Admin/Modals/CareerGuidanceModal';
import './CareerGuidanceManagement.css';

const CareerGuidanceManagement = () => {
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



    useEffect(() => {
        fetchGuidances();
    }, []);

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
        try {
            if (modalMode === 'add') {
                await axiosClient.post('/api/admin/career-guidance', formData);
                toast.success('New career path added successfully!');
            } else {
                await axiosClient.put(`/api/admin/career-guidance/${selectedGuidance.id}`, formData);
                toast.success('Career path updated successfully!');
            }
            setShowModal(false);
            fetchGuidances();
        } catch (error) {
            console.error('Error saving career guidance:', error);
            toast.error('Failed to save career guidance.');
        }
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        setIsDeleting(true);
        try {
            await axiosClient.delete(`/api/admin/career-guidance/${deleteModal.id}`);
            setGuidances(guidances.filter(g => g.id !== deleteModal.id));
            toast.success('Career path deleted.');
            setDeleteModal({ isOpen: false, id: null, title: '' });
        } catch (error) {
            console.error('Error deleting:', error);
            toast.error('Failed to delete record.');
        } finally {
            setIsDeleting(false);
        }
    };



    const filteredGuidances = guidances.filter(g => {
        const term = searchTerm.toLowerCase();
        return (g.career_field?.toLowerCase() || '').includes(term) ||
               (g.category?.toLowerCase() || '').includes(term) ||
               (g.education_level?.toLowerCase() || '').includes(term);
    });

    return (
        <div className="cgm-page admin-category-scope">
            <div className="page-header mb-8">
                <div className="header-text">
                    <h1 className="text-2xl font-bold">Career Guidance</h1>
                    <p className="text-muted">Manage career paths, stats, and roadmap metadata</p>
                </div>
                <button className="add-category-btn" onClick={() => { setModalMode('add'); setSelectedGuidance(null); setShowModal(true); }}>
                    <PlusCircle size={20} />
                    <span>Add New Path</span>
                </button>
            </div>

            <div className="cgm-tabs">
                <button 
                    className={`cgm-tab-btn active`}
                >
                    Standard Management
                </button>
            </div>

            <div className="admin-glass-card">
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
                                                <td><span className="main-cat-badge">{g.category || 'N/A'}</span></td>
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
