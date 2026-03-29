import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ManagerRoute = ({ children }) => {
    const { isAuthenticated, role } = useSelector(state => state.auth);

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (role !== 'manager' && role !== 'admin') return <Navigate to="/" replace />; // Admin can also see manager routes

    return children;
};

export default ManagerRoute;
