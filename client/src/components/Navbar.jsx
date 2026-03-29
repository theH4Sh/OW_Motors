import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../slice/authSlice';

const Navbar = () => {
    const { isAuthenticated, username } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('auth');
    };

    return (
        <header style={{ 
            background: 'var(--nav-bg)', 
            backdropFilter: 'var(--glass-blur)', 
            borderBottom: '1px solid var(--surface-border)',
            padding: '16px 40px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 100
        }}>
            <Link to="/" style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>
                <span style={{ color: 'var(--primary)' }}>OW</span>Motors
            </Link>
            
            <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                {!isAuthenticated ? (
                    <>
                        <Link to="/login" className="btn btn-secondary">Login</Link>
                        {/* Optionally add Signup if public users should sign up: <Link to="/signup" className="btn btn-primary">Sign Up</Link> */}
                    </>
                ) : (
                    <>
                        <span style={{ color: 'var(--text-muted)' }}>Welcome, {username}</span>
                        <button onClick={handleLogout} className="btn btn-secondary">Logout</button>
                    </>
                )}
            </div>
        </header>
    );
};

export default Navbar;
