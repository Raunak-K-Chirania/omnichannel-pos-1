import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import userService from '../services/userService';
import storeService from '../services/storeService';
import type { Store } from '../types/product.types';

interface UserRecord {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'cashier' | 'customer';
  createdAt: string;
  store?: {
    _id: string;
    name: string;
  } | null;
}

export const Users: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>('all');

  // Edit Role Modal/State
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [newRole, setNewRole] = useState<string>('');
  const [newStore, setNewStore] = useState<string>('');
  const [stores, setStores] = useState<Store[]>([]);
  const [rolePending, setRolePending] = useState(false);

  // Delete Confirmation State
  const [deletingUser, setDeletingUser] = useState<UserRecord | null>(null);
  const [deletePending, setDeletePending] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await userService.getAll();
      if (res.success && res.data) {
        setUsers(res.data);
      } else {
        setUsers(res || []);
      }
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to retrieve registered users.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStores = async () => {
    try {
      const list = await storeService.getAll();
      setStores(list.filter((s: Store) => s.isActive));
    } catch (err) {
      console.error('Failed to retrieve stores in Users list', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchStores();
  }, []);

  const handleUpdateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    setRolePending(true);
    setError(null);
    setSuccess(null);

    try {
      await userService.updateRole(editingUser._id, newRole, newStore || null);
      setSuccess(`Updated ${editingUser.name}'s account settings successfully.`);
      setEditingUser(null);
      fetchUsers();
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to update user profile.');
    } finally {
      setRolePending(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deletingUser) return;

    setDeletePending(true);
    setError(null);
    setSuccess(null);

    try {
      await userService.delete(deletingUser._id);
      setSuccess(`Removed user account: ${deletingUser.name} (${deletingUser.email}).`);
      setDeletingUser(null);
      fetchUsers();
    } catch (err: unknown) {
      console.error(err);
      const axiosError = err as { response?: { data?: { message?: string } } };
      setError(axiosError.response?.data?.message || 'Failed to delete user profile.');
    } finally {
      setDeletePending(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm uppercase tracking-wider">
            Admin
          </span>
        );
      case 'manager':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm uppercase tracking-wider">
            Manager
          </span>
        );
      case 'cashier':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm uppercase tracking-wider">
            Cashier
          </span>
        );
      case 'customer':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm uppercase tracking-wider">
            Customer
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20 shadow-sm uppercase tracking-wider">
            {role}
          </span>
        );
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRoleFilter === 'all' || u.role === selectedRoleFilter;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white tracking-wide">User Account Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage employee access roles (Admin, Manager, Cashier) and view registered customer accounts.
          </p>
        </div>
        <button
          onClick={fetchUsers}
          className="p-2 bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white rounded-xl transition-all cursor-pointer"
          title="Refresh users directory"
        >
          <svg className="w-4.5 h-4.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H17" />
          </svg>
        </button>
      </div>

      {/* Alert Notices */}
      {error && (
        <div className="bg-rose-950/20 border border-rose-500/20 text-rose-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5">
          <svg className="w-5 h-5 text-rose-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="bg-emerald-950/20 border border-emerald-500/20 text-emerald-400 text-xs px-4 py-3 rounded-xl flex items-center gap-2.5">
          <svg className="w-5 h-5 text-emerald-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{success}</span>
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col md:flex-row gap-3.5 bg-slate-900/10 p-1.5 border border-slate-900 rounded-2xl">
        <div className="relative flex-1">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </span>
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 focus:outline-none focus:border-indigo-500/50"
          />
        </div>
        <div className="w-full md:w-48">
          <select
            value={selectedRoleFilter}
            onChange={(e) => setSelectedRoleFilter(e.target.value)}
            className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-2.5 px-3.5 text-xs text-slate-300 focus:outline-none focus:border-indigo-500/50 cursor-pointer"
          >
            <option value="all">All Roles</option>
            <option value="admin">Administrators</option>
            <option value="manager">Managers</option>
            <option value="cashier">Cashiers</option>
            <option value="customer">Customers</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-8 h-8 border-3 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Retrieving user roster...</span>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center py-24 text-slate-500 border border-dashed border-slate-800 rounded-2xl bg-slate-900/10">
          No users match your current filter parameters or search query.
        </div>
      ) : (
        <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/30 text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  <th className="p-4">Name</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Role Badge</th>
                  <th className="p-4">Assigned Store</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs font-semibold text-slate-300">
                {filteredUsers.map((u) => {
                  const isSelf = currentUser?._id === u._id;
                  return (
                    <tr key={u._id} className="hover:bg-slate-800/10 transition-colors">
                      <td className="p-4 font-bold text-slate-200">
                        {u.name} {isSelf && <span className="text-[9px] text-indigo-400 ml-1.5 lowercase border border-indigo-500/20 bg-indigo-500/5 px-1.5 py-0.5 rounded">(you)</span>}
                      </td>
                      <td className="p-4 text-slate-400 font-mono text-[11px]">{u.email}</td>
                      <td className="p-4">{getRoleBadge(u.role)}</td>
                      <td className="p-4">
                        {u.store ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm uppercase tracking-wider">
                            {u.store.name}
                          </span>
                        ) : (
                          <span className="text-slate-500 italic text-[11px]">Global / None</span>
                        )}
                      </td>
                      <td className="p-4 text-slate-500">
                        {new Date(u.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>
                      <td className="p-4 text-right space-x-2">
                        <button
                          onClick={() => {
                            setEditingUser(u);
                            setNewRole(u.role);
                            setNewStore(u.store?._id || '');
                          }}
                          className="text-xs font-bold text-indigo-400 hover:text-indigo-300 px-2.5 py-1.5 border border-slate-800 hover:border-slate-700 bg-slate-900/50 rounded-lg cursor-pointer transition-all"
                        >
                          Modify Role
                        </button>
                        <button
                          onClick={() => setDeletingUser(u)}
                          disabled={isSelf}
                          className="text-xs font-bold text-rose-400 hover:text-rose-300 px-2.5 py-1.5 border border-slate-800 hover:border-rose-950/20 bg-slate-900/50 hover:bg-rose-950/10 rounded-lg cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                        >
                          Delete
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

      {/* EDIT ROLE MODAL */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel border border-slate-800 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scaleUp">
            <div className="p-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/40">
              <div>
                <h2 className="text-sm font-extrabold text-white tracking-wide">Modify Account Access</h2>
                <p className="text-[10px] text-slate-500 mt-0.5">Changing permissions for {editingUser.name}</p>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleUpdateRole} className="p-6 space-y-4">
              <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                <p className="text-[11px] text-slate-400">Current Role:</p>
                <div className="mt-1">{getRoleBadge(editingUser.role)}</div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                  Select New Role
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-600 cursor-pointer"
                >
                  <option value="admin">Administrator</option>
                  <option value="manager">Manager</option>
                  <option value="cashier">Cashier</option>
                  <option value="customer">Customer</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1.5">
                  Assign Store Outlet
                </label>
                <select
                  value={newStore}
                  onChange={(e) => setNewStore(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-600 cursor-pointer"
                >
                  <option value="">No Store Assigned (Global / None)</option>
                  {stores.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.location})
                    </option>
                  ))}
                </select>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rolePending}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl px-5 py-2 text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {rolePending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deletingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-filter backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel border border-rose-950/30 rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl animate-scaleUp">
            <div className="p-5 border-b border-slate-800/80 flex justify-between items-center bg-rose-950/5">
              <div className="flex items-center space-x-2">
                <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-sm font-extrabold text-rose-400 tracking-wide">Danger: Delete Account</h2>
              </div>
              <button
                onClick={() => setDeletingUser(null)}
                className="text-slate-500 hover:text-slate-300 cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-slate-300 leading-relaxed">
                Are you absolutely sure you want to permanently delete the profile for{' '}
                <strong className="text-white font-bold">{deletingUser.name}</strong> ({deletingUser.email})?
              </p>
              
              <div className="bg-rose-950/15 border border-rose-500/10 p-3.5 rounded-xl text-[11px] text-rose-300">
                Warning: This action is irreversible. The user will be instantly logged out and will lose all database access.
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingUser(null)}
                  className="bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl px-4 py-2 text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteUser}
                  disabled={deletePending}
                  className="bg-rose-600 hover:bg-rose-500 text-white rounded-xl px-5 py-2 text-xs font-bold shadow flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {deletePending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <span>Delete User</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
