import React, { useEffect, useState } from 'react';
import axiosClient from '../../lib/axios';
import DataTable from '../../components/Analytics/DataTable';
import { BadgeCheck, Ban, Eye, FileText, Image as ImageIcon } from 'lucide-react';
import { getStorageUrl } from '../../lib/config';
import './PostsAnalyticsPage.css';

const PostsAnalyticsPage = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({});

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchPosts();
        }, 500);
        return () => clearTimeout(timer);
    }, [search, page]);

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const { data } = await axiosClient.get(`/api/institute/analytics/posts?page=${page}&search=${search}`);
            setPosts(data.data);
            setPagination({
                current_page: data.current_page,
                last_page: data.last_page,
                from: data.from,
                to: data.to,
                total: data.total,
                prev_page_url: data.prev_page_url,
                next_page_url: data.next_page_url,
            });
        } catch (error) {
            console.error('Error fetching posts:', error);
        } finally {
            setLoading(false);
        }
    };

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
            // Revert on error
            fetchPosts();
        }
    };

    const columns = [
        {
            header: 'Title',
            accessor: 'title',
            render: (row) => (
                <div className="cell-content-wrapper">
                    <div className="post-thumbnail-wrapper">
                        {row.media_url ? (
                            <img
                                src={getStorageUrl(row.media_url)}
                                alt=""
                                className="post-thumbnail"
                            />
                        ) : (
                            <div className="post-placeholder">
                                <ImageIcon size={20} />
                            </div>
                        )}
                    </div>
                    <span className="post-title">{row.title}</span>
                </div>
            )
        },
        {
            header: 'Views',
            accessor: 'views_count',
            render: (row) => (
                <div className="flex items-center gap-1 text-slate-600">
                    <Eye size={16} />
                    <span>{row.views_count}</span>
                </div>
            )
        },
        {
            header: 'Applications',
            accessor: 'applications_count',
            render: (row) => (
                <div className="flex items-center gap-1 text-slate-600">
                    <FileText size={16} />
                    <span>{row.applications_count}</span>
                </div>
            )
        },
        {
            header: 'Created',
            accessor: 'created_at',
            render: (row) => new Date(row.created_at).toLocaleDateString()
        },
        {
            header: 'Status',
            accessor: 'status',
            render: (row) => (
                <span className={`status-badge ${row.status === 'active' ? 'status-active' : 'status-inactive'}`}>
                    {row.status}
                </span>
            )
        },
        {
            header: 'Actions',
            render: (row) => (
                <div className="action-buttons">
                    <button
                        onClick={() => handleToggleStatus(row.id, row.status)}
                        className="action-btn toggle"
                        title={row.status === 'active' ? "Deactivate" : "Activate"}
                    >
                        {row.status === 'active' ? <Ban size={18} /> : <BadgeCheck size={18} />}
                    </button>
                    {/* Edit/Delete buttons can be added here */}
                </div>
            )
        }
    ];

    return (
        <div id="analytics-posts-page">
            <div className="page-header">
                <h1 className="page-title">Course Posts</h1>
                <p className="page-subtitle">Manage your posts and view performance.</p>
            </div>

            <DataTable
                columns={columns}
                data={posts}
                pagination={pagination}
                onPageChange={setPage}
                searchQuery={search}
                onSearchChange={setSearch}
                loading={loading}
            />
        </div>
    );
};

export default PostsAnalyticsPage;
