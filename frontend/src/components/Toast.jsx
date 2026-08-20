import React, { useEffect } from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export const Toast = ({ message, type = 'success', onClose, duration = 4000 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose?.();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const configs = {
    success: {
      bg: 'bg-emerald-500/10 border-emerald-500/30',
      text: 'text-emerald-300',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    },
    error: {
      bg: 'bg-rose-500/10 border-rose-500/30',
      text: 'text-rose-300',
      icon: <XCircle className="w-5 h-5 text-rose-400" />,
    },
    warning: {
      bg: 'bg-amber-500/10 border-amber-500/30',
      text: 'text-amber-300',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    },
    info: {
      bg: 'bg-blue-500/10 border-blue-500/30',
      text: 'text-blue-300',
      icon: <Info className="w-5 h-5 text-blue-400" />,
    },
  };

  const config = configs[type] || configs.success;

  return (
    <div className="fixed top-6 right-6 z-[100] animate-slide-in-right max-w-sm w-full">
      <div
        className={`flex items-start gap-3 p-4 rounded-2xl border backdrop-blur-xl shadow-2xl ${config.bg}`}
      >
        <span className="shrink-0 mt-0.5">{config.icon}</span>
        <p className={`text-sm font-medium flex-1 ${config.text}`}>{message}</p>
        <button
          onClick={onClose}
          className="shrink-0 p-0.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-white/60 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
