import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { getErrorMessage } from '../utils/apiError';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const API_URL = import.meta.env.VITE_API || 'http://localhost:8000/api/';
            const res = await fetch(`${API_URL}auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(getErrorMessage(data, 'Request failed'));

            toast.success(data.message || 'Password reset link sent');
        } catch (err) {
            toast.error(getErrorMessage(err, 'Failed to send reset link'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page auth-page-compact">
            <div className="auth-card">
                <div className="auth-card-header">
                    <h2>Reset password</h2>
                    <p>Enter your account email and we’ll send a reset link.</p>
                </div>

                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            id="email"
                            type="email"
                            required
                            className="form-input"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full" disabled={loading}>
                        {loading ? 'Sending...' : 'Send reset link'}
                    </button>
                </form>

                <p className="auth-back-link">
                    <Link to="/login">Back to sign in</Link>
                </p>
            </div>
        </div>
    );
}
