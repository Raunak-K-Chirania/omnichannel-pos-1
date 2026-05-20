import React, { useState, useEffect } from 'react';
import orderService from '../services/orderService';

interface OrderHistoryItem {
  _id: string;
  createdAt: string;
  cashier?: { name?: string };
  items?: Array<{
    productId: string;
    sku: string;
    name: string;
    quantity: number;
    unitPrice: number;
    discount: number;
  }>;
  paymentMethod?: string;
  total?: number;
  status?: string;
}

export const Orders: React.FC = () => {
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await orderService.getAll();
      setOrders(data);
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to fetch historical checkout order logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchOrders();
  }, []);

  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Widget */}
      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-wide">Historical Transaction Ledger</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit store transaction records, payment modes, and cashier checkout logs.
          </p>
        </div>
        <button
          onClick={fetchOrders}
          className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white rounded-xl transition-all cursor-pointer"
          title="Refresh transaction logs"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/80 border border-rose-500/25 text-rose-455 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Querying historical ledger...</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-20 text-slate-500 border border-dashed border-slate-850 rounded-xl bg-slate-900/10">
          No orders have been recorded at this store location yet.
        </div>
      ) : (
        <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  <th className="p-4">Transaction ID</th>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Cashier Active</th>
                  <th className="p-4">Line Items Count</th>
                  <th className="p-4">Payment Channel</th>
                  <th className="p-4">Checkout Total</th>
                  <th className="p-4 text-right">Receipt Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs font-medium text-slate-300">
                {orders.map((order) => {
                  const itemsCount = order.items?.length || 0;
                  return (
                    <tr key={order._id} className="hover:bg-slate-800/15 transition-colors">
                      <td className="p-4 font-mono font-bold text-[10px] text-indigo-400">
                        #{order._id.substring(order._id.length - 12)}
                      </td>
                      <td className="p-4 text-slate-400">
                        {formatDateTime(order.createdAt)}
                      </td>
                      <td className="p-4 font-semibold text-slate-200">
                        {order.cashier?.name || 'Store Cashier'}
                      </td>
                      <td className="p-4 font-mono font-bold">
                        {itemsCount} {itemsCount === 1 ? 'item' : 'items'}
                      </td>
                      <td className="p-4 capitalize font-bold text-slate-400">
                        {order.paymentMethod ? order.paymentMethod.replace('_', ' ') : 'N/A'}
                      </td>
                      <td className="p-4 font-mono font-extrabold text-white">
                        ${order.total?.toFixed(2)}
                      </td>
                      <td className="p-4 text-right">
                        <span className="bg-emerald-950/80 border border-emerald-500/20 text-emerald-400 px-2.5 py-1 rounded text-[10px] font-bold">
                          {order.status || 'Completed'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;
