import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    Edit2,
    Trash2,
    Layers,
    Check,
    X,
    PlusCircle
} from 'lucide-react';
import axiosClient from '../../lib/axios';
import './CategoryManagement.css';

const CategoryManagement = () => {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [currentCategory, setCurrentCategory] = useState({ name: '' });

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/api/admin/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        try {
            if (isEditing) {
                await axiosClient.put(`/api/admin/categories/${currentCategory.id}`, currentCategory);
                setCategories(categories.map(cat => cat.id === currentCategory.id ? currentCategory : cat));
            } else {
                const response = await axiosClient.post('/api/admin/categories', currentCategory);
                setCategories([...categories, response.data.data]);
            }
            setShowModal(false);
            setCurrentCategory({ name: '' });
        } catch (error) {
            console.error('Error saving category:', error);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure? Deleting a category might affect related posts.')) {
            try {
                await axiosClient.delete(`/api/admin/categories/${id}`);
                setCategories(categories.filter(cat => cat.id !== id));
            } catch (error) {
                console.error('Error deleting category:', error);
            }
        }
    };

    const filteredCategories = categories.filter(cat =>
        (cat.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="category-management-page admin-category-scope">
            <div className="page-header mb-8">
                <div className="header-text">
                    <h1 className="text-2xl font-bold">Category Management</h1>
                    <p className="text-muted">Organize content structure and tags</p>
                </div>
                <button className="add-category-btn" onClick={() => { setIsEditing(false); setCurrentCategory({ name: '' }); setShowModal(true); }}>
                    <PlusCircle size={20} />
                    <span>New Category</span>
                </button>
            </div>

            <div className="admin-glass-card p-6">
                <div className="table-controls mb-6">
                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search categories..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="category-list">
                    {loading ? (
                        <div className="text-center p-12">
                            <div className="loader mx-auto mb-4"></div>
                            <p className="text-muted">Loading categories...</p>
                        </div>
                    ) : filteredCategories.length === 0 ? (
                        <div className="text-center p-12">
                            <p className="text-muted">No categories found.</p>
                        </div>
                    ) : (
                        <div className="category-grid">
                            {filteredCategories.map(cat => (
                                <div key={cat.id} className="category-card">
                                    <div className="cat-info">
                                        <div className="cat-icon-box">
                                            <Layers size={20} />
                                        </div>
                                        <span className="cat-name">{cat.name}</span>
                                    </div>
                                    <div className="cat-actions">
                                        <button
                                            className="cat-action-btn edit"
                                            onClick={() => { setIsEditing(true); setCurrentCategory(cat); setShowModal(true); }}
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            className="cat-action-btn delete"
                                            onClick={() => handleDelete(cat.id)}
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="admin-glass-card modal-content p-8">
                        <h2 className="text-xl font-bold mb-6">{isEditing ? 'Edit Category' : 'Create Category'}</h2>
                        <form onSubmit={handleSave}>
                            <div className="form-group mb-6">
                                <label className="text-sm text-muted mb-2 block">Category Name</label>
                                <input
                                    type="text"
                                    autoFocus
                                    required
                                    className="modal-input"
                                    placeholder="Enter category name..."
                                    value={currentCategory.name}
                                    onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
                                />
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn-save">
                                    {isEditing ? 'Save Changes' : 'Create Category'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagement;
