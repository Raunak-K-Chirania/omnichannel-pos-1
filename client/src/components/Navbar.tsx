import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import useAuth from '../hooks/useAuth';
import type { RootState } from '../store';
import { updateActiveStore } from '../store/authSlice';
import storeService from '../services/storeService';
import type { Store } from '../types/product.types';

interface NavbarProps {
  onMenuToggle?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onMenuToggle }) => {
  const { user, logout } = useAuth();
  const dispatch = useDispatch();
  const isOnline = useSelector((state: RootState) => state.cart.isOnline);
  const [stores, setStores] = useState<Store[]>([]);

  useEffect(() => {
    if (user && user.role !== 'customer') {
      const fetchStores = async () => {
        try {
          const list = await storeService.getAll();
          // Filter to active stores (admins can see all stores, cashier/manager see active)
          const activeList = user.role === 'admin' ? list : list.filter((s: Store) => s.isActive);
          setStores(activeList);
          
          // If user.store is not set or refers to a store that doesn't exist/is deactivated, auto-select first available active store
          if (activeList.length > 0) {
            const hasValidStore = activeList.some((s: Store) => s._id === user.store);
            if (!user.store || !hasValidStore) {
              const activeStores = activeList.filter((s: Store) => s.isActive);
              const defaultStore = activeStores.length > 0 ? activeStores[0] : activeList[0];
              dispatch(updateActiveStore({ id: defaultStore._id, currency: defaultStore.currency }));
            } else {
              // Ensure currency code is synced
              const currentStore = activeList.find((s: Store) => s._id === user.store);
              if (currentStore && user.currency !== currentStore.currency) {
                dispatch(updateActiveStore({ id: currentStore._id, currency: currentStore.currency }));
              }
            }
          }
        } catch (err) {
          console.error("Failed to load stores in Navbar", err);
        }
      };
      fetchStores();
    }
  }, [user, dispatch]);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 shadow-sm uppercase tracking-wider">
            Admin
          </span>
        );
      case 'manager':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20 shadow-sm uppercase tracking-wider">
            Manager
          </span>
        );
      case 'cashier':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm uppercase tracking-wider">
            Cashier
          </span>
        );
      case 'customer':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-sm uppercase tracking-wider">
            Customer
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20 shadow-sm uppercase tracking-wider">
            {role || 'Guest'}
          </span>
        );
    }
  };

  return (
    <nav className="h-16 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50">
      {/* Brand Logo & Name */}
      <div className="flex items-center space-x-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden flex items-center justify-center p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800/80 transition-all duration-200 mr-1 cursor-pointer"
            aria-label="Toggle menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/20">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <span className="text-xl font-extrabold bg-gradient-to-r from-violet-400 via-indigo-200 to-white bg-clip-text text-transparent tracking-tight">
          Omnichannel POS
        </span>
      </div>

      {/* Store Switcher Dropdown (Only for staff: cashier, manager, admin) */}
      {user && user.role !== 'customer' && stores.length > 0 && (
        <div className="flex items-center space-x-2 bg-slate-800/30 border border-slate-800/80 px-3 py-1.5 rounded-xl hover:border-slate-700 transition-colors">
          <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <select
            value={user.store || ''}
            onChange={(e) => {
              const selectedStore = stores.find(s => s._id === e.target.value);
              if (selectedStore) {
                dispatch(updateActiveStore({ id: selectedStore._id, currency: selectedStore.currency }));
              }
            }}
            className="bg-transparent border-0 text-xs font-bold text-slate-300 focus:outline-none focus:ring-0 cursor-pointer pr-2"
          >
            <option value="" disabled className="bg-slate-950 text-slate-500">Select Store...</option>
            {stores.map((s) => (
              <option key={s._id} value={s._id} className="bg-slate-950 text-slate-300 font-semibold">
                {s.name} {!s.isActive ? '(Inactive)' : ''}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Online / Offline Status Badge */}
      <div className="hidden sm:flex items-center">
        {isOnline ? (
          <div className="flex items-center space-x-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 px-3 py-1 rounded-full text-xs font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Cloud Connected</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 bg-rose-500/10 text-rose-400 border border-rose-500/25 px-3 py-1 rounded-full text-xs font-medium animate-pulse">
            <span className="h-2 w-2 rounded-full bg-rose-500"></span>
            <span>Offline Mode</span>
          </div>
        )}
      </div>

      {/* User Actions & Profile */}
      {user && (
        <div className="flex items-center space-x-4">
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-sm font-semibold text-slate-200">{user.name || 'User'}</span>
            <span className="mt-0.5">{getRoleBadge(user.role)}</span>
          </div>
          
          <div className="h-8 w-px bg-slate-800 hidden md:block"></div>

          {/* Logout Button */}
          <button
            onClick={logout}
            className="flex items-center justify-center p-2 rounded-xl bg-slate-800 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-500/20 transition-all duration-200"
            title="Log Out"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
