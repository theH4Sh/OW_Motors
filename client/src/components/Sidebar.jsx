import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout } from '../slice/authSlice';

const Sidebar = () => {
    const { role, username } = useSelector(state => state.auth);
    const location = useLocation();
    const dispatch = useDispatch();

    const handleLogout = () => {
        dispatch(logout());
    };

    const isActive = (path) => location.pathname === path ? 'active' : '';

    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <span>OW</span>Motors
            </div>
            
            <div style={{ padding: '0 24px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Welcome, {username} ({role})
            </div>

            {role === 'admin' && (
                <>
                    <Link to="/admin" className={`nav-item ${isActive('/admin')}`}>
                        Dashboard
                    </Link>
                    <Link to="/admin/managers" className={`nav-item ${isActive('/admin/managers')}`}>
                        Branch Managers
                    </Link>
                    <Link to="/admin/inventory" className={`nav-item ${isActive('/admin/inventory')}`}>
                        Global Inventory
                    </Link>
                </>
            )}

            {role === 'manager' && (
                <>
                    <Link to="/manager" className={`nav-item ${isActive('/manager')}`}>
                        Branch Overview
                    </Link>
                    <Link to="/manager/inventory" className={`nav-item ${isActive('/manager/inventory')}`}>
                        Inventory
                    </Link>
                    <Link to="/manager/pos" className={`nav-item ${isActive('/manager/pos')}`}>
                        Point of Sale (POS)
                    </Link>
                    <Link to="/manager/orders" className={`nav-item ${isActive('/manager/orders')}`}>
                        Order History
                    </Link>
                </>
            )}
            
            <div style={{ marginTop: 'auto', padding: '0 12px' }}>
                <button onClick={handleLogout} className="btn nav-item" style={{ width: '100%', justifyContent: 'flex-start', background: 'transparent', border: 'none' }}>
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
