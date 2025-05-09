import React, { forwardRef } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  onClear?: () => void;
  containerClassName?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, onClear, containerClassName = '', className = '', ...props }, ref) => {
    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full px-4 py-2 rounded-lg border
              ${icon ? 'pl-10' : ''}
              ${onClear ? 'pr-10' : ''}
              ${error
                ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
              }
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-white
              placeholder-gray-500 dark:placeholder-gray-400
              focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          />
          {onClear && props.value && (
            <button
              type="button"
              onClick={onClear}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-gray-500 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <FaTimes className="w-4 h-4" />
            </button>
          )}
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input; 