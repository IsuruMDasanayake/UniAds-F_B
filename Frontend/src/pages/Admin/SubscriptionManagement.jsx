import React, { useState, useEffect, useCallback } from 'react';
import {
    Search,
    Users,
    Clock,
    ArrowUpRight,
    Filter,
    Plus,
    XCircle,
    Ban,
    CheckCircle,
    AlertTriangle,
} from 'lucide-react';
import ActionConfirmModal from '../../components/Modals/ActionConfirmModal';
import axiosClient from '../../lib/axios';
import { getStorageUrl } from '../../lib/config';
import './SubscriptionManagement.css';

// ─── Status helpers ───────────────────────────────────────────────────────────

const getStatusMeta = (sub) => {
    if (!sub) return { label: 'Unknown', className: 'status-unknown' };
    const isTrial = sub.is_trial || sub.plan === 'trial';
    const s = (sub.status || '').toLowerCase();
    const reason = (sub.cancel_reason || sub.trial_cancel_reason || '').toLowerCase();
    const isCancelledVal = !!(sub.cancelled_at || sub.trial_cancelled_at);
    const isAdminCancel = reason.includes('admin');

    if (isTrial) {
        if (s === 'active') {
            if (isAdminCancel || s === 'cancelled') return { label: 'Trial Cancelled', className: 'status-cancelled' };
            return isCancelledVal 
                ? { label: 'Trial Ending', className: 'status-pending-cancel' }
                : { label: 'Trial Active', className: 'trial-active' };
        }
        if (s === 'cancelled' || isAdminCancel) return { label: 'Trial Cancelled', className: 'status-cancelled' };
        return { label: 'Trial Expired', className: 'status-expired' };
    }

    // Manual Admin cancellations or specific 'cancelled' string
    if (s === 'cancelled' || isAdminCancel) {
        return { label: 'Cancelled', className: 'status-cancelled' };
    }

    if (s === 'active') {
        return isCancelledVal
            ? { label: 'Ending', className: 'status-pending-cancel' }
            : { label: 'Active', className: 'sub-active' };
    }
    return { label: 'Expired', className: 'status-expired' };
};

const getPrimaryMeta = (records) => {
    if (!records?.length) return { label: 'No Records', className: 'status-expired', expiryDate: null };
    const sorted = [...records].sort((a, b) => new Date(b.started_at || b.created_at) - new Date(a.started_at || a.created_at));
    
    // Find a truly active record (not cancelled) first
    const activeClean = sorted.find(r => 
        (r.status || '').toLowerCase() === 'active' && 
        !(r.cancelled_at || r.trial_cancelled_at)
    );
    
    // Fallback to a cancelled-but-active one
    const activeAny = activeClean || sorted.find(r => (r.status || '').toLowerCase() === 'active');
    
    const primary = activeAny || sorted[0];
    return { ...getStatusMeta(primary), expiryDate: primary?.ends_at || primary?.trial_expires_at };
};

const hasActiveRecord = (records) =>
    records?.some(r => 
        (r.status || '').toLowerCase() === 'active' && 
        !(r.cancelled_at || r.trial_cancelled_at)
    );

const getRelativeTime = (dateString) => {
    if (!dateString) return '—';
    const diff = new Date(dateString) - new Date();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (days < 0)   return 'Expired';
    if (days === 0) return 'Ends today';
    return `Ends in ${days} day${days !== 1 ? 's' : ''}`;
};

const formatDate = (d) => d ? new Date(d).toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
const formatTime = (d) => d ? new Date(d).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toUpperCase() : '';

// ─── Component ────────────────────────────────────────────────────────────────

