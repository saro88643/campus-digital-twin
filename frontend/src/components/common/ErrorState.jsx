import React from 'react';
import { AlertCircle, RotateCcw } from 'lucide-react';

const ErrorState = ({
  title = 'Failed to load data',
  message = 'An unexpected error occurred while fetching information.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-rose-200 bg-rose-50/50 p-8 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <AlertCircle className="h-6 w-6" />
      </div>
      <h3 className="mt-3 font-display text-base font-semibold text-rose-900">{title}</h3>
      <p className="mt-1 max-w-md text-xs text-rose-600">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 inline-flex items-center gap-1.5 rounded-lg border border-rose-300 bg-white px-3.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors shadow-xs"
        >
          <RotateCcw className="h-3.5 w-3.5" /> Try again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
