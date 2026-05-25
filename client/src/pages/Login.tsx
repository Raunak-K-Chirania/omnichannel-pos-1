import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import useAuth from '../hooks/useAuth';
import { setUser } from '../store/authSlice';
import type { User } from '../types/auth.types';

export const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<'admin' | 'manager' | 'cashier' | null>(null);
  const [showDemoToast, setShowDemoToast] = useState(false);
  const { user, loading, error, login } = useAuth();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // If already logged in, redirect to dashboard
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleRoleSelect = (role: 'admin' | 'manager' | 'cashier') => {
    setSelectedRole(role);
    setEmail(`${role}@example.com`);
    setPassword('password123');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    try {
      await login(email, password);
      navigate('/');
    } catch {
      // Error handled by useAuth & redux store
    }
  };

  const handleDemoBypass = () => {
    // Generate mock session based on selected role or input
    const role: 'admin' | 'manager' | 'cashier' = selectedRole || 'cashier';
    const mockUser: User = {
      _id: `mock-${role}-${Date.now()}`,
      name: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      email: `${role}@example.com`,
      role: role,
      store: 'mock-store-101',
      token: 'mock-jwt-token-bypass-mode',
    };

    dispatch(setUser(mockUser));
    setShowDemoToast(true);
    setTimeout(() => {
      navigate('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 font-sans p-4 relative overflow-hidden">
      {/* Decorative animated/glowing backdrop element */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[55%] h-[55%] bg-violet-600/10 rounded-full blur-[160px] pointer-events-none"></div>
      <div className="absolute top-[30%] right-[20%] w-[35%] h-[35%] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Main Dual-Panel Login Card */}
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 rounded-3xl overflow-hidden glass-panel border border-slate-800 shadow-2xl relative z-10 min-h-[640px]">
        
        {/* Left Panel: Branding & Features (Hidden on mobile) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950 p-12 flex-col justify-between relative overflow-hidden border-r border-slate-800">
          {/* Internal Orbs for Panel Depth */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]"></div>
          
          <div>
            <div className="flex items-center space-x-3 mb-10">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 border border-indigo-400/20">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-2xl font-black bg-gradient-to-r from-violet-400 via-indigo-200 to-white bg-clip-text text-transparent tracking-tight">
                OmniPOS
              </span>
            </div>

            <div className="space-y-8">
              <h1 className="text-3xl font-extrabold text-white leading-tight">
                Next-Gen <span className="text-indigo-400">Omnichannel</span> Retail Management
              </h1>
              
              <div className="space-y-5">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400 mt-1 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Real-time Cloud Sync</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Instant synchronization of inventories, sales reports, and customer profiles.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400 mt-1 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Offline-First Engine</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Keep checkout operations fully functional even during internet outages.</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 rounded-lg bg-indigo-500/15 flex items-center justify-center text-indigo-400 mt-1 flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Unified Checkout</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Harmonized online and brick-and-mortar experiences for cashiers and managers.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center space-x-1.5">
            <span>© 2026 OmniPOS Systems. All rights reserved.</span>
          </div>
        </div>

        {/* Right Panel: Active Form & Credentials Picker */}
        <div className="lg:col-span-7 p-8 md:p-12 flex flex-col justify-between bg-slate-900/40">
          
          {/* Title & Welcome */}
          <div className="mb-6">
            <div className="flex items-center space-x-2.5 lg:hidden mb-6">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-violet-400 to-indigo-200 bg-clip-text text-transparent">
                OmniPOS
              </span>
            </div>
            
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Access Terminal</h2>
            <p className="text-slate-400 text-xs mt-1">Select a role for quick-fill credentials, or enter account details manually.</p>
          </div>

          {/* Role Quick Selector Cards */}
          <div className="grid grid-cols-3 gap-3.5 mb-6">
            {/* Cashier Option */}
            <button
              type="button"
              onClick={() => handleRoleSelect('cashier')}
              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                selectedRole === 'cashier'
                  ? 'bg-emerald-500/10 border-emerald-500/80 shadow-md shadow-emerald-500/5'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700/60 hover:bg-slate-900/80'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                selectedRole === 'cashier' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400'
              }`}>
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Cashier</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Standard terminal access</p>
              </div>
            </button>

            {/* Manager Option */}
            <button
              type="button"
              onClick={() => handleRoleSelect('manager')}
              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                selectedRole === 'manager'
                  ? 'bg-purple-500/10 border-purple-500/80 shadow-md shadow-purple-500/5'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700/60 hover:bg-slate-900/80'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                selectedRole === 'manager' ? 'bg-purple-500/20 text-purple-400' : 'bg-slate-800 text-slate-400'
              }`}>
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Manager</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Inventory/Shift access</p>
              </div>
            </button>

            {/* Admin Option */}
            <button
              type="button"
              onClick={() => handleRoleSelect('admin')}
              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                selectedRole === 'admin'
                  ? 'bg-rose-500/10 border-rose-500/80 shadow-md shadow-rose-500/5'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700/60 hover:bg-slate-900/80'
              }`}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mb-3 ${
                selectedRole === 'admin' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'
              }`}>
                <svg className="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-200">Admin</h4>
                <p className="text-[10px] text-slate-500 mt-0.5">Full corporate access</p>
              </div>
            </button>
          </div>

          {/* Error Alert Box */}
          {error && (
            <div className="bg-rose-950/20 border border-rose-500/25 text-rose-400 text-xs px-4 py-3 rounded-xl mb-5 flex items-start gap-2.5">
              <svg className="w-4.5 h-4.5 mt-0.5 flex-shrink-0 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <span className="font-bold">Connection/Authentication Error:</span> {error}
              </div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.206" />
                  </svg>
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setSelectedRole(null);
                  }}
                  placeholder="cashier@example.com"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/40 transition-all duration-200"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-500">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setSelectedRole(null);
                  }}
                  placeholder="••••••••"
                  className="w-full bg-slate-950/60 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500/80 focus:ring-1 focus:ring-indigo-500/40 transition-all duration-200"
                />
              </div>
            </div>

            {/* Submissions & Bypass Options */}
            <div className="space-y-2.5 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white py-3 rounded-xl text-sm font-extrabold tracking-wide hover:shadow-lg hover:shadow-indigo-500/10 transition-all duration-250 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Connecting to Server...</span>
                  </>
                ) : (
                  <span>Sign In (Online API)</span>
                )}
              </button>

              <button
                type="button"
                onClick={handleDemoBypass}
                className="w-full bg-slate-900 border border-slate-800 hover:border-slate-700/80 text-slate-300 hover:text-white py-3 rounded-xl text-sm font-extrabold tracking-wide hover:bg-slate-800/40 transition-all duration-250 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Bypass & Log In (Local Demo Mode)</span>
                <span className="text-[9px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded uppercase font-bold tracking-widest border border-indigo-500/20">
                  Offline
                </span>
              </button>
            </div>
          </form>

          {/* Toast Notification for Bypass Mode */}
          {showDemoToast && (
            <div className="absolute top-5 right-5 bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs px-4 py-3 rounded-xl shadow-lg flex items-center gap-2.5 animate-bounce z-50">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>Bypass active! Launching terminal layout...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
