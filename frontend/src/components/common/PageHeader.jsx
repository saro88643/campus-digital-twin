import React from 'react';

const PageHeader = ({ title, subtitle, actions, children }) => {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {title}
        </h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {(actions || children) && (
        <div className="flex flex-wrap items-center gap-2.5">{actions || children}</div>
      )}
    </div>
  );
};

export default PageHeader;
