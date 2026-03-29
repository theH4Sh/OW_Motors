
import { createBrowserRouter, createRoutesFromElements, Route, RouterProvider, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { useSelector } from 'react-redux';
import './App.css';

// Layouts and Routes
import RootLayout from './layout/RootLayout';
import DashboardLayout from './layout/DashboardLayout';
import AdminRoute from './components/AdminRoute';
import ManagerRoute from './components/ManagerRoute';

// Pages
import Home from './pages/Home'; // Assuming Home exists
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Dashboards
import AdminDashboard from './pages/admin/AdminDashboard';
import ManageManagers from './pages/admin/ManageManagers';
import ManagerDashboard from './pages/manager/ManagerDashboard';
import InventoryManager from './pages/manager/InventoryManager';

function App() {
  const { isAuthenticated, role } = useSelector(state => state.auth);

  const getDashboardRedirect = () => {
    if (role === 'admin') return '/admin';
    if (role === 'manager') return '/manager';
    return '/login';
  };

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        {/* Public Routes with Navbar */}
        <Route path="/" element={<RootLayout />}>
          <Route index element={!isAuthenticated ? <Home /> : <Navigate to={getDashboardRedirect()} />} />
          <Route path="login" element={!isAuthenticated ? <Login /> : <Navigate to={getDashboardRedirect()} />} />
          {/* Signup is moved to ManageManagers for admins only, but keep route if public signup is needed */}
          <Route path="signup" element={!isAuthenticated ? <SignUp /> : <Navigate to={getDashboardRedirect()} />} /> 
          <Route path="forgot-password" element={<ForgotPassword />} />
          <Route path="reset-password/:token" element={<ResetPassword />} />
        </Route>

        {/* Protected Dashboard Routes with Sidebar */}
        <Route element={<DashboardLayout />}>
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/managers" element={<AdminRoute><ManageManagers /></AdminRoute>} />
          <Route path="/admin/inventory" element={<AdminRoute><InventoryManager /></AdminRoute>} />
          
          {/* Manager Routes */}
          <Route path="/manager" element={<ManagerRoute><ManagerDashboard /></ManagerRoute>} />
          <Route path="/manager/inventory" element={<ManagerRoute><InventoryManager /></ManagerRoute>} />

        </Route>
      </>
    )
  );

  return (
    <>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </>
  );
}

export default App;
