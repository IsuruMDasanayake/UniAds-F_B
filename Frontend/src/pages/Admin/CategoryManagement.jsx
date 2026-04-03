import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Check,
    X,
    Filter,
    PlusCircle
} from 'lucide-react';
import { toast } from 'sonner';
import axiosClient from '../../lib/axios';
import ActionConfirmModal from '../../components/Modals/ActionConfirmModal';
import './CategoryManagement.css';

// FontAwesome Icon List
const ICON_LIST = [
    // Education & Learning
    'fas fa-book', 'fas fa-graduation-cap', 'fas fa-chalkboard-teacher', 'fas fa-school', 'fas fa-university',
    'fas fa-laptop-code', 'fas fa-pencil-alt', 'fas fa-certificate', 'fas fa-user-graduate', 'fas fa-shapes',
    'fas fa-book-reader', 'fas fa-book-open', 'fas fa-drafting-compass', 'fas fa-microscope', 'fas fa-atom',
    'fas fa-brain', 'fas fa-calculator', 'fas fa-globe-americas', 'fas fa-flask', 'fas fa-dna',

    // Business & Finance
    'fas fa-briefcase', 'fas fa-building', 'fas fa-chart-line', 'fas fa-chart-pie', 'fas fa-chart-bar',
    'fas fa-coins', 'fas fa-credit-card', 'fas fa-donate', 'fas fa-dollar-sign', 'fas fa-euro-sign',
    'fas fa-file-invoice', 'fas fa-file-invoice-dollar', 'fas fa-hand-holding-usd', 'fas fa-landmark', 'fas fa-money-bill-wave',
    'fas fa-percentage', 'fas fa-piggy-bank', 'fas fa-receipt', 'fas fa-store', 'fas fa-wallet',

    // Technology & Development
    'fas fa-code', 'fas fa-desktop', 'fas fa-mobile-alt', 'fas fa-robot', 'fas fa-database',
    'fas fa-bug', 'fas fa-code-branch', 'fas fa-keyboard', 'fas fa-laptop', 'fas fa-microchip',
    'fas fa-network-wired', 'fas fa-power-off', 'fas fa-save', 'fas fa-server', 'fas fa-signal',
    'fas fa-stream', 'fas fa-terminal', 'fas fa-upload', 'fas fa-wifi', 'fas fa-gamepad',

    // Design & Multimedia
    'fas fa-paint-brush', 'fas fa-palette', 'fas fa-pen-nib', 'fas fa-image', 'fas fa-camera',
    'fas fa-video', 'fas fa-film', 'fas fa-music', 'fas fa-headphones', 'fas fa-microphone',
    'fas fa-sliders-h', 'fas fa-vector-square', 'fas fa-layer-group', 'fas fa-magic', 'fas fa-swatchbook',

    // Marketing & Communication
    'fas fa-bullhorn', 'fas fa-ad', 'fas fa-comments', 'fas fa-envelope', 'fas fa-share-alt',
    'fas fa-thumbs-up', 'fas fa-star', 'fas fa-heart', 'fas fa-bell', 'fas fa-rss',
    'fas fa-hashtag', 'fas fa-at', 'fas fa-paper-plane', 'fas fa-phone', 'fas fa-address-card',

    // Metadata & Time
    'fas fa-clock', 'fas fa-calendar-alt', 'fas fa-calendar-check', 'fas fa-hourglass-half', 'fas fa-stopwatch',
    'fas fa-history', 'fas fa-map-marker-alt', 'fas fa-map', 'fas fa-location-arrow', 'fas fa-tags',
    'fas fa-flag', 'fas fa-filter', 'fas fa-sort', 'fas fa-sort-amount-down', 'fas fa-sort-amount-up',

    // User & Management
    'fas fa-user', 'fas fa-users', 'fas fa-user-cog', 'fas fa-user-shield', 'fas fa-user-tie',
    'fas fa-id-badge', 'fas fa-id-card', 'fas fa-key', 'fas fa-lock', 'fas fa-unlock',
    'fas fa-cog', 'fas fa-wrench', 'fas fa-tools', 'fas fa-shield-alt', 'fas fa-user-check',

    // Files & Office
    'fas fa-file', 'fas fa-file-alt', 'fas fa-file-pdf', 'fas fa-file-word', 'fas fa-file-excel',
    'fas fa-folder', 'fas fa-folder-open', 'fas fa-paperclip', 'fas fa-paste', 'fas fa-print',
    'fas fa-archive', 'fas fa-box', 'fas fa-boxes', 'fas fa-clipboard', 'fas fa-clipboard-check',

    // Health & Medical
    'fas fa-heartbeat', 'fas fa-medkit', 'fas fa-hospital', 'fas fa-user-md', 'fas fa-stethoscope',
    'fas fa-pills', 'fas fa-syringe', 'fas fa-ambulance', 'fas fa-notes-medical', 'fas fa-file-medical',

    // Transport & Logistics
    'fas fa-car', 'fas fa-bus', 'fas fa-truck', 'fas fa-plane', 'fas fa-ship',
    'fas fa-bicycle', 'fas fa-motorcycle', 'fas fa-taxi', 'fas fa-subway', 'fas fa-train',
    'fas fa-shipping-fast', 'fas fa-dolly', 'fas fa-pallet', 'fas fa-route', 'fas fa-traffic-light',

    // Social & Brands
    'fab fa-facebook', 'fab fa-twitter', 'fab fa-linkedin', 'fab fa-instagram', 'fab fa-youtube',
    'fab fa-github', 'fab fa-whatsapp', 'fab fa-google', 'fab fa-apple', 'fab fa-android',
    'fab fa-windows', 'fab fa-aws', 'fab fa-docker', 'fab fa-figma', 'fab fa-slack',

    // UI & Arrows
    'fas fa-check-circle', 'fas fa-times-circle', 'fas fa-exclamation-circle', 'fas fa-info-circle', 'fas fa-question-circle',
    'fas fa-arrow-right', 'fas fa-arrow-left', 'fas fa-chevron-right', 'fas fa-chevron-up', 'fas fa-caret-down',
    'fas fa-search', 'fas fa-home', 'fas fa-trash', 'fas fa-edit', 'fas fa-plus',
    'fas fa-minus', 'fas fa-bars', 'fas fa-ellipsis-h', 'fas fa-ellipsis-v', 'fas fa-external-link-alt'
];

