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
    X,
    AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import axiosClient from '../../lib/axios';
import ActionConfirmModal from '../../components/Modals/ActionConfirmModal';
import './UserManagement.css';

const UserModal = ({ show, onClose, mode, userData, onSave }) => {
    // ... (UserModal component code remains unchanged) ...
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        role: 'User',
        password: '',
        confirmPassword: ''
    });
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (userData && mode === 'edit') {
            setFormData({
                name: userData.name || '',
                email: userData.email || '',
                role: userData.role || 'User',
                password: '',
                confirmPassword: ''
            });
        } else {
            setFormData({
                name: '',
                email: '',
                role: 'User',
                password: '',
                confirmPassword: ''
            });
        }
        setErrors({});
    }, [userData, mode, show]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
    };

    const validate = () => {
        const newErrors = {};
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        if (mode === 'add') {
            if (!formData.password) newErrors.password = 'Password is required';
            if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
            if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;

        setSaving(true);
        try {
            await onSave(formData);
            onClose();
        } catch (error) {
            console.error(error);
            setErrors({ submit: error.response?.data?.message || 'An error occurred' });
        } finally {
            setSaving(false);
        }
    };

    if (!show) return null;

    return (
        <div className="user-mgmt-modal-overlay">
            <div className="user-mgmt-modal-content admin-glass-card">
                <div className="user-mgmt-modal-header">
                    <h2>{mode === 'add' ? 'Add New User' : 'Edit User'}</h2>
                    <button className="user-mgmt-close-btn" onClick={onClose}><X size={20} /></button>
                </div>

                {errors.submit && <div className="user-mgmt-error-alert">{errors.submit}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="user-mgmt-form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter full name"
                            className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <span className="user-mgmt-error-text">{errors.name}</span>}
                    </div>

                    <div className="user-mgmt-form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="Enter email address"
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="user-mgmt-error-text">{errors.email}</span>}
                    </div>

                    <div className="user-mgmt-form-group">
                        <label>Role</label>
                        <select name="role" value={formData.role} onChange={handleChange}>
                            <option value="User">Regular User</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>

                    {mode === 'add' && (
                        <>
                            <div className="user-mgmt-form-group">
                                <label>Password</label>
                                <input
                                    type="password"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    placeholder="Enter password"
                                    className={errors.password ? 'error' : ''}
                                />
                                {errors.password && <span className="user-mgmt-error-text">{errors.password}</span>}
                            </div>
                            <div className="user-mgmt-form-group">
                                <label>Confirm Password</label>
                                <input
                                    type="password"
                                    name="confirmPassword"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    placeholder="Confirm password"
                                    className={errors.confirmPassword ? 'error' : ''}
                                />
                                {errors.confirmPassword && <span className="user-mgmt-error-text">{errors.confirmPassword}</span>}
                            </div>
                        </>
                    )}

                    <div className="user-mgmt-modal-actions">
                        <button type="button" className="user-mgmt-cancel-btn" onClick={onClose}>Cancel</button>
                        <button type="submit" className="user-mgmt-submit-btn" disabled={saving}>
                            {saving ? 'Saving...' : (mode === 'add' ? 'Create User' : 'Update User')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
    const [selectedUser, setSelectedUser] = useState(null);

    // Delete Confirmation State
    const [deleteModal, setDeleteModal] = useState({
        isOpen: false,
        userId: null,
        userName: ''
    });
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchUsers = async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const response = await axiosClient.get('/api/admin/users');
            setUsers(response.data.data || []);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
        const interval = setInterval(() => fetchUsers(true), 30000);
        return () => clearInterval(interval);
    }, []);

    const handleAddUser = () => {
        setModalMode('add');
        setSelectedUser(null);
        setShowModal(true);
    };

    const handleEditUser = (user) => {
        setModalMode('edit');
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleSaveUser = async (formData) => {
        try {
            if (modalMode === 'add') {
                const response = await axiosClient.post('/api/admin/users', formData);
                if (response.data.success) {
                    setUsers([...users, response.data.data]);
                    toast.success('User created successfully!');
                    fetchUsers();
                }
            } else {
                const response = await axiosClient.put(`/api/admin/users/${selectedUser.id}`, formData);
                if (response.data.success) {
                    setUsers(users.map(u => u.id === selectedUser.id ? response.data.data : u));
                    toast.success('User updated successfully!');
                }
            }
        } catch (error) {
            console.error('Error saving user:', error);
            toast.error(error.response?.data?.message || 'Failed to save user');
            throw error;
        }
    };

    const filteredUsers = users.filter(user => {
        const nameMatch = (user.name?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const emailMatch = (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesSearch = nameMatch || emailMatch;
        const matchesRole = roleFilter === 'All' || user.role === roleFilter;
        return matchesSearch && matchesRole;
    });

    const handleDeleteClick = (user) => {
        setDeleteModal({
            isOpen: true,
            userId: user.id,
            userName: user.name
        });
    };

    const confirmDelete = async () => {
        if (!deleteModal.userId) return;

        setIsDeleting(true);
        try {
            await axiosClient.delete(`/api/admin/users/${deleteModal.userId}`);
            setUsers(users.filter(u => u.id !== deleteModal.userId));
            toast.success('User deleted successfully.');
            setDeleteModal({ isOpen: false, userId: null, userName: '' });
        } catch (error) {
            console.error('Error deleting user:', error);
            toast.error(error.response?.data?.message || 'Failed to delete user');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="user-management-page admin-user-scope">
            <div className="page-header mb-8">
                <div className="header-text">
                    <h1 className="text-2xl font-bold">User Management</h1>
                    <p className="text-muted">Manage system users and their permissions</p>
                </div>
                <button className="add-user-btn" onClick={handleAddUser}>
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
                                                <button
                                                    className={`icon-btn edit ${user.role === 'Institute' ? 'disabled' : ''}`}
                                                    title={user.role === 'Institute' ? "Editing disabled for Institute users" : "Edit User"}
                                                    onClick={() => handleEditUser(user)}
                                                    disabled={user.role === 'Institute'}
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                                <button
                                                    className={`icon-btn delete ${user.role === 'Institute' ? 'disabled' : ''}`}
                                                    title={user.role === 'Institute' ? "Deletion disabled for Institute users" : "Delete User"}
                                                    onClick={() => handleDeleteClick(user)}
                                                    disabled={user.role === 'Institute'}
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

            <UserModal
                show={showModal}
                onClose={() => setShowModal(false)}
                mode={modalMode}
                userData={selectedUser}
                onSave={handleSaveUser}
            />

            <ActionConfirmModal
                isOpen={deleteModal.isOpen}
                onClose={() => setDeleteModal({ isOpen: false, userId: null, userName: '' })}
                onConfirm={confirmDelete}
                isProcessing={isDeleting}
                title="Delete User"
                message={`Are you sure you want to delete ${deleteModal.userName}? This action cannot be undone.`}
                confirmText="Yes, Delete"
                cancelText="Cancel"
                type="danger"
            />
        </div>
    );
};

export default UserManagement;
