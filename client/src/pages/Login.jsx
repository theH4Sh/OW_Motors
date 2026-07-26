import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { toast } from 'react-hot-toast';
import { useDispatch } from 'react-redux';
import { login } from '../slice/authSlice.js';
import { getErrorMessage } from '../utils/apiError.js';

export default function Login() {
    const [formData, setFormData] = useState({
        identifier: '',
        password: '',
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setLoading(true);

        const API_URL = import.meta.env.VITE_API || 'http://localhost:8000/api/';
        fetch(API_URL + 'auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        })
            .then((res) => {
                if (!res.ok) {
                    return res.json().then((data) => {
                        throw new Error(getErrorMessage(data, 'Login failed'));
                    });
                }
                return res.json();
            })
            .then((data) => {
                dispatch(login(data));
                toast.success('Login successful');
                localStorage.setItem('auth', JSON.stringify({
                    username: data.username,
                    token: data.token,
                    role: data.role,
                    branch: data.branch,
                    isAuthenticated: true,
                }));
                navigate('/');
            })
            .catch((err) => {
                toast.error(getErrorMessage(err, 'Login failed'));
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <div className="auth-page">
            <div className="auth-shell">
                <aside className="auth-brand-panel">
                    <div className="auth-brand-content">
                        <p className="auth-brand-kicker">Staff Portal</p>
                        <h1 className="auth-brand-title">
                            OW<span>Motors</span>
                        </h1>
                        <p className="auth-brand-copy">
                            Inventory, sales, and branch operations — all in one place.
                        </p>
                    </div>
                </aside>

                <div className="auth-form-panel">
                    <div className="auth-card">
                        <div className="auth-card-header">
                            <h2>Sign in</h2>
                            <p>Use your staff username or email to continue.</p>
                        </div>

                        <form className="auth-form" onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="identifier" className="form-label">
                                    Email or Username
                                </label>
                                <input
                                    id="identifier"
                                    type="text"
                                    required
                                    autoComplete="username"
                                    className="form-input"
                                    placeholder="username or email"
                                    value={formData.identifier}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="form-group">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                    <label htmlFor="password" className="form-label mb-0">
                                        Password
                                    </label>
                                    <Link to="/forgot-password" className="auth-inline-link">
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <input
                                        id="password"
                                        type={showPassword ? 'text' : 'password'}
                                        required
                                        autoComplete="current-password"
                                        className="form-input pr-12"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <button
                                        type="button"
                                        className="auth-password-toggle"
                                        onClick={() => setShowPassword((v) => !v)}
                                        aria-label={showPassword ? 'Hide password' : 'Show password'}
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

                            <button
                                type="submit"
                                disabled={loading}
                                className="btn btn-primary w-full mt-2"
                            >
                                {loading ? 'Signing in...' : 'Sign in'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
