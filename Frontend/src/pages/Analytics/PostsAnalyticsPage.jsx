import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../../lib/axios';
import DataTable from '../../components/Analytics/DataTable';
import { BadgeCheck, Ban, Eye, FileText, Image as ImageIcon, ChevronRight, Edit3, Heart, Trash2 } from 'lucide-react';
import { getStorageUrl } from '../../lib/config';

// Modals
import ProgrammeInfoModal from '../../components/Modals/ProgrammeInfoModal';
import EditPostModal from '../../components/Modals/EditPostModal';
import DeleteConfirmModal from '../../components/Modals/DeleteConfirmModal';

// Components
import PostsStatCards from '../../components/Analytics/PostsStatCards';
import PostsTableCard from '../../components/Analytics/PostsTableCard';
import SkeletonTable from '../../components/Analytics/SkeletonTable';
import EmptyState from '../../components/Analytics/EmptyState';

// Styling
import './PostsAnalyticsPage.css';

const PostsAnalyticsPage = () => {
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    // Filters
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('all');
    const [pagination, setPagination] = useState({});

    // Modal States
    const [selectedPost, setSelectedPost] = useState(null);
    const [infoModalOpen, setInfoModalOpen] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchPosts = useCallback(async (isInitial = false) => {
        if (isInitial) setLoading(true);
        else setIsUpdating(true);

        try {
            const { data } = await axiosClient.get(`/api/institute/analytics/posts`, {
                params: { page, search, status }
            });

            // Handle enhanced API response
            const postsData = data.posts || data; // Fallback for old API if cached
            const statsData = data.stats || null;

            setPosts(postsData.data || []);
            setStats(statsData);
            setPagination({
                current_page: postsData.current_page,
                last_page: postsData.last_page,
                from: postsData.from,
                to: postsData.to,
                total: postsData.total
            });
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
            setIsUpdating(false);
        }
    }, [page, search, status]);

    // Effect for search/status change (with debounce for search)
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPosts(!posts.length);
        }, search ? 500 : 0);
        return () => clearTimeout(timer);
    }, [search, status, page, fetchPosts]);

    const handleToggleStatus = async (id, currentStatus) => {
        // Optimistic update
        const updatedPosts = posts.map(p =>
            p.id === id ? { ...p, status: currentStatus === 'active' ? 'inactive' : 'active' } : p
        );
        setPosts(updatedPosts);

        try {
            await axiosClient.patch(`/api/institute/posts/${id}/status`);
        } catch (error) {
            console.error('Error toggling status:', error);
            fetchPosts(); // Revert on error
        }
    };

    const handleRowClick = (post) => {
        setSelectedPost(post);
        setInfoModalOpen(true);
    };

    const handleEditClick = (e, post) => {
        e.stopPropagation();
        setSelectedPost(post);
        setEditModalOpen(true);
    };

    const handleDeleteClick = (e, post) => {
        e.stopPropagation();
        setSelectedPost(post);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedPost) return;
        setIsDeleting(true);
        try {
            await axiosClient.delete(`/api/institute/analytics/posts/${selectedPost.id}`);
            setDeleteModalOpen(false);
            fetchPosts(); // Refresh list
        } catch (error) {
            console.error('Error deleting post:', error);
            alert('Failed to delete post. Please try again.');
        } finally {
            setIsDeleting(false);
        }
    };

    const handlePostUpdated = (updatedPost) => {
        setPosts(prev => prev.map(p => p.id === updatedPost.id ? { ...p, ...updatedPost } : p));
        // Also refresh stats if necessary
    };

    const columns = [
        {
            header: 'Course Information',
            accessor: 'title',
            render: (row) => (
                <div className="cell-content-wrapper">
                    <div className="post-thumbnail-wrapper">
                        {row.image ? (
                            <img
                                src={getStorageUrl(row.image)}
                                alt=""
                                className="post-thumbnail"
                                onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = '/images/default-course.jpg';
                                }}
                            />
                        ) : (
                            <div className="post-placeholder">
                                <ImageIcon size={20} />
                            </div>
                        )}
                    </div>
                    <div className="post-info-meta">
                        <span className="post-title" title={row.title}>{row.title}</span>
                        <span className="post-date">Posted on {new Date(row.created_at).toLocaleDateString()}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'Views',
            accessor: 'views_count',
            render: (row) => (
                <div className="metric-cell">
                    <div className="metric-icon blue"><Eye size={14} /></div>
                    <span className="metric-value">{row.view_count || row.views_count || 0}</span>
                </div>
            )
        },
        {
            header: 'Applications',
            accessor: 'applications_count',
            render: (row) => (
                <div className="metric-cell">
                    <div className="metric-icon amber"><FileText size={14} /></div>
                    <span className="metric-value">{row.applications_count || 0}</span>
                </div>
            )
        },
        {
            header: 'Likes',
            accessor: 'likes_count',
            render: (row) => (
                <div className="metric-cell">
                    <div className="metric-icon red"><Heart size={14} /></div>
                    <span className="metric-value">{row.likes_count || 0}</span>
                </div>
            )
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className={`status-badge-v2 ${row.status === 'active' ? 'active' : 'inactive'}`}>
                    <span className="dot"></span>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="action-buttons-v2" onClick={(e) => e.stopPropagation()}>
                    <button
                        onClick={() => handleToggleStatus(row.id, row.status)}
                        className={`action-btn-v2 ${row.status === 'active' ? 'deactivate' : 'activate'}`}
                        title={row.status === 'active' ? "Deactivate Post" : "Activate Post"}
                    >
                        {row.status === 'active' ? <Ban size={18} /> : <BadgeCheck size={18} />}
                    </button>
                    <button
                        className="action-btn-v2 edit"
                        title="Edit Post"
                        onClick={(e) => handleEditClick(e, row)}
                    >
                        <Edit3 size={18} />
                    </button>
                    <button
                        className="action-btn-v2 delete"
                        title="Delete Post"
                        onClick={(e) => handleDeleteClick(e, row)}
                    >
                        <Trash2 size={18} />
                    </button>
                </div>
            )
        }
    ];

    return (
        <div id="analytics-posts" className={isUpdating ? 'updating' : ''}>
            {/* Header section (Redesigned) */}
            <header className="posts-header-v2">
                <div className="header-content">
                    <h1 className="posts-page-title">Course Posts</h1>
                    <p className="posts-page-subtitle">Manage posts and analyze performance across your institute.</p>
                </div>
            </header>

            {/* Stat Cards */}
            <PostsStatCards stats={stats} loading={loading} />

            {/* Main Table Card */}
            <PostsTableCard
                search={search}
                onSearchChange={(val) => { setSearch(val); setPage(1); }}
                status={status}
                onStatusChange={(val) => { setStatus(val); setPage(1); }}
                totalPosts={pagination.total || 0}
            >
                <div className="table-responsive-wrapper">
                    {loading ? (
                        <SkeletonTable rows={5} cols={5} />
                    ) : posts.length > 0 ? (
                        <DataTable
                            columns={columns}
                            data={posts}
                            pagination={pagination}
                            onPageChange={setPage}
                            loading={isUpdating}
                            showSearch={false}
                            onRowClick={handleRowClick}
                        />
                    ) : (
                        <EmptyState search={search} status={status} />
                    )}
                </div>
            </PostsTableCard>

            {/* Modal Components */}
            <ProgrammeInfoModal
                isOpen={infoModalOpen}
                onClose={() => setInfoModalOpen(false)}
                course={selectedPost}
                userRole="Institute" // Or get from auth context
            />

            <EditPostModal
                isOpen={editModalOpen}
                onClose={() => setEditModalOpen(false)}
                post={selectedPost}
                onUpdate={handlePostUpdated}
            />

            <DeleteConfirmModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleConfirmDelete}
                isDeleting={isDeleting}
                title={selectedPost?.title}
            />
        </div>
    );
};

export default PostsAnalyticsPage;
