import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export const DashboardCard = ({
  title,
  value,
  icon: Icon,
  color = 'indigo',
  description,
  link,
}) => {
  const colorStyles = {
    indigo: {
      bg: 'from-indigo-950/40 via-slate-900/60 to-slate-900/40',
      border: 'border-indigo-500/20 hover:border-indigo-500/40',
      iconBg: 'bg-indigo-600/10 text-indigo-400 border-indigo-500/20',
      glow: 'group-hover:shadow-indigo-500/10',
    },
    emerald: {
      bg: 'from-emerald-950/40 via-slate-900/60 to-slate-900/40',
      border: 'border-emerald-500/20 hover:border-emerald-500/40',
      iconBg: 'bg-emerald-600/10 text-emerald-400 border-emerald-500/20',
      glow: 'group-hover:shadow-emerald-500/10',
    },
    amber: {
      bg: 'from-amber-950/40 via-slate-900/60 to-slate-900/40',
      border: 'border-amber-500/20 hover:border-amber-500/40',
      iconBg: 'bg-amber-600/10 text-amber-300 border-amber-500/20',
      glow: 'group-hover:shadow-amber-500/10',
    },
    rose: {
      bg: 'from-rose-950/40 via-slate-900/60 to-slate-900/40',
      border: 'border-rose-500/20 hover:border-rose-500/40',
      iconBg: 'bg-rose-600/10 text-rose-400 border-rose-500/20',
      glow: 'group-hover:shadow-rose-500/10',
    },
    cyan: {
      bg: 'from-cyan-950/40 via-slate-900/60 to-slate-900/40',
      border: 'border-cyan-500/20 hover:border-cyan-500/40',
      iconBg: 'bg-cyan-600/10 text-cyan-400 border-cyan-500/20',
      glow: 'group-hover:shadow-cyan-500/10',
    },
  };

  const style = colorStyles[color] || colorStyles.indigo;

  const content = (
    <div
      className={`group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br ${style.bg} border ${style.border} backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 shadow-lg ${style.glow}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className={`p-3 rounded-xl border ${style.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        <h3 className="text-3xl font-extrabold text-white tracking-tight">
          {value !== undefined ? value : '--'}
        </h3>
        {description && (
          <p className="mt-1 text-xs text-slate-400 flex items-center justify-between">
            <span>{description}</span>
            {link && (
              <span className="text-indigo-400 inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                View <ArrowRight className="w-3 h-3" />
              </span>
            )}
          </p>
        )}
      </div>
    </div>
  );

  if (link) {
    return <Link to={link}>{content}</Link>;
  }

  return content;
};

export default DashboardCard;
