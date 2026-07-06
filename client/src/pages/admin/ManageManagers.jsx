import React, { useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { generateStrongPassword, getPasswordStrength } from '../../utils/password';

const API = import.meta.env.VITE_API || 'http://localhost:8000/api/';

const ManageManagers = () => {
    const { token } = useSelector(state => state.auth);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

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
            if (res.ok) setManagers(data);
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
                toast.error(data.error || 'Failed to register');
            }
        } catch {
            toast.error('Registration failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div className="page-header">
                <h1 className="page-title">Manage Branches & Managers</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 lg:gap-8 items-start">
                <div className="glass-card table-container desktop-table-wrap">
                    <h2 className="text-lg font-bold mb-4">Registered Managers</h2>
                    <table className="glass-table min-w-[560px]">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Branch</th>
                                <th>Email</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {managers.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="text-center py-6 text-gray-500">No managers registered yet.</td>
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
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="mobile-list-wrap space-y-3 lg:hidden">
                    {managers.length === 0 ? (
                        <div className="mobile-card text-center text-gray-500">No managers registered yet.</div>
                    ) : (
                        managers.map(mgr => (
                            <div key={mgr._id} className="mobile-card">
                                <p className="font-semibold text-gray-900">{mgr.username}</p>
                                <p className="text-sm text-gray-500 mt-1">{mgr.email}</p>
                                <div className="flex flex-wrap gap-2 mt-3">
                                    <span className="badge badge-warning">{mgr.branch}</span>
                                    {mgr.isVerified
                                        ? <span className="badge badge-success">Verified</span>
                                        : <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>Pending</span>}
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
        </div>
    );
};

export default ManageManagers;
