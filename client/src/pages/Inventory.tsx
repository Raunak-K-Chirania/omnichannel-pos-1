import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import inventoryService from '../services/inventoryService';
import type { InventoryItem } from '../types/product.types';

export const Inventory: React.FC = () => {
  const { user } = useAuth();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit stock state
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);
  const [editQty, setEditQty] = useState<number>(0);
  const [editReorderPoint, setEditReorderPoint] = useState<number>(10);
  const [editPending, setEditPending] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchInventory = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await inventoryService.getAll();
      setInventory(data);
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to retrieve active stock inventory.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInventory();
  }, []);

  const handleEditClick = (item: InventoryItem) => {
    setEditingItem(item);
    setEditQty(item.quantity);
    setEditReorderPoint(item.reorderPoint);
    setEditError(null);
  };

  const handleUpdateStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;

    setEditPending(true);
    setEditError(null);

    try {
      await inventoryService.updateStock(editingItem._id, {
        quantity: Number(editQty),
        reorderPoint: Number(editReorderPoint),
      });
      setEditingItem(null);
      fetchInventory();
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setEditError(axiosError.response?.data?.message || 'Failed to update stock levels.');
    } finally {
      setEditPending(false);
    }
  };

  // RBAC double check - managers/admins only
  const isAuthorized = user?.role === 'admin' || user?.role === 'manager';

  if (!isAuthorized) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="glass-panel border border-rose-500/20 bg-rose-950/10 rounded-2xl p-8 max-w-md text-center">
          <svg className="w-12 h-12 mx-auto text-rose-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-lg font-extrabold text-rose-455">Access Restricted</h2>
          <p className="text-xs text-rose-350 mt-1">
            You do not have the cashier privileges required to read inventory reports. Please contact a store manager or administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex justify-between items-center">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-wide">Live Store Inventory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor real-time product quantities across variant SKUs. Critical low stock items are highlighted in red.
          </p>
        </div>
        <button
          onClick={fetchInventory}
          className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white rounded-xl transition-all cursor-pointer"
          title="Refresh inventory logs"
        >
          <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="bg-rose-950/80 border border-rose-500/20 text-rose-400 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Querying store inventory...</span>
        </div>
      ) : inventory.length === 0 ? (
        <div className="text-center py-20 text-slate-500 border border-dashed border-slate-850 rounded-xl bg-slate-900/10">
          No stock inventory items have been configured for this store yet.
        </div>
      ) : (
        <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  <th className="p-4">SKU Code</th>
                  <th className="p-4">Product Name</th>
                  <th className="p-4">Store Outlet</th>
                  <th className="p-4 text-center">Reorder Threshold</th>
                  <th className="p-4 text-center">Current Quantity</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs font-semibold text-slate-300">
                {inventory.map((item) => {
                  const isLowStock = item.quantity <= item.reorderPoint;
                  return (
                    <tr
                      key={item._id}
                      className={`transition-colors ${
                        isLowStock
                          ? 'bg-rose-950/15 hover:bg-rose-955/20 text-rose-350'
                          : 'hover:bg-slate-800/15'
                      }`}
                    >
                      <td className="p-4 font-mono font-bold text-[10px] text-indigo-400">
                        {item.sku}
                      </td>
                      <td className="p-4">
                        <div className="font-extrabold text-slate-200">
                          {item.product?.name || 'Unknown Item'}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5 uppercase">
                          {item.product?.category || 'General'}
                        </div>
                      </td>
                      <td className="p-4 text-slate-400">
                        {item.store?.name || 'Main Warehouse'}
                      </td>
                      <td className="p-4 text-center font-mono">
                        {item.reorderPoint} units
                      </td>
                      <td className="p-4 text-center">
                        <span
                          className={`font-mono font-extrabold px-2.5 py-1 rounded-full text-xs ${
                            isLowStock
                              ? 'bg-rose-950 border border-rose-500/20 text-rose-400'
                              : 'bg-emerald-950/60 border border-emerald-500/20 text-emerald-400'
                          }`}
                        >
                          {item.quantity} units
                        </span>
                      </td>
                      <td className="p-4 text-right">
                        <button
                          onClick={() => handleEditClick(item)}
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 px-3 py-1.5 border border-slate-800 hover:border-slate-700 bg-slate-900/50 rounded-lg cursor-pointer transition-all"
                        >
                          Modify Stock
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EDIT STOCK MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel border border-slate-850 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
              <div>
                <h2 className="text-sm font-extrabold text-white tracking-wide">Adjust Stock Registry</h2>
                <p className="text-[10px] text-indigo-400 font-mono mt-0.5">SKU: {editingItem.sku}</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-slate-500 hover:text-slate-350 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateStock} className="p-6 space-y-4">
              {editError && (
                <div className="bg-rose-950/80 border border-rose-500/20 text-rose-400 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
                  <svg className="w-4 h-4 text-rose-550 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{editError}</span>
                </div>
              )}

              <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850/80 mb-2">
                <h4 className="text-xs font-bold text-slate-350">Item: {editingItem.product?.name}</h4>
                <p className="text-[10px] text-slate-500 mt-1 uppercase">Store: {editingItem.store?.name || 'Central warehouse'}</p>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-450 block mb-1.5">
                  Update Stock Quantity
                </label>
                <input
                  type="number"
                  required
                  value={editQty}
                  onChange={(e) => setEditQty(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-650 font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-455 block mb-1.5">
                  Reorder Threshold Point
                </label>
                <input
                  type="number"
                  required
                  value={editReorderPoint}
                  onChange={(e) => setEditReorderPoint(Math.max(0, parseInt(e.target.value) || 0))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-650 font-mono font-bold"
                />
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-850 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editPending}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-2 text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {editPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Apply Adjustments</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;