const SubscriptionManagement = () => {
    const [subscriptions, setSubscriptions] = useState([]);
    const [loading, setLoading]             = useState(true);
    const [searchTerm, setSearchTerm]       = useState('');
    const [filterType, setFilterType]       = useState('all');

    // Details modal
    const [selected, setSelected] = useState(null);

    // Action processing
    const [actionLoading, setActionLoading] = useState(false);

    // ── Confirm modal (used for ALL actions) ───────────────────────────────────
    // confirmCtx: { title, message, confirmText, type, onConfirm }
    const [confirmCtx, setConfirmCtx] = useState(null);

    // ── Grant form state ───────────────────────────────────────────────────────
    const [grantDays, setGrantDays]   = useState(30);
    const [grantNote, setGrantNote]   = useState('');
    const [grantError, setGrantError] = useState('');

    // ── Cancel reason state ────────────────────────────────────────────────────
    const [cancelReason, setCancelReason] = useState('');

    // ── Data fetching ──────────────────────────────────────────────────────────

    const fetchSubscriptions = useCallback(async (silent = false) => {
        try {
            if (!silent) setLoading(true);
            const res = await axiosClient.get('/api/admin/subscriptions');
            setSubscriptions(res.data.data || []);
        } catch (err) {
            console.error('Error fetching subscriptions:', err?.message || err);
        } finally {
            if (!silent) setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSubscriptions();
        const interval = setInterval(() => fetchSubscriptions(true), 30000);
        return () => clearInterval(interval);
    }, [fetchSubscriptions]);

    // ── Refresh selected modal data after mutation ─────────────────────────────
    // (subscriptions state may not yet reflect new data from fetchSubscriptions)
    const refreshSelected = useCallback((freshSubs) => {
        if (!selected) return;
        const map = {};
        freshSubs.forEach(sub => {
            if (!sub.institute) return;
            const id = sub.institute.id;
            if (!map[id]) map[id] = { details: sub.institute, records: [] };
            map[id].records.push(sub);
        });
        const updated = map[selected.details.id];
        if (updated) setSelected(updated);
    }, [selected]);

    // ── Group by institute ─────────────────────────────────────────────────────

    const institutesMap = {};
    subscriptions.forEach(sub => {
        if (!sub.institute) return;
        const id = sub.institute.id;
        if (!institutesMap[id]) institutesMap[id] = { details: sub.institute, records: [] };
        institutesMap[id].records.push(sub);
    });

    const allInstitutes = Object.values(institutesMap);
    const activeCount   = allInstitutes.filter(i => hasActiveRecord(i.records)).length;
    const expiredCount  = allInstitutes.length - activeCount;

    // ── Filter ─────────────────────────────────────────────────────────────────

    const filtered = allInstitutes.filter(inst => {
        const name = (inst.details.institute_name || '').toLowerCase();
        if (!name.includes(searchTerm.toLowerCase())) return false;

        const isActive = hasActiveRecord(inst.records);
        const hasTrial = inst.records.some(r => r.is_trial || r.plan === 'trial');
        const hasSub   = inst.records.some(r => !r.is_trial && r.plan !== 'trial');

        if (filterType === 'active')        return isActive;
        if (filterType === 'expired')       return !isActive;
        if (filterType === 'trials')        return hasTrial;
        if (filterType === 'subscriptions') return hasSub;
        return true;
    });

    // ─── Action helpers ────────────────────────────────────────────────────────

    const openConfirm = (ctx) => setConfirmCtx(ctx);
    const closeConfirm = () => { if (!actionLoading) setConfirmCtx(null); };

    const runAction = async (fn) => {
        try {
            setActionLoading(true);
            await fn();
            const res = await axiosClient.get('/api/admin/subscriptions');
            const fresh = res.data.data || [];
            setSubscriptions(fresh);
            refreshSelected(fresh);
            setConfirmCtx(null);
        } catch (err) {
            console.error('Action failed:', err?.message || err);
        } finally {
            setActionLoading(false);
        }
    };

    // Toggle row status (expire / cancel)
    const handleToggleRowStatus = (sub, newStatus) => {
        const isTrial  = sub.is_trial || sub.plan === 'trial';
        const id       = isTrial ? `trial-${sub.institute_id}` : sub.id;
        const isExpire = newStatus === 'expired';
        const isCancel = newStatus === 'cancelled';

        setCancelReason('');

        openConfirm({
            type:        'danger',
            title:       isExpire ? 'Mark as Expired?' : 'Cancel Subscription?',
            message:     isExpire
                ? 'This will immediately expire this subscription and remove premium access.'
                : isCancel ? 'cancel-form' : '',
            confirmText: isExpire ? 'Yes, Expire' : 'Yes, Cancel',
            isCancel,
            isExpire,
            onConfirm:   () => runAction(() =>
                axiosClient.patch(`/api/admin/subscriptions/${id}/status`, {
                    status: newStatus,
                    reason: isCancel ? cancelReason.trim() || undefined : undefined,
                })
            ),
        });
    };

    // Grant subscription
    const handleOpenGrant = (inst) => {
        setGrantDays(30);
        setGrantNote('');
        setGrantError('');
        openConfirm({
            type: 'grant', // custom — renders the grant form inside confirm modal body
            inst,
        });
    };

    const handleConfirmGrant = () => {
        if (!grantNote.trim()) { setGrantError('Admin note is required.'); return; }
        const inst = confirmCtx.inst;
        runAction(() =>
            axiosClient.post('/api/admin/subscriptions/grant', {
                institute_id: inst.details.id,
                days: grantDays,
                note: grantNote,
            })
        );
    };

    // ─── Render ────────────────────────────────────────────────────────────────

    return (
        <div className="subscription-management-page admin-subscription-scope">

            {/* Header */}
            <div className="page-header mb-6">
                <div className="header-text">
                    <h1 className="text-2xl font-bold">Subscription Management</h1>
                    <p className="text-muted">Monitor and manage all institute subscription records</p>
                </div>
            </div>

            {/* Stats Bar */}
            {!loading && (
                <div className="sub-stats-bar mb-6">
                    <div className="stat-chip">
                        <Users size={15} />
                        <span><strong>{allInstitutes.length}</strong> Total</span>
                    </div>
                    <div className="stat-chip active">
                        <CheckCircle size={15} />
                        <span><strong>{activeCount}</strong> Active</span>
                    </div>
                    <div className="stat-chip expired">
                        <AlertTriangle size={15} />
                        <span><strong>{expiredCount}</strong> Expired / Inactive</span>
                    </div>
                </div>
            )}

            {/* Controls */}
            <div className="table-controls p-0 mb-6 bg-transparent border-0 flex justify-between items-center gap-4">
                <div className="search-box flex-1 max-w-md">
                    <Search size={18} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search institutes..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filter-box">
                    <Filter size={18} className="filter-icon" />
                    <select
                        className="admin-select"
                        value={filterType}
                        onChange={e => setFilterType(e.target.value)}
                    >
                        <option value="all">All Institutes</option>
                        <option value="active">Active Only</option>
                        <option value="expired">Expired / Inactive</option>
                        <option value="subscriptions">Paid Subscriptions</option>
                        <option value="trials">Free Trials</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            {loading ? (
                <div className="text-center p-12">
                    <div className="loader mx-auto mb-4" />
                    <p className="text-muted">Loading subscriptions...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center p-12 admin-glass-card">
                    <p className="text-muted">No institutes found for this filter.</p>
                </div>
            ) : (
                <div className="institute-grid">
                    {filtered.map(inst => {
                        const meta = getPrimaryMeta(inst.records);
                        return (
                            <div key={inst.details.id} className="institute-card admin-glass-card">
                                <div className="inst-card-header">
                                    <div className="inst-logo-wrapper">
                                        {inst.details.profile_photo ? (
                                            <img src={getStorageUrl(inst.details.profile_photo)} alt={inst.details.institute_name} className="inst-logo-img" />
                                        ) : (
                                            <Users size={24} />
                                        )}
                                    </div>
                                    <div className="inst-info">
                                        <h3>{inst.details.institute_name}</h3>
                                        <span className={`status-badge ${meta.className}`}>
                                            {meta.label.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                <div className="inst-card-body">
                                    <div className="expiry-info">
                                        <Clock size={16} className="inline mr-2" />
                                        {getRelativeTime(meta.expiryDate)}
                                    </div>
                                    <button className="view-details-btn" onClick={() => setSelected(inst)}>
                                        <ArrowUpRight size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ── Details Modal ──────────────────────────────────────────────── */}
            {selected && (
                <div className="modal-overlay" onClick={() => setSelected(null)}>
                    <div className="modal-content subscription-details-modal" onClick={e => e.stopPropagation()}>

                        {/* Modal Header */}
                        <div className="modal-header-section">
                            <div className="inst-logo-lg">
                                {selected.details.profile_photo ? (
                                    <img src={getStorageUrl(selected.details.profile_photo)} alt={selected.details.institute_name} />
                                ) : (
                                    <Users size={32} />
                                )}
                            </div>
                            <div>
                                <h2>{selected.details.institute_name}</h2>
                                <p className="text-muted">{selected.details.email}</p>
                            </div>

                            {/* Grant button — hidden when institute already has an active record */}
                            {!hasActiveRecord(selected.records) && (
                                <button
                                    className="admin-action-btn grant-btn ml-auto"
                                    onClick={() => handleOpenGrant(selected)}
                                    title="Manually grant premium subscription"
                                >
                                    <Plus size={15} />
                                    Grant Subscription
                                </button>
                            )}
                        </div>

                        {/* Subscription History Table */}
                        <div className="modal-body-section">
                            <h3 className="section-title">Subscription History</h3>
                            <div className="responsive-table modal-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Plan</th>
                                            <th>Status</th>
                                            <th>Started At</th>
                                            <th>Ends At</th>
                                            <th>Cancelled At</th>
                                            <th>Admin Note</th>
                                            <th>Cancel Reason</th>
                                            <th>Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {[...selected.records]
                                            .sort((a, b) => new Date(b.started_at || b.created_at) - new Date(a.started_at || a.created_at))
                                            .map(sub => {
                                                const meta    = getStatusMeta(sub);
                                                const isActive = (sub.status || '').toLowerCase() === 'active';
                                                return (
                                                    <tr key={sub.id}>
                                                        <td>
                                                            <span className={`plan-badge ${(sub.plan || 'trial').toLowerCase()}`}>
                                                                {sub.plan || (sub.is_trial ? 'Trial' : 'Monthly')}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <span className={`status-pill ${meta.className}`}>
                                                                {meta.label}
                                                            </span>
                                                        </td>
                                                        <td className="date-time-cell">
                                                            <div className="date-part">{formatDate(sub.started_at)}</div>
                                                            <div className="time-part">{formatTime(sub.started_at)}</div>
                                                        </td>
                                                        <td className="date-time-cell">
                                                            <div className="date-part">{formatDate(sub.ends_at)}</div>
                                                            <div className="time-part">{formatTime(sub.ends_at)}</div>
                                                        </td>
                                                        <td className="date-time-cell">
                                                            <div className="date-part">{formatDate(sub.cancelled_at)}</div>
                                                            <div className="time-part">{formatTime(sub.cancelled_at)}</div>
                                                        </td>
                                                        <td className="reason-cell">
                                                            {sub.note || '—'}
                                                        </td>
                                                        <td className="reason-cell">
                                                            {sub.cancel_reason || sub.trial_cancel_reason || '—'}
                                                        </td>
                                                        <td>
                                                            {isActive ? (
                                                                <div className="row-action-btns">
                                                                    <button
                                                                        className="row-action-btn expire-btn"
                                                                        title="Mark as Expired"
                                                                        onClick={() => handleToggleRowStatus(sub, 'expired')}
                                                                    >
                                                                        <XCircle size={14} />
                                                                        
                                                                    </button>
                                                                    <button
                                                                        className="row-action-btn cancel-btn"
                                                                        title="Mark as Cancelled"
                                                                        onClick={() => handleToggleRowStatus(sub, 'cancelled')}
                                                                    >
                                                                        <Ban size={14} />
                                                                        
                                                                    </button>
                                                                </div>
                                                            ) : (
                                                                <span className="text-muted text-sm">—</span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ── ActionConfirmModal — Expire / Cancel ───────────────────────── */}
            {confirmCtx && confirmCtx.type !== 'grant' && (
                <ActionConfirmModal
                    isOpen={true}
                    onClose={closeConfirm}
                    onConfirm={confirmCtx.onConfirm}
                    isProcessing={actionLoading}
                    title={confirmCtx.title}
                    message={
                        confirmCtx.isCancel ? (
                            <div style={{ textAlign: 'left' }}>
                                <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '14px' }}>
                                    This will cancel the subscription. Premium access remains active until the end date.
                                </p>
                                <label className="form-label">Reason for Cancellation</label>
                                <input
                                    type="text"
                                    className="admin-input"
                                    placeholder="e.g. Requested by institute, policy violation…"
                                    value={cancelReason}
                                    onChange={e => setCancelReason(e.target.value)}
                                    style={{ display: 'block', width: '100%', marginTop: '6px' }}
                                />
                                <p style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '6px' }}>
                                    Leave blank to record as "Cancelled by Admin".
                                </p>
                            </div>
                        ) : confirmCtx.message
                    }
                    confirmText={confirmCtx.confirmText}
                    cancelText="Go Back"
                    type={confirmCtx.type}
                />
            )}

            {/* ── ActionConfirmModal — Grant Subscription ────────────────────── */}
            {confirmCtx && confirmCtx.type === 'grant' && (
                <ActionConfirmModal
                    isOpen={true}
                    onClose={closeConfirm}
                    onConfirm={handleConfirmGrant}
                    isProcessing={actionLoading}
                    title={`Grant Subscription`}
                    message={
                        <div style={{ textAlign: 'left' }}>
                            <p style={{ marginBottom: '14px', color: '#94a3b8', fontSize: '0.9rem' }}>
                                Manually activate premium for <strong style={{ color: '#fff' }}>{confirmCtx.inst?.details?.institute_name}</strong>.
                                Any existing active subscription will be marked expired.
                            </p>

                            <label className="form-label" style={{ display: 'block', marginBottom: '4px' }}>Duration (days)</label>
                            <input
                                type="number"
                                className="admin-input"
                                value={grantDays}
                                min={1}
                                max={365}
                                onChange={e => setGrantDays(parseInt(e.target.value) || 30)}
                                style={{ display: 'block', width: '100%', marginBottom: '14px' }}
                            />

                            <label className="form-label" style={{ display: 'block', marginBottom: '4px' }}>
                                Admin Note <span style={{ color: '#f87171' }}>*</span>
                            </label>
                            <input
                                type="text"
                                className="admin-input"
                                placeholder="e.g. Complimentary for partner institute"
                                value={grantNote}
                                onChange={e => { setGrantNote(e.target.value); setGrantError(''); }}
                                style={{ display: 'block', width: '100%' }}
                            />
                            {grantError && (
                                <p style={{ color: '#f87171', fontSize: '0.8rem', marginTop: '6px' }}>
                                    {grantError}
                                </p>
                            )}
                        </div>
                    }
                    confirmText={`Grant ${grantDays} Days`}
                    cancelText="Cancel"
                    type="success"
                />
            )}
        </div>
    );
};

export default SubscriptionManagement;
