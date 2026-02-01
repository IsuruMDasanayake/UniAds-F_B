import React, { useState, useEffect } from 'react';
import {
    Search,
    UserPlus,
    MoreVertical,
    Edit2,
    Trash2,
    Shield,
    User as UserIcon,
    Filter,
    Check,
    X
} from 'lucide-react';
import axiosClient from '../../lib/axios';
import './UserManagement.css';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const response = await axiosClient.get('/api/admin/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = users.filter(user => {
        const nameMatch = (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const emailMatch = (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesSearch = nameMatch || emailMatch;
        const matchesRole = roleFilter === 'All' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleDelete = async (userId) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            try {
                await axiosClient.delete(`/api/admin/users/${userId}`);
                setUsers(users.filter(u => u.id !== userId));
            } catch (error) {
                console.error('Error deleting user:', error);
            }
        }
    };

    return (
        <div className="user-management-page admin-user-scope">
            <div className="page-header mb-8">
                <div className="header-text">
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <p className="text-muted">Manage system users and their permissions</p>
                </div>
                <button className="add-user-btn" onClick={() => { setSelectedUser(null); setShowModal(true); }}>
                    <UserPlus size={20} />
                    <span>Add New User</span>
                </button>
            </div>

            <div className="admin-glass-card table-container">
                <div className="table-controls p-6">
                    <div className="search-box">
                        <Search size={18} className="search-icon" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="filter-box">
                        <Filter size={18} className="filter-icon" />
                        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
                            <option value="All">All Roles</option>
                            <option value="Admin">Admin</option>
                            <option value="Institute">Institute</option>
                            <option value="User">Regular User</option>
                        </select>
                    </div>
                </div>

                <div className="responsive-table">
                    <table>
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Status</th>
                                <th>Joined Date</th>
                                <th className="text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center p-12">
                                        <div className="loader mx-auto mb-4"></div>
                                        <p className="text-muted">Fetching users...</p>
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center p-12">
                                        <p className="text-muted">No users found matching your criteria.</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td>
                                            <div className="user-cell">
                                                <div className="user-avatar-sm">
                                                    {user.role === 'Admin' ? <Shield size={16} /> : <UserIcon size={16} />}
                                                </div>
                                                <div className="user-meta">
                                                    <span className="user-name-text">{user.name}</span>
                                                    <span className="user-email-text">{user.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`role-badge ${(user.role || '').toLowerCase()}`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="status-indicator active">
                                                <Check size={12} /> Active
                                            </span>
                                        </td>
                                        <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                        <td>
                                            <div className="actions-cell">
                                                <button className="icon-btn edit" title="Edit User">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className="icon-btn delete"
                                                    title="Delete User"
                                                    onClick={() => handleDelete(user.id)}
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

export default UserManagement;
