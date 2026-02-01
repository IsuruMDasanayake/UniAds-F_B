import React, { useState, useEffect } from 'react';
import {
    Search,
    Trash2,
    Eye,
    EyeOff,
    ExternalLink,
    MessageSquare,
    Clock,
    Building2,
    Heart,
    Calendar,
    MapPin,
    X,
    FileText,
    Filter
} from 'lucide-react';
import axiosClient from '../../lib/axios';
import ActionConfirmModal from '../../components/Modals/ActionConfirmModal';
import './PostManagement.css';

const PostManagement = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteModal, setDeleteModal] = useState({ isOpen: false, id: null, title: '' });
    const [selectedPost, setSelectedPost] = useState(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [institutes, setInstitutes] = useState([]);
    const [selectedInstitute, setSelectedInstitute] = useState('');

    const API_BASE_URL = 'http://localhost:8000';

    useEffect(() => {
        fetchPosts();
        fetchInstitutes();
    }, []);

    const fetchInstitutes = async () => {
        try {
            const response = await axiosClient.get('/api/institutions');
            setInstitutes(response.data);
        } catch (error) {
            console.error('Error fetching institutes:', error);
        }
    };

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/api/admin/posts');
            setPosts(response.data);
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const resp = await axiosClient.post(`/api/admin/posts/${id}/toggle-status`);
            setPosts(posts.map(p =>
                p.id === id ? { ...p, status: resp.data.status } : p
            ));
        } catch (error) {
            console.error('Error toggling post status:', error);
        }
    };

    const handleDeleteClick = (post) => {
        setDeleteModal({
            isOpen: true,
            id: post.id,
            title: post.title
        });
    };

    const confirmDelete = async () => {
        if (!deleteModal.id) return;
        setIsDeleting(true);
        try {
            await axiosClient.delete(`/api/admin/posts/${deleteModal.id}`);
            setPosts(posts.filter(p => p.id !== deleteModal.id));
            setDeleteModal({ isOpen: false, id: null, title: '' });
        } catch (error) {
            console.error('Error deleting post:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const openDetails = (post) => {
        setSelectedPost(post);
        setShowDetailsModal(true);
    };

    const filteredPosts = posts.filter(post => {
        const matchesSearch = (post.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (post.institute?.institute_name?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesInstitute = selectedInstitute === '' || post.institute_id === parseInt(selectedInstitute);

        return matchesSearch && matchesInstitute;
    });

    return (
        <div className="post-management-page admin-post-scope">
            <div className="page-header mb-8">
                <div className="header-text">
                    <h1 className="text-2xl font-bold">Post Management</h1>
                    <p className="text-muted">Review and moderate user-generated content</p>
                </div>
            </div>

            <div className="admin-glass-card table-container">
                <div className="table-controls p-6">
                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search posts or institutes..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="filter-box">
                        <Filter size={18} className="filter-icon" />
                        <select
                            className="admin-select"
                            value={selectedInstitute}
                            onChange={(e) => setSelectedInstitute(e.target.value)}
                        >
                            <option value="">All Institutes</option>
                            {institutes.map(inst => (
                                <option key={inst.id} value={inst.id}>
                                    {inst.institute_name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="responsive-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Post Content</th>
                                <th>Institute</th>
                                <th>Status</th>
                                <th className="text-center">Likes</th>
                                <th className="text-center">Views</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center p-12">
                                        <div className="loader mx-auto mb-4"></div>
                                        <p className="text-muted">Loading posts...</p>
                                    </td>
                                </tr>
                            ) : filteredPosts.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center p-12">
                                        <p className="text-muted">No posts found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredPosts.map((post) => (
                                    <tr key={post.id}>
                                        <td onClick={() => openDetails(post)} style={{ cursor: 'pointer' }}>
                                            <div className="post-cell">
                                                <div className="post-thumbnail">
                                                    {post.image ? <img src={`${API_BASE_URL}/storage/${post.image}`} alt="" /> : <FileText size={20} />}
                                                </div>
                                                <div className="post-meta">
                                                    <span className="post-title-text">{post.title}</span>
                                                    <span className="post-date-text">
                                                        <Clock size={12} /> {new Date(post.created_at).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="inst-cell">
                                                <Building2 size={14} className="text-muted" />
                                                <span>
                                                    {post.institute?.institute_name || (post.institute_id ? `Unknown ID: ${post.institute_id}` : 'Admin')}
                                                </span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${(post.status || '').toLowerCase()}`}>
                                                {post.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td className="text-center">
                                            <div className="likes-cell">
                                                <Heart size={14} className="text-red-500 fill-red-500" /> {post.likes_count || 0}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <div className="views-cell">
                                                {post.status === 'active' ? <Eye size={14} /> : <EyeOff size={14} />} {post.view_count || 0}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    className={`action-btn-sm ${post.status === 'active' ? 'activate' : 'deactivate'}`}
                                                    title={post.status === 'active' ? 'Deactivate Post' : 'Activate Post'}
                                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(post.id); }}
                                                >
                                                    {post.status === 'active' ? <Eye size={16} /> : <EyeOff size={16} />}
                                                </button>
                                                <button
                                                    className="action-btn-sm delete"
                                                    title="Delete Permanently"
                                                    onClick={(e) => { e.stopPropagation(); handleDeleteClick(post); }}
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

            {/* Post Details Modal */}
            {showDetailsModal && selectedPost && (
                <div className="post-details-modal-overlay" onClick={() => setShowDetailsModal(false)}>
                    <div className="post-details-modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Post Details</h2>
                            <button className="close-btn" onClick={() => setShowDetailsModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="post-details-grid">
                                <div className="post-image-section">
                                    {selectedPost.image ? (
                                        <img src={`${API_BASE_URL}/storage/${selectedPost.image}`} alt={selectedPost.title} />
                                    ) : (
                                        <div className="no-image-placeholder">
                                            <FileText size={48} />
                                            <span>No Image</span>
                                        </div>
                                    )}
                                </div>
                                <div className="post-info-section">
                                    <h3 className="post-title">{selectedPost.title}</h3>
                                    <div className="info-meta">
                                        <span className="info-item">
                                            <Building2 size={16} /> {selectedPost.institute?.institute_name || (selectedPost.institute_id ? `Unknown ID: ${selectedPost.institute_id}` : 'Admin')}
                                        </span>
                                        <span className="info-item">
                                            <Clock size={16} /> {new Date(selectedPost.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <div className="details-tags">
                                        <span className={`status-pill ${selectedPost.status}`}>
                                            {selectedPost.status === 'active' ? 'Active' : 'Inactive'}
                                        </span>
                                        <span className="tag-item">
                                            <Heart size={14} className="fill-red-500 text-red-500" /> {selectedPost.likes_count || 0} Likes
                                        </span>
                                        <span className="tag-item">
                                            <Eye size={14} /> {selectedPost.view_count || 0} Views
                                        </span>
                                    </div>

                                    <div className="description-box">
                                        <h4>Small Description</h4>
                                        <p>{selectedPost.small_description}</p>
                                    </div>

                                    <div className="post-attributes">
                                        <div className="attr-item">
                                            <span className="attr-label">Course Name:</span>
                                            <span className="attr-value">{selectedPost.course_name}</span>
                                        </div>
                                        <div className="attr-item">
                                            <span className="attr-label">Course Type:</span>
                                            <span className="attr-value">{selectedPost.course_type}</span>
                                        </div>
                                        <div className="attr-item">
                                            <span className="attr-label">Location:</span>
                                            <span className="attr-value">{selectedPost.location}</span>
                                        </div>
                                        <div className="attr-item">
                                            <span className="attr-label">Duration:</span>
                                            <span className="attr-value">{selectedPost.duration}</span>
                                        </div>
                                        <div className="attr-item">
                                            <span className="attr-label">Format:</span>
                                            <span className="attr-value">{selectedPost.course_format}</span>
                                        </div>
                                        <div className="attr-item">
                                            <span className="attr-label">Attendance:</span>
                                            <span className="attr-value">{selectedPost.attendance_type}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="full-description mt-6">
                                <h4>Full Description</h4>
                                <div className="description-content" dangerouslySetInnerHTML={{ __html: selectedPost.description }}></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <ActionConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
                onConfirm={confirmDelete}
                title="Delete Post"
                message={`Are you sure you want to delete "${deleteModal.title}"? This action cannot be undone.`}
                confirmText="Delete"
                variant="danger"
                isLoading={isDeleting}
            />
        </div>
    );
};

export default PostManagement;
