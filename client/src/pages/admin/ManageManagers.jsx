import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

const ManageManagers = () => {
    const { token } = useSelector(state => state.auth);
    const [managers, setManagers] = useState([]);
    const [loading, setLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        branch: ''
    });

    const fetchManagers = async () => {
        try {
            const res = await fetch('http://localhost:8000/api/auth/managers', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if(res.ok) setManagers(data);
        } catch (error) {
            toast.error("Failed to load managers");
        }
    };

    useEffect(() => {
        fetchManagers();
    }, [token]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('http://localhost:8000/api/auth/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            
            if (res.ok) {
                toast.success("Manager registered successfully!");
                setFormData({ username: '', email: '', password: '', branch: '' });
                fetchManagers();
            } else {
                toast.error(data.error || "Failed to register");
            }
        } catch (error) {
            toast.error("Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <h1 style={{ fontSize: '2rem', textAlign: 'left', margin: 0 }}>Manage Branches & Managers</h1>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: '32px', alignItems: 'start' }}>
                
                <div className="glass-card table-container">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '16px' }}>Registered Managers</h2>
                    <table className="glass-table">
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
                                    <td colSpan="4" style={{ textAlign: 'center', padding: '24px' }}>No managers registered yet.</td>
                                </tr>
                            ) : (
                                managers.map(mgr => (
                                    <tr key={mgr._id}>
                                        <td style={{ fontWeight: '500' }}>{mgr.username}</td>
                                        <td>
                                            <span className="badge badge-warning">{mgr.branch}</span>
                                        </td>
                                        <td style={{ color: 'var(--text-muted)' }}>{mgr.email}</td>
                                        <td>
                                            {mgr.isVerified ? 
                                                <span className="badge badge-success">Verified</span> : 
                                                <span className="badge" style={{ background: 'rgba(239, 68, 68, 0.15)', color: 'var(--danger)' }}>Pending</span>
                                            }
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="glass-card">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '20px' }}>Register New Manager</h2>
                    <form onSubmit={handleRegister}>
                        <div className="form-group">
                            <label className="form-label">Branch Name</label>
                            <input 
                                required
                                type="text"
                                className="form-input"
                                placeholder="e.g. Downtown, Uptown"
                                value={formData.branch}
                                onChange={(e) => setFormData({...formData, branch: e.target.value})}
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
                                onChange={(e) => setFormData({...formData, username: e.target.value})}
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
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Temporary Password</label>
                            <input 
                                required
                                type="password"
                                className="form-input"
                                placeholder="Assign temporary password"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                        </div>
                        
                        <button disabled={loading} type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }}>
                            {loading ? 'Creating...' : 'Register Manager'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ManageManagers;
