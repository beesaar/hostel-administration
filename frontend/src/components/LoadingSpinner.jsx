import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-3">
      <Loader2 className={`${sizeClasses[size] || sizeClasses.md} text-indigo-500 animate-spin`} />
      {text && <p className="text-sm font-medium text-slate-400">{text}</p>}
    </div>
  );
};

export const FullPageLoader = ({ text = 'Authenticating and loading portal...' }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative inline-flex">
          <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
        </div>
        <p className="text-sm font-medium text-slate-300 tracking-wide">{text}</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
