import React, { useState, useEffect } from 'react';
import {
    Search,
    Trash2,
    Eye,
    EyeOff,
    ExternalLink,
    MessageSquare,
    Clock,
    Building2
} from 'lucide-react';
import axiosClient from '../../lib/axios';
import './PostManagement.css';

const PostManagement = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchPosts();
    }, []);

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

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this post permanently?')) {
            try {
                await axiosClient.delete(`/api/admin/posts/${id}`);
                setPosts(posts.filter(p => p.id !== id));
            } catch (error) {
                console.error('Error deleting post:', error);
            }
        }
    };

    const filteredPosts = posts.filter(post =>
        (post.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (post.institute?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

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
                </div>

                <div className="responsive-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Post Content</th>
                                <th>Institute</th>
                                <th>Status</th>
                                <th>Views</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center p-12">
                                        <div className="loader mx-auto mb-4"></div>
                                        <p className="text-muted">Loading posts...</p>
                                    </td>
                                </tr>
                            ) : filteredPosts.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center p-12">
                                        <p className="text-muted">No posts found.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredPosts.map((post) => (
                                    <tr key={post.id}>
                                        <td>
                                            <div className="post-cell">
                                                <div className="post-thumbnail">
                                                    {post.image ? <img src={`/storage/${post.image}`} alt="" /> : <FileText size={20} />}
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
                                                <span>{post.institute?.name || 'Admin'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-pill ${(post.status || '').toLowerCase()}`}>
                                                {post.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="views-cell">
                                                <Eye size={14} /> {post.view_count || 0}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="actions-cell">
                                                <button
                                                    className={`action-btn-sm ${post.status === 'active' ? 'deactivate' : 'activate'}`}
                                                    title={post.status === 'active' ? 'Deactivate Post' : 'Activate Post'}
                                                    onClick={() => handleToggleStatus(post.id)}
                                                >
                                                    {post.status === 'active' ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                                <button
                                                    className="action-btn-sm delete"
                                                    title="Delete Permanently"
                                                    onClick={() => handleDelete(post.id)}
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
        </div>
    );
};

export default PostManagement;
