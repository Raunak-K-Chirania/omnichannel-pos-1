import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import productService from '../services/productService';
import inventoryService from '../services/inventoryService';
import orderService from '../services/orderService';

interface DashboardOrder {
  _id: string;
  cashier?: { name?: string };
  paymentMethod?: string;
  total?: number;
  status?: string;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [productsCount, setProductsCount] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [recentOrders, setRecentOrders] = useState<DashboardOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch products count
        const productsData = await productService.getAll();
        setProductsCount(productsData.length);

        // Fetch low stock items count
        try {
          const lowStockData = await inventoryService.getLowStock();
          setLowStockCount(lowStockData.length);
        } catch (invErr) {
          console.warn('Could not fetch low-stock count directly. Trying fallback.', invErr);
          // If the role restricts getLowStock, we fall back to 0 or count from store
          setLowStockCount(0);
        }

        // Fetch recent orders
        const ordersData = await orderService.getAll();
        //console.log('Fetched orders data:', ordersData); // Debugging line to check orders data
        setRecentOrders(ordersData.data||[]);
      } catch (err: unknown) {
        console.error('Error loading dashboard data', err);
        const axiosError = err as { response?: { data?: { message?: string } } };
        setError(axiosError.response?.data?.message || 'Failed to fetch dashboard overview metrics.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const totalSales = Array.isArray(recentOrders)
    ? recentOrders.reduce((sum, order) => sum + (order.total || 0), 0)
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-sm font-bold text-slate-400">Loading terminal dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800/80 p-6 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Terminal Active: {user?.name}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Store ID: <span className="font-mono text-indigo-400 font-bold">{user?.store || 'N/A'}</span> &bull; Role:{' '}
            <span className="capitalize font-bold text-indigo-400">{user?.role}</span>
          </p>
        </div>
        <Link
          to="/pos"
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm px-5 py-2.5 rounded-xl transition-all duration-200 cursor-pointer shadow-lg shadow-indigo-600/10 active:scale-[0.98]"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            ></path>
          </svg>
          Open POS Terminal
        </Link>
      </div>

      {error && (
        <div className="bg-rose-950/80 border border-rose-500/20 text-rose-400 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center gap-5">
          <div className="w-12 h-12 bg-indigo-500/10 rounded-xl border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Total Active Products</span>
            <span className="text-2xl font-black text-white">{productsCount}</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className={`glass-card rounded-2xl p-5 border flex items-center gap-5 ${
          lowStockCount > 0 ? 'border-rose-500/20 bg-rose-950/5' : 'border-slate-800'
        }`}>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
            lowStockCount > 0 ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700/30'
          }`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Low Stock Alerts</span>
            <span className={`text-2xl font-black ${lowStockCount > 0 ? 'text-rose-400' : 'text-white'}`}>
              {lowStockCount}
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center gap-5">
          <div className="w-12 h-12 bg-emerald-500/10 rounded-xl border border-emerald-500/20 flex items-center justify-center text-emerald-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Total sales volume</span>
            <span className="text-2xl font-black text-white">${totalSales.toFixed(2)}</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-card rounded-2xl p-5 border border-slate-800 flex items-center gap-5">
          <div className="w-12 h-12 bg-sky-500/10 rounded-xl border border-sky-500/20 flex items-center justify-center text-sky-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Orders Completed</span>
            <span className="text-2xl font-black text-white">{Array.isArray(recentOrders) ? recentOrders.length : 0}</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout - Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Recent Orders (Large) */}
        <div className="glass-panel border border-slate-800 rounded-2xl p-6 lg:col-span-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base font-extrabold text-white tracking-wide">Recent Store Orders</h3>
            <Link to="/orders" className="text-xs font-bold text-indigo-400 hover:text-indigo-300">
              View All
            </Link>
          </div>

          {!Array.isArray(recentOrders) || recentOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
              No orders logged at this terminal yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                    <th className="pb-3">Order ID</th>
                    <th className="pb-3">Cashier</th>
                    <th className="pb-3">Payment</th>
                    <th className="pb-3">Total Amount</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-xs font-medium text-slate-300">
                  {recentOrders.slice(0, 5).map((order) => (
                    <tr key={order._id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="py-3.5 font-mono text-[10px] text-indigo-400 font-bold">
                        #{order._id.substring(order._id.length - 8)}
                      </td>
                      <td className="py-3.5 font-semibold text-slate-200">
                        {order.cashier?.name || 'Unknown'}
                      </td>
                      <td className="py-3.5 capitalize font-bold text-slate-400">
                        {order.paymentMethod ? order.paymentMethod.replace('_', ' ') : 'N/A'}
                      </td>
                      <td className="py-3.5 text-white font-extrabold">${order.total?.toFixed(2)}</td>
                      <td className="py-3.5 text-right">
                        <span className="bg-emerald-950/80 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold">
                          {order.status || 'Completed'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Right Side: Quick Shortcuts */}
        <div className="glass-panel border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white tracking-wide mb-4">Store Terminals</h3>
            <div className="space-y-4">
              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-gradient-to-tr from-cyan-600 to-teal-500 flex items-center justify-center text-white">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-200">Main POS register</h4>
                  <p className="text-[10px] text-slate-500">Active - Terminal #01</p>
                </div>
              </div>

              <div className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-400">Inventory Sync Channel</h4>
                  <p className="text-[10px] text-slate-500">Connected &bull; Redis Cache Live</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-800/60">
            <Link
              to="/products"
              className="w-full py-2.5 bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl text-xs font-bold text-slate-300 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <span>Manage Store Products</span>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
