import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
            <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>Welcome to OW Motors</h1>
            <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
                Inventory management system for all our branches.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: '1.2rem' }}>
                Login to Dashboard
            </Link>
        </div>
    );
};

export default Home;
