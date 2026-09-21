import React from 'react';

const LoadingSpinner = ({ label = 'Loading...', className = 'py-12' }) => {
  return (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <div className="h-8 w-8 animate-spin rounded-full border-3 border-slate-200 border-t-sky-600" />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
};

export default LoadingSpinner;
