import React from 'react';

const StatCard = ({ label, value, icon: Icon, hint, color = 'sky' }) => {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:border-slate-300">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          {label}
        </p>
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          {Icon && <Icon className="h-5 w-5" />}
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-bold tracking-tight text-slate-900">
        {value ?? 0}
      </p>
      {hint && <p className="mt-1 text-xs text-slate-500">{hint}</p>}
    </div>
  );
};

export default StatCard;
