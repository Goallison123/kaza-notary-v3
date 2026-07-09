import { InputHTMLAttributes } from 'react';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function InputField({ label, error, className = '', id, ...props }: InputFieldProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`
          w-full px-3 py-2.5 rounded-lg border text-sm text-slate-800 placeholder-slate-400
          bg-white border-slate-200 shadow-sm
          focus:outline-none focus:ring-2 focus:ring-[#003366]/20 focus:border-[#003366]
          transition-colors duration-150
          ${error ? 'border-red-400 focus:ring-red-200' : ''}
          ${className}
        `}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
