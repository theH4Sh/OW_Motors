import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../slice/authSlice';

const navIcons = {
    dashboard: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    ),
    inventory: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
    ),
    pos: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" /></svg>
    ),
    orders: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
    ),
    analytics: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
    ),
    managers: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    ),
    logout: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
    ),
};

const Sidebar = ({ isOpen, onClose }) => {
    const { role, username, branch } = useSelector(state => state.auth);
    const location = useLocation();
    const dispatch = useDispatch();

    const handleLogout = () => {
        localStorage.removeItem('auth');
        dispatch(logout());
        if (onClose) onClose();
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    const NavLink = ({ to, children }) => (
        <Link 
            to={to} 
            className={`nav-item ${isActive(to)}`}
            onClick={() => onClose && onClose()}
        >
            {children}
        </Link>
    );

    return (
        <>
            <div className={`sidebar ${isOpen ? 'open' : ''}`}>
                {/* Close Button for Mobile */}
                <button className="sidebar-close-btn" onClick={onClose}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>

                {/* Logo */}
                <div className="sidebar-logo">
                    <div className="logo-mark">OW</div>
                    <div>
                        <span className="logo-text">Motors</span>
                        <span className="logo-sub">Inventory System</span>
                    </div>
                </div>

                {/* User Info Pill */}
                <div className="sidebar-user">
                    <div className="user-avatar">{username?.[0]?.toUpperCase() || 'U'}</div>
                    <div className="user-info">
                        <span className="user-name">{username}</span>
                        <span className="user-role">{role} {branch ? `• ${branch}` : ''}</span>
                    </div>
                </div>

                <div className="sidebar-section-label">Navigation</div>

                {role === 'admin' && (
                    <>
                        <NavLink to="/admin">{navIcons.dashboard} Dashboard</NavLink>
                        <NavLink to="/admin/managers">{navIcons.managers} Branch Managers</NavLink>
                        <NavLink to="/admin/inventory">{navIcons.inventory} Global Inventory</NavLink>
                        <NavLink to="/admin/orders">{navIcons.orders} All Orders</NavLink>
                        <NavLink to="/admin/analytics">{navIcons.analytics} Analytics</NavLink>
                    </>
                )}

                {role === 'manager' && (
                    <>
                        <NavLink to="/manager">{navIcons.dashboard} Dashboard</NavLink>
                        <NavLink to="/manager/inventory">{navIcons.inventory} Inventory</NavLink>
                        <NavLink to="/manager/pos">{navIcons.pos} Point of Sale</NavLink>
                        <NavLink to="/manager/orders">{navIcons.orders} Order History</NavLink>
                        <NavLink to="/manager/analytics">{navIcons.analytics} Analytics</NavLink>
                    </>
                )}
                
                <div style={{ marginTop: 'auto' }}>
                    <div className="sidebar-section-label">Account</div>
                    <button onClick={handleLogout} className="nav-item logout-btn">
                        {navIcons.logout} Logout
                    </button>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
