import React, { forwardRef } from 'react';
import { FaChevronDown } from 'react-icons/fa';

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  options: Option[];
  onChange?: (value: string) => void;
  containerClassName?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, onChange, containerClassName = '', className = '', ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      onChange?.(e.target.value);
    };

    return (
      <div className={`w-full ${containerClassName}`}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            onChange={handleChange}
            className={`
              w-full px-4 py-2 rounded-lg border appearance-none
              ${error
                ? 'border-red-500 dark:border-red-400 focus:ring-red-500 dark:focus:ring-red-400'
                : 'border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400'
              }
              bg-white dark:bg-gray-800
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800
              disabled:opacity-50 disabled:cursor-not-allowed
              ${className}
            `}
            {...props}
          >
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <FaChevronDown className="w-4 h-4 text-gray-400 dark:text-gray-500" />
          </div>
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';

export default Select; 