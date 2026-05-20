import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();

  const menuItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" />
        </svg>
      ),
      roles: ['cashier', 'manager', 'admin'],
    },
    {
      name: 'POS Terminal',
      path: '/pos',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      roles: ['cashier', 'manager', 'admin'],
    },
    {
      name: 'Products',
      path: '/products',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
      ),
      roles: ['cashier', 'manager', 'admin'],
    },
    {
      name: 'Orders',
      path: '/orders',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      roles: ['cashier', 'manager', 'admin'],
    },
    {
      name: 'Inventory',
      path: '/inventory',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      ),
      roles: ['manager', 'admin'],
    },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <aside className="w-64 bg-slate-900/40 backdrop-blur-md border-r border-slate-800/80 hidden md:flex flex-col justify-between py-6 px-4 select-none">
      <div className="flex flex-col space-y-1.5">
        <div className="px-3 mb-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">
          Navigation
        </div>
        {filteredMenuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 px-3 py-3 rounded-xl transition-all duration-200 group border-l-2 font-medium ${
                isActive
                  ? 'bg-gradient-to-r from-violet-650/15 to-indigo-650/15 text-indigo-400 border-indigo-500'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40 border-transparent'
              }`}
            >
              <span className={`transition-transform duration-200 group-hover:scale-105 ${
                isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-300'
              }`}>
                {item.icon}
              </span>
              <span className="text-sm">{item.name}</span>
            </NavLink>
          );
        })}
      </div>
      
      {/* Footer Info or helper indicator */}
      {user && (
        <div className="p-3 bg-slate-850/50 rounded-2xl border border-slate-800/60 flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 border border-slate-700 shadow-sm text-sm uppercase">
            {user.name.charAt(0)}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-xs font-semibold text-slate-300 truncate">{user.name}</span>
            <span className="text-[10px] text-slate-500 truncate capitalize">{user.role} Account</span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
