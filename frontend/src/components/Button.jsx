import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon = null,
  onClick,
  type = 'button',
  className = '',
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-rose-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-6 py-3 text-base gap-2.5',
  };

  const variantClasses = {
    primary:
      'bg-teal-600 hover:bg-teal-500 text-slate-800 shadow-lg shadow-teal-600/25 focus:ring-teal-500 border border-teal-500/30 active:scale-[0.98]',
    success:
      'bg-emerald-600 hover:bg-emerald-500 text-slate-800 shadow-lg shadow-emerald-600/25 focus:ring-emerald-500 border border-emerald-500/30 active:scale-[0.98]',
    danger:
      'bg-rose-600 hover:bg-rose-500 text-slate-800 shadow-lg shadow-rose-600/25 focus:ring-rose-500 border border-rose-500/30 active:scale-[0.98]',
    outline:
      'bg-white/80 hover:bg-rose-100/80 text-slate-700 border border-rose-100 hover:border-rose-200 focus:ring-rose-300 active:scale-[0.98]',
    ghost:
      'bg-transparent hover:bg-white/60 text-slate-400 hover:text-slate-700 focus:ring-rose-200',
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin text-current" />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon className="w-4 h-4 shrink-0" />}
          {children}
        </>
      )}
    </button>
  );
};

export default Button;
