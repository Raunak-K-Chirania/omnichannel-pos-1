import React from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';

export const OfflineBanner: React.FC = () => {
  const isOnline = useSelector((state: RootState) => state.cart.isOnline);

  if (isOnline) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 to-rose-650 text-white py-2 px-4 text-center text-xs font-semibold tracking-wide flex items-center justify-center space-x-2.5 shadow-md border-b border-rose-500/20 select-none animate-slide-down">
      <svg className="w-4 h-4 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 5.636a9 9 0 010 12.728m0-12.728L5.636 18.364m12.728-12.728A9 9 0 015.636 5.636m0 0L18.364 18.364m-12.728-12.728a9 9 0 000 12.728L18.364 5.636m-12.728 12.728A9 9 0 0018.364 18.364" />
      </svg>
      <span>
        Offline Mode Active. Transactions will be processed locally and synchronized once your cloud connection is restored.
      </span>
    </div>
  );
};

export default OfflineBanner;
