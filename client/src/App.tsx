import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from './store';
import { setOnlineStatus } from './store/cartSlice';
import useAuth from './hooks/useAuth';

// Components & Pages
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import OfflineBanner from './components/OfflineBanner'; // Network status banner
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import POS from './pages/POS';
import Products from './pages/Products';
import Inventory from './pages/Inventory';
import Orders from './pages/Orders';

// Layout for Private Pages
const AppLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans">
      <OfflineBanner />
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-5 md:p-8 overflow-y-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// Route wrapper to restrict access if not logged in
const PrivateRoute: React.FC = () => {
  const { user } = useAuth();
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Route wrapper for Role Based Access Control
interface RoleRouteProps {
  allowedRoles: Array<'cashier' | 'manager' | 'admin'>;
}

const RoleRoute: React.FC<RoleRouteProps> = ({ allowedRoles }) => {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;

  if (!allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="glass-panel border border-rose-500/20 bg-rose-950/10 rounded-2xl p-8 max-w-md text-center">
          <svg className="w-12 h-12 mx-auto text-rose-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-lg font-extrabold text-rose-500">Access Denied - 403</h2>
          <p className="text-xs text-rose-300 mt-1">
            Your cashier profile does not possess authorization to view this terminal view. Please request assistance from a manager.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

export const App: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Listening to Window online and offline events
  useEffect(() => {
    const handleOnline = () => {
      dispatch(setOnlineStatus(true));
    };

    const handleOffline = () => {
      dispatch(setOnlineStatus(false));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial status check
    dispatch(setOnlineStatus(navigator.onLine));

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [dispatch]);

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />

        {/* Private Routes wrapped in layout */}
        <Route element={<PrivateRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/pos" element={<POS />} />
            <Route path="/products" element={<Products />} />
            <Route path="/orders" element={<Orders />} />
            
            {/* Manager and Admin Only Routes */}
            <Route element={<RoleRoute allowedRoles={['manager', 'admin']} />}>
              <Route path="/inventory" element={<Inventory />} />
            </Route>
          </Route>
        </Route>

        {/* Catch All and Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
