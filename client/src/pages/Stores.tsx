import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import storeService from '../services/storeService';
import type { Store } from '../types/product.types';

export const Stores: React.FC = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [storeName, setStoreName] = useState('');
  const [storeLocation, setStoreLocation] = useState('');
  const [storeIsActive, setStoreIsActive] = useState(true);
  const [storeCurrency, setStoreCurrency] = useState('USD');
  const [submitPending, setSubmitPending] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  const fetchStores = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await storeService.getAll();
      setStores(data);
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to retrieve stores registry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStores();
  }, []);

  const handleOpenAddModal = () => {
    setEditingStore(null);
    setStoreName('');
    setStoreLocation('');
    setStoreIsActive(true);
    setStoreCurrency('USD');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (store: Store) => {
    setEditingStore(store);
    setStoreName(store.name);
    setStoreLocation(store.location);
    setStoreIsActive(store.isActive);
    setStoreCurrency(store.currency || 'USD');
    setModalError(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStore(null);
    setStoreName('');
    setStoreLocation('');
    setStoreIsActive(true);
    setStoreCurrency('USD');
    setModalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeName || !storeLocation) return;

    setSubmitPending(true);
    setModalError(null);

    const payload = {
      name: storeName,
      location: storeLocation,
      isActive: storeIsActive,
      currency: storeCurrency,
    };

    try {
      if (editingStore) {
        await storeService.update(editingStore._id, payload);
      } else {
        await storeService.create(payload);
      }
      handleCloseModal();
      fetchStores();
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setModalError(axiosError.response?.data?.message || `Failed to ${editingStore ? 'update' : 'create'} store.`);
    } finally {
      setSubmitPending(false);
    }
  };

  const handleDeleteStore = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete store "${name}"?`)) return;

    setError(null);
    try {
      await storeService.delete(id);
      fetchStores();
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to delete store.');
    }
  };

  const handleToggleActive = async (store: Store) => {
    try {
      await storeService.update(store._id, { isActive: !store.isActive });
      fetchStores();
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to toggle store status.');
    }
  };

  // Restrict view to admin
  const isAuthorized = user?.role === 'admin';

  if (!isAuthorized) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="glass-panel border border-rose-500/20 bg-rose-950/10 rounded-2xl p-8 max-w-md text-center">
          <svg className="w-12 h-12 mx-auto text-rose-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h2 className="text-lg font-extrabold text-rose-500">Access Restricted</h2>
          <p className="text-xs text-rose-300 mt-1">
            Store operations terminals are restricted to System Administrators. Please contact support.
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
          <h1 className="text-xl font-extrabold text-white tracking-wide">Store Outlets Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Add new retail outlets, activate/deactivate channels, and view active locations.
          </p>
        </div>
        <button
          onClick={handleOpenAddModal}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all duration-200 cursor-pointer shadow shadow-indigo-600/10 active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Add New Store
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
          <span className="text-xs font-semibold text-slate-500">Querying outlets...</span>
        </div>
      ) : stores.length === 0 ? (
        <div className="text-center py-20 text-slate-500 border border-dashed border-slate-800 rounded-xl bg-slate-900/10">
          No stores found. Click the button above to add your first retail store outlet.
        </div>
      ) : (
        <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  <th className="p-4">Store Name</th>
                  <th className="p-4">Location / Address</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs font-semibold text-slate-300">
                {stores.map((store) => (
                  <tr key={store._id} className="hover:bg-slate-800/15 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </div>
                        <div>
                          <div className="font-extrabold text-slate-200">{store.name}</div>
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">ID: {store._id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-slate-400">
                      {store.location}
                      <span className="ml-2 bg-slate-900 border border-slate-800 text-indigo-400 px-1.5 py-0.5 rounded text-[9px] font-bold font-mono">
                        {store.currency || 'USD'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggleActive(store)}
                        className={`px-2.5 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                          store.isActive
                            ? 'bg-emerald-950/80 border-emerald-500/20 text-emerald-400 hover:bg-rose-950/30 hover:text-rose-400 hover:border-rose-500/20'
                            : 'bg-slate-950/80 border-slate-700/20 text-slate-500 hover:bg-emerald-950/30 hover:text-emerald-400 hover:border-emerald-500/20'
                        }`}
                        title="Click to toggle status"
                      >
                        {store.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(store)}
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 px-3 py-1.5 border border-slate-800 hover:border-slate-700 bg-slate-900/50 rounded-lg cursor-pointer transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteStore(store._id, store.name)}
                          className="text-xs font-bold text-rose-400 hover:text-rose-300 px-3 py-1.5 border border-slate-800 hover:border-slate-700 bg-slate-900/50 rounded-lg cursor-pointer transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD/EDIT STORE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scaleUp">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
              <h2 className="text-sm font-extrabold text-white tracking-wide">
                {editingStore ? 'Edit Retail Outlet' : 'Add Store Outlet'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {modalError && (
                <div className="bg-rose-950/80 border border-rose-500/20 text-rose-400 text-xs px-4 py-3 rounded-lg flex items-center gap-2">
                  <svg className="w-4 h-4 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{modalError}</span>
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                  Store Name
                </label>
                <input
                  type="text"
                  required
                  value={storeName}
                  onChange={(e) => setStoreName(e.target.value)}
                  placeholder="e.g. Westside Galleria Branch"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                  Location / Address
                </label>
                <input
                  type="text"
                  required
                  value={storeLocation}
                  onChange={(e) => setStoreLocation(e.target.value)}
                  placeholder="e.g. Los Angeles, CA"
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                  Store Currency
                </label>
                <select
                  value={storeCurrency}
                  onChange={(e) => setStoreCurrency(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-600 cursor-pointer"
                >
                  <option value="USD">USD ($ - United States Dollar)</option>
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                </select>
              </div>

              <div className="flex items-center gap-3 bg-slate-900/20 p-3 rounded-xl border border-slate-800/80">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={storeIsActive}
                  onChange={(e) => setStoreIsActive(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-800 text-indigo-600 focus:ring-indigo-600/30 bg-slate-950 cursor-pointer"
                />
                <label htmlFor="isActive" className="text-xs font-bold text-slate-300 cursor-pointer">
                  Activate Store (Enable for cash registers/sync)
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3.5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitPending}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-2 text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {submitPending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving Store...</span>
                    </>
                  ) : (
                    <span>{editingStore ? 'Apply Updates' : 'Add Store'}</span>
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

export default Stores;
