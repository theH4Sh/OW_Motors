import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { generateStrongPassword, getPasswordStrength } from '../../utils/password';
import { getErrorMessage } from '../../utils/apiError';

const API = import.meta.env.VITE_API || 'http://localhost:8000/api/';

const ManageManagers = () => {
    const { token } = useSelector(state => state.auth);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [managerToDelete, setManagerToDelete] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        branch: '',
    });

    const passwordStrength = useMemo(
        () => getPasswordStrength(formData.password),
        [formData.password]
    );

    const fetchManagers = async () => {
        try {
            const res = await fetch(`${API}auth/managers`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) {
                setManagers(data);
            } else {
                toast.error(getErrorMessage(data, 'Failed to load managers'));
            }
        } catch {
            toast.error('Failed to load managers');
        }
    };

    useEffect(() => {
        fetchManagers();
    }, [token]);

    const handleGeneratePassword = async () => {
        const password = generateStrongPassword();
        setFormData(prev => ({ ...prev, password }));
        setShowPassword(true);
        try {
            await navigator.clipboard.writeText(password);
            toast.success('Strong password generated and copied to clipboard');
        } catch {
            toast.success('Strong password generated — copy it before registering');
        }
    };

    const handleCopyPassword = async () => {
        if (!formData.password) return;
        try {
            await navigator.clipboard.writeText(formData.password);
            toast.success('Password copied');
        } catch {
            toast.error('Could not copy password');
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (!passwordStrength.isStrong) {
            toast.error('Use a strong password or click "Generate strong password"');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API}auth/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(formData),
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('Manager registered successfully!');
                setFormData({ username: '', email: '', password: '', branch: '' });
                setShowPassword(false);
                fetchManagers();
            } else {
                toast.error(getErrorMessage(data, 'Failed to register manager'));
            }
        } catch {
            toast.error('Registration failed');
        } finally {
            setLoading(false);
        }
    };

    const closeDeleteModal = () => {
        if (deleting) return;
        setManagerToDelete(null);
    };

    const confirmDelete = async () => {
        if (!managerToDelete) return;

        setDeleting(true);
        try {
            const res = await fetch(`${API}auth/managers/${managerToDelete._id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (res.ok) {
                toast.success('Manager deleted');
                setManagers(prev => prev.filter(m => m._id !== managerToDelete._id));
                setManagerToDelete(null);
            } else {
                toast.error(getErrorMessage(data, 'Failed to delete manager'));
            }
        } catch {
            toast.error('Failed to delete manager');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Manage Branches & Managers</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">
                <div className="glass-card table-container desktop-table-wrap">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold">Registered Managers</h2>
                        <span className="text-xs font-semibold text-gray-400">{managers.length}</span>
                    </div>
                    <table className="glass-table min-w-[560px]">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Branch</th>
                                <th>Email</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {managers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-6 text-gray-500">No managers registered yet.</td>
                                </tr>
                            ) : (
                                managers.map(mgr => (
                                    <tr key={mgr._id}>
                                        <td className="font-medium">{mgr.username}</td>
                                        <td><span className="badge badge-warning">{mgr.branch}</span></td>
                                        <td className="text-gray-500">{mgr.email}</td>
                                        <td>
                                            {mgr.isVerified
                                                ? <span className="badge badge-success">Verified</span>
                                                : <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>Pending</span>}
                                        </td>
                                        <td>
                                            <button
                                                type="button"
                                                className="action-icon"
                                                onClick={() => setManagerToDelete(mgr)}
                                                title="Delete manager"
                                                aria-label={`Delete ${mgr.username}`}
                                            >
                                                <svg width="18" height="18" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                </svg>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mobile-list-wrap">
                    <div className="flex items-center justify-between mb-3 px-0.5">
                        <h2 className="text-lg font-bold">Registered Managers</h2>
                        <span className="text-xs font-semibold text-gray-400">{managers.length}</span>
                    </div>
                    {managers.length === 0 ? (
                        <div className="mobile-card text-center text-gray-500 py-8">
                            No managers registered yet.
                        </div>
                    ) : (
                        managers.map(mgr => (
                            <div key={mgr._id} className="mobile-card">
                                <div className="mobile-card-top">
                                    <div
                                        className="mobile-card-thumb flex items-center justify-center text-sm font-bold text-[#0B7C56]"
                                        style={{ background: 'rgba(11, 124, 86, 0.1)' }}
                                        aria-hidden="true"
                                    >
                                        {(mgr.username || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <div className="mobile-card-body">
                                        <div className="flex items-start justify-between gap-2">
                                            <p className="font-semibold text-gray-900 leading-snug break-words min-w-0">
                                                {mgr.username}
                                            </p>
                                            {mgr.isVerified
                                                ? <span className="badge badge-success shrink-0">Verified</span>
                                                : <span className="badge shrink-0" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>Pending</span>}
                                        </div>
                                    </div>
                                </div>
                                <dl className="mobile-card-meta">
                                    <dt>Branch</dt>
                                    <dd>{mgr.branch}</dd>
                                    <dt>Email</dt>
                                    <dd className="break-all">{mgr.email}</dd>
                                </dl>
                                <div className="mobile-card-actions">
                                    <button
                                        type="button"
                                        className="btn btn-danger flex-1"
                                        onClick={() => setManagerToDelete(mgr)}
                                    >
                                        <span className="inline-flex items-center justify-center gap-2">
                                            <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                            Delete
                                        </span>
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="glass-card">
                    <h2 className="text-lg font-bold mb-5">Register New Manager</h2>
                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <label className="form-label">Branch Name</label>
                            <input
                                required
                                type="text"
                                className="form-input"
                                placeholder="e.g. Downtown, Uptown"
                                value={formData.branch}
                                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Manager Username</label>
                            <input
                                required
                                type="text"
                                className="form-input"
                                placeholder="Manager's username"
                                value={formData.username}
                                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Email Address</label>
                            <input
                                required
                                type="email"
                                className="form-input"
                                placeholder="Email for verification"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <label className="form-label mb-0">Temporary Password</label>
                                <button
                                    type="button"
                                    onClick={handleGeneratePassword}
                                    className="text-xs font-semibold text-[#0B7C56] hover:text-[#095c40] whitespace-nowrap"
                                >
                                    Generate strong password
                                </button>
                            </div>
                            <div className="relative">
                                <input
                                    required
                                    type={showPassword ? 'text' : 'password'}
                                    className="form-input pr-20"
                                    placeholder="Assign a strong temporary password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                />
                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
                                    {formData.password && (
                                        <button
                                            type="button"
                                            onClick={handleCopyPassword}
                                            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md"
                                            title="Copy password"
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                        </button>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(v => !v)}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 rounded-md"
                                        title={showPassword ? 'Hide password' : 'Show password'}
                                    >
                                        {showPassword ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>

                            {formData.password.length > 0 && (
                                <div className="mt-3 rounded-xl border border-gray-100 bg-gray-50 p-3">
                                    <div className="flex items-center justify-between mb-2">
                                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Password strength</p>
                                        <span className={`text-xs font-bold ${passwordStrength.color}`}>{passwordStrength.label}</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-3">
                                        <div
                                            className={`h-full rounded-full transition-all ${
                                                passwordStrength.passedCount <= 2
                                                    ? 'bg-red-500'
                                                    : passwordStrength.passedCount <= 4
                                                        ? 'bg-amber-400'
                                                        : 'bg-emerald-500'
                                            }`}
                                            style={{ width: `${(passwordStrength.passedCount / passwordStrength.total) * 100}%` }}
                                        />
                                    </div>
                                    <ul className="space-y-1.5">
                                        {passwordStrength.rules.map(rule => (
                                            <li key={rule.key} className="flex items-center gap-2 text-xs">
                                                <span className={rule.passed ? 'text-emerald-600' : 'text-gray-300'}>
                                                    {rule.passed ? '✓' : '○'}
                                                </span>
                                                <span className={rule.passed ? 'text-gray-600' : 'text-gray-400'}>{rule.label}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            <p className="text-xs text-gray-400 mt-2">
                                Tip: use <strong>Generate strong password</strong> to create a secure temporary password for the manager.
                            </p>
                        </div>

                        <button
                            disabled={loading || !passwordStrength.isStrong}
                            type="submit"
                            className="btn btn-primary w-full mt-3"
                        >
                            {loading ? 'Creating...' : 'Register Manager'}
                        </button>
                    </form>
                </div>
            </div>

            {managerToDelete && (
                <div className="modal-overlay" onClick={closeDeleteModal}>
                    <div
                        className="modal-content"
                        style={{ maxWidth: 420 }}
                        onClick={(e) => e.stopPropagation()}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="delete-manager-title"
                    >
                        <div className="modal-header">
                            <h2 id="delete-manager-title" style={{ fontSize: '1.25rem' }}>
                                Delete Manager
                            </h2>
                            <button
                                type="button"
                                className="action-icon"
                                onClick={closeDeleteModal}
                                disabled={deleting}
                                aria-label="Close"
                            >
                                ✕
                            </button>
                        </div>
                        <div className="modal-body">
                            <p className="text-gray-600 leading-relaxed">
                                Are you sure you want to delete{' '}
                                <span className="font-semibold text-gray-900">{managerToDelete.username}</span>
                                {' '}from branch{' '}
                                <span className="font-semibold text-gray-900">{managerToDelete.branch}</span>?
                            </p>
                            <p className="text-sm text-gray-400 mt-3">
                                This action cannot be undone.
                            </p>
                        </div>
                        <div className="modal-footer">
                            <button
                                type="button"
                                className="btn btn-secondary"
                                onClick={closeDeleteModal}
                                disabled={deleting}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                className="btn btn-danger"
                                onClick={confirmDelete}
                                disabled={deleting}
                            >
                                {deleting ? 'Deleting...' : 'Delete Manager'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManageManagers;
