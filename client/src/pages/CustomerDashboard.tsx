import React from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const CustomerDashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Welcome Hero Banner */}
      <div className="relative bg-gradient-to-r from-indigo-950 via-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 md:p-8 overflow-hidden shadow-2xl">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="relative z-10 max-w-2xl space-y-4">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 uppercase">
            Customer Dashboard
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight leading-tight">
            Welcome back, <span className="bg-gradient-to-r from-violet-400 to-indigo-200 bg-clip-text text-transparent">{user?.name || 'Valued Customer'}</span>!
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed max-w-lg">
            Explore our real-time product inventory, search item listings, and review variant catalog data directly from your customer account page.
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-3 rounded-xl transition-all duration-200 cursor-pointer shadow shadow-indigo-600/10 active:scale-95"
            >
              Browse Catalog
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Account Details Panel */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Customer Profile Summary
            </h3>
            <p className="text-xs text-slate-500 mt-1">Details about your omnichannel store login session.</p>
            
            <div className="mt-5 space-y-3.5 text-xs">
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-2.5">
                <span className="text-slate-500">Name</span>
                <span className="text-slate-200 font-semibold">{user?.name}</span>
              </div>
              <div className="flex justify-between items-center border-b border-slate-800/60 pb-2.5">
                <span className="text-slate-500">Email Address</span>
                <span className="text-slate-200 font-mono font-semibold">{user?.email}</span>
              </div>
              <div className="flex justify-between items-center pb-1">
                <span className="text-slate-500">Account Role</span>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 shadow-sm uppercase tracking-wider">
                  {user?.role}
                </span>
              </div>
            </div>
          </div>
          
          <div className="pt-2 border-t border-slate-800/60">
            <button
              onClick={() => navigate('/profile')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              View Full Profile
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Quick Help & Quick Search Catalog */}
        <div className="glass-panel border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-white tracking-wide flex items-center gap-2">
              <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Quick Navigation
            </h3>
            <p className="text-xs text-slate-500 mt-1">Quick shortcuts to access system components.</p>
            
            <div className="grid grid-cols-2 gap-3 mt-5">
              <button
                onClick={() => navigate('/products')}
                className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-slate-800/30 transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer"
              >
                <svg className="w-6 h-6 text-slate-400 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <span className="text-xs font-bold text-slate-300">Products</span>
              </button>

              <button
                onClick={() => navigate('/profile')}
                className="p-4 bg-slate-900 border border-slate-800 rounded-xl hover:border-slate-700 hover:bg-slate-800/30 transition-all flex flex-col items-center justify-center text-center gap-2 group cursor-pointer"
              >
                <svg className="w-6 h-6 text-slate-400 group-hover:text-indigo-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span className="text-xs font-bold text-slate-300">My Profile</span>
              </button>
            </div>
          </div>
          
          <div className="text-[10px] text-slate-500 border-t border-slate-800/60 pt-4 text-center">
            Logged in via secure JSON Web Token authorization.
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
