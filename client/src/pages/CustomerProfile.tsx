import React from 'react';
import useAuth from '../hooks/useAuth';

export const CustomerProfile: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Panel */}
      <div className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl">
        <h1 className="text-xl font-extrabold text-white tracking-wide">My Profile</h1>
        <p className="text-xs text-slate-500 mt-0.5">Manage and review your omnichannel customer account details.</p>
      </div>

      {/* Profile Card */}
      <div className="max-w-2xl glass-panel border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-6 items-center md:items-start shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-[80px] pointer-events-none"></div>

        {/* Profile Avatar Icon */}
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center font-black text-white text-3xl border border-indigo-400/20 shadow-lg shadow-indigo-500/15 uppercase flex-shrink-0">
          {user?.name ? user.name.charAt(0) : '?'}
        </div>

        {/* Profile Info Details */}
        <div className="flex-1 space-y-4 w-full">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Customer Account</span>
            <h2 className="text-xl font-black text-slate-200">{user?.name}</h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm uppercase tracking-wider">
                {user?.role}
              </span>
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Active Session"></span>
              <span className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">Active Connection</span>
            </div>
          </div>

          <div className="border-t border-slate-800/80 pt-4 space-y-3 text-xs font-semibold">
            <div className="flex justify-between items-center py-1.5 border-b border-slate-900/60">
              <span className="text-slate-500">Internal Reference ID</span>
              <span className="text-slate-300 font-mono text-[10px]">{user?._id}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-900/60">
              <span className="text-slate-500">Email Address</span>
              <span className="text-slate-300 font-mono">{user?.email}</span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-900/60">
              <span className="text-slate-500">Session Status</span>
              <span className="text-slate-300 font-medium">Authenticated</span>
            </div>
            <div className="flex justify-between items-center py-1.5">
              <span className="text-slate-500">System Permissions</span>
              <span className="text-slate-400">Read-Only Catalog Access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerProfile;