const CategoryModal = ({ show, onClose, mode, categoryData, onSave }) => {
    const [formData, setFormData] = useState({
        main_category: 'Courses',
        name: '',
        icon: 'fas fa-book'
    });
    const [saving, setSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (categoryData && mode === 'edit') {
            setFormData({
                main_category: categoryData.main_category || 'Courses',
                name: categoryData.name || '',
                icon: categoryData.icon || 'fas fa-book'
            });
        } else {
            setFormData({
                main_category: 'Courses',
                name: '',
                icon: 'fas fa-book'
            });
        }
    }, [categoryData, mode, show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error(error);
        } finally {
            setSaving(false);
        }
    };

    const filteredIcons = ICON_LIST.filter(icon => icon.includes(searchTerm.toLowerCase()));

    if (!show) return null;

    return (
        <div className="cat-mgmt-modal-overlay">
            <div className="cat-mgmt-modal-content admin-glass-card">
                <div className="cat-mgmt-modal-header">
                    <h2>{mode === 'add' ? 'Add New Category' : 'Edit Category'}</h2>
                    <button className="cat-mgmt-close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="cat-mgmt-modal-body-scroll">
                        <div className="cat-mgmt-form-group">
                            <label>Main Category</label>
                            <select
                                value={formData.main_category}
                                onChange={(e) => setFormData({ ...formData, main_category: e.target.value })}
                            >
                                <option value="Courses">Courses</option>
                                <option value="Course Type">Course Type</option>
                                <option value="Location">Location</option>
                                <option value="Duration">Duration</option>
                                <option value="Course Format">Course Format</option>
                                <option value="Attendance Type">Attendance Type</option>
                            </select>
                        </div>

                        <div className="cat-mgmt-form-group">
                            <label>Category Name</label>
                            <input
                                type="text"
                                placeholder="Enter category name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="cat-mgmt-form-group">
                            <label>Select Icon</label>
                            <div className="cat-mgmt-icon-selection-controls">
                                <div className="cat-mgmt-icon-search-wrapper">
                                    <Search className="cat-mgmt-search-icon-pos" size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', pointerEvents: 'none' }} />
                                    <input
                                        type="text"
                                        placeholder="Search icons..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="cat-mgmt-icon-search"
                                    />
                                </div>
                                <div className="cat-mgmt-icon-preview-box">
                                    <div className="cat-mgmt-selected-icon-preview">
                                        <i className={formData.icon}></i>
                                    </div>
                                </div>
                            </div>

                            <div className="cat-mgmt-icon-grid">
                                {filteredIcons.map((icon) => (
                                    <div
                                        key={icon}
                                        className={`cat-mgmt-icon-item ${formData.icon === icon ? 'selected' : ''}`}
                                        onClick={() => setFormData({ ...formData, icon })}
                                        title={icon}
                                    >
                                        <i className={icon}></i>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="cat-mgmt-modal-actions">
                        <button type="button" className="cat-mgmt-cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="cat-mgmt-submit-btn" disabled={saving}>
                            {saving ? 'Saving...' : (mode === 'add' ? 'Create Category' : 'Update Category')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Modal States
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [selectedCategory, setSelectedCategory] = useState(null);

    // Delete States
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, name: '' });
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/api/admin/categories');
            setCategories(response.data.data || []);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (formData) => {
        try {
            if (modalMode === 'add') {
                await axiosClient.post('/api/admin/categories', formData);
                toast.success('Category created successfully!');
            } else {
                await axiosClient.put(`/api/admin/categories/${selectedCategory.id}`, formData);
                toast.success('Category updated successfully!');
            }
            setShowModal(false);
            fetchCategories();
        } catch (error) {
            console.error('Error saving category:', error);
            toast.error('Failed to save category.');
            throw error; // Re-throw for modal 'saving' state
        }
    };

    const handleDeleteClick = (category) => {
        setDeleteModal({ isOpen: true, id: category.id, name: category.name });
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        setIsDeleting(true);
        try {
            await axiosClient.delete(`/api/admin/categories/${deleteModal.id}`);
            setCategories(categories.filter(cat => cat.id !== deleteModal.id));
            toast.success('Category deleted successfully.');
            setDeleteModal({ isOpen: false, id: null, name: '' });
        } catch (error) {
            console.error('Error deleting category:', error);
            const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to delete category.';
            toast.error(errorMessage);
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredCategories = categories.filter(cat => {
        const matchesSearch = (cat.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (cat.main_category?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesFilter = categoryFilter === 'All' || cat.main_category === categoryFilter;

        return matchesSearch && matchesFilter;
    });

    return (
        <div className="category-management-page admin-category-scope">
            <div className="page-header mb-8">
                <div className="header-text">
                    <h1 className="text-2xl font-bold">Category Management</h1>
                    <p className="text-muted">Organize content structure and tags</p>
                </div>
                <button
                    className="add-category-btn"
                    onClick={() => { setModalMode('add'); setSelectedCategory(null); setShowModal(true); }}
                >
                    <PlusCircle size={20} />
                    <span>New Category</span>
                </button>
            </div>

            <div className="admin-glass-card table-container">
                <div className="table-controls p-6">
                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-box">
                        <Filter size={18} className="filter-icon" />
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="category-filter-select"
                        >
                            <option value="All">All Categories</option>
                            <option value="Courses">Courses</option>
                            <option value="Course Type">Course Type</option>
                            <option value="Location">Location</option>
                            <option value="Duration">Duration</option>
                            <option value="Course Format">Course Format</option>
                            <option value="Attendance Type">Attendance Type</option>
                        </select>
                    </div>
                </div>

                <div className="responsive-table">
                    <table>
                        <thead>
                            <tr>
                                <th style={{ width: '60px' }}>ID</th>
                                <th>Main Category</th>
                                <th>Name</th>
                                <th className="text-center">Posts Count</th>
                                <th className="text-center">Icon</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center p-12">
                                        <div className="loader mx-auto mb-4"></div>
                                        <p className="text-muted">Loading categories...</p>
                                    </td>
                                </tr>
                            ) : filteredCategories.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center p-12">
                                        <p className="text-muted">No categories found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredCategories.map((cat) => (
                                    <tr key={cat.id}>
                                        <td><span className="id-badge">#{cat.id}</span></td>
                                        <td>
                                            <span className="main-cat-badge">{cat.main_category}</span>
                                        </td>
                                        <td className="font-semibold">{cat.name}</td>
                                        <td className="text-center">
                                            <span className="count-badge">{cat.posts_count || 0}</span>
                                        </td>
                                        <td className="text-center">
                                            <div className="cat-icon-display">
                                                <i className={cat.icon}></i>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    className="icon-btn edit"
                                                    title="Edit Category"
                                                    onClick={() => { setModalMode('edit'); setSelectedCategory(cat); setShowModal(true); }}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="icon-btn delete"
                                                    title="Delete Category"
                                                    onClick={() => handleDeleteClick(cat)}
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

            <CategoryModal
                show={showModal}
                onClose={() => setShowModal(false)}
                mode={modalMode}
                categoryData={selectedCategory}
                onSave={handleSave}
            />

            <ActionConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                onConfirm={confirmDelete}
                isProcessing={isDeleting}
                title="Delete Category"
                message={`Are you sure you want to delete "${deleteModal.name}"? This could affect existing courses and posts associated with it.`}
                confirmText="Yes, Delete"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
};

export default CategoryManagement;
