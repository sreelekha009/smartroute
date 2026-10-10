import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  id,
  className = '',
  ...props
}) => {
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="flex flex-col gap-1.5 w-full">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold uppercase tracking-wider text-slate-600">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`w-full px-3.5 py-2 text-sm bg-white border rounded-lg transition-colors placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          error
            ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-200'
            : 'border-slate-300 hover:border-slate-400 focus:border-brand-500 focus:ring-brand-200'
        } ${className}`}
        {...props}
      />
      {error && <span className="text-xs text-rose-600 font-medium">{error}</span>}
      {!error && hint && <span className="text-xs text-slate-400">{hint}</span>}
    </div>
  );
};
