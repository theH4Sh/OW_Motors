import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const AdminDashboard = () => {
    const { token } = useSelector(state => state.auth);
    const [stats, setStats] = useState({ totalManagers: 0, totalProducts: 0 });

    useEffect(() => {
        // Here we ideally fetch actual stats, for now just fetch managers to get a count
        const fetchStats = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/auth/managers', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const data = await res.json();
                
                // Fetching all products
                const prodRes = await fetch('http://localhost:8000/api/product', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const prodData = await prodRes.json();
                
                setStats({
                    totalManagers: data.length || 0,
                    totalProducts: prodData.length || 0
                });
            } catch (err) {
                console.error("Failed to fetch stats", err);
            }
        };

        fetchStats();
    }, [token]);

    return (
        <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '24px', textAlign: 'left' }}>Admin Overview</h1>
            
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                <div className="glass-card">
                    <h3 className="form-label" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Total Branches / Managers</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                        {stats.totalManagers}
                    </div>
                </div>

                <div className="glass-card">
                    <h3 className="form-label" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>Global Inventory Items</h3>
                    <div style={{ fontSize: '3rem', fontWeight: 'bold', color: 'var(--secondary)' }}>
                        {stats.totalProducts}
                    </div>
                </div>

                <div className="glass-card">
                    <h3 className="form-label" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>System Status</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px' }}>
                        <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'var(--secondary)' }}></div>
                        <span style={{ fontSize: '1.2rem' }}>All Systems Operational</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
