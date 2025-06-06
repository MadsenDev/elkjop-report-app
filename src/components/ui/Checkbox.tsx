import React, { forwardRef } from 'react';
import { FaCheck } from 'react-icons/fa';

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, containerClassName = '', className = '', ...props }, ref) => {
    return (
      <div className={`flex items-start ${containerClassName}`}>
        <div className="flex items-center h-5">
          <div className="relative">
            <input
              ref={ref}
              type="checkbox"
              className={`
                sr-only
                peer
                ${className}
              `}
              {...props}
            />
            <div
              className={`
                w-5
                h-5
                border-2
                rounded
                flex
                items-center
                justify-center
                transition-colors
                ${
                  error
                    ? 'border-red-500 dark:border-red-400'
                    : 'border-gray-300 dark:border-gray-600'
                }
                ${
                  props.checked
                    ? 'bg-blue-600 dark:bg-blue-500 border-blue-600 dark:border-blue-500'
                    : 'bg-white dark:bg-gray-800'
                }
                ${
                  !props.disabled &&
                  'peer-hover:border-blue-500 dark:peer-hover:border-blue-400'
                }
                ${
                  props.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }
              `}
            >
              {props.checked && (
                <FaCheck className="w-3 h-3 text-white" />
              )}
            </div>
          </div>
        </div>
        {label && (
          <div className="ml-3">
            <label
              className={`
                text-sm
                font-medium
                ${
                  error
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-700 dark:text-gray-300'
                }
                ${
                  props.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }
              `}
            >
              {label}
            </label>
            {error && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
        )}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox; 