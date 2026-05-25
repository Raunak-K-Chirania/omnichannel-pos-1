import React from 'react';
import { useSelector } from 'react-redux';
import useAuth from '../hooks/useAuth';
import type { RootState } from '../store';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const isOnline = useSelector((state: RootState) => state.cart.isOnline);

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
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm uppercase tracking-wider">
            Cashier
          </span>
        );
    }
  };

  return (
    <nav className="h-16 flex items-center justify-between px-6 bg-slate-900/80 backdrop-blur-md border-b border-slate-800/80 sticky top-0 z-50">
      {/* Brand Logo & Name */}
      <div className="flex items-center space-x-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 border border-indigo-400/20">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
        </div>
        <span className="text-xl font-extrabold bg-gradient-to-r from-violet-400 via-indigo-200 to-white bg-clip-text text-transparent tracking-tight">
          OmniPOS
        </span>
      </div>

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
            <span className="mt-0.5">{getRoleBadge(user.role || 'cashier')}</span>
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
