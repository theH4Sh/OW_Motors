import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../slice/authSlice';

const AUTH_PATHS = ['/login', '/forgot-password', '/reset-password'];

const Navbar = () => {
    const { isAuthenticated, username } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const location = useLocation();

    const isAuthPage = AUTH_PATHS.some((path) => location.pathname.startsWith(path));

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('auth');
    };

    return (
        <header className="public-nav">
            <Link to={isAuthenticated ? '/' : '/login'} className="public-nav-brand">
                <span className="public-nav-mark">OW</span>
                <span className="public-nav-name">Motors</span>
            </Link>

            <div className="public-nav-actions">
                {isAuthenticated ? (
                    <>
                        <span className="public-nav-welcome">Welcome, {username}</span>
                        <button type="button" onClick={handleLogout} className="btn btn-secondary">
                            Logout
                        </button>
                    </>
                ) : !isAuthPage ? (
                    <Link to="/login" className="btn btn-primary">
                        Staff Login
                    </Link>
                ) : null}
            </div>
        </header>
    );
};

export default Navbar;
