import React, { forwardRef } from 'react';

interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  error?: string;
  containerClassName?: string;
}

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
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
                w-11
                h-6
                rounded-full
                transition-colors
                ${
                  error
                    ? 'bg-red-500 dark:bg-red-400'
                    : props.checked
                    ? 'bg-blue-600 dark:bg-blue-500'
                    : 'bg-gray-200 dark:bg-gray-700'
                }
                ${
                  !props.disabled &&
                  'peer-hover:bg-blue-500 dark:peer-hover:bg-blue-400'
                }
                ${
                  props.disabled
                    ? 'opacity-50 cursor-not-allowed'
                    : 'cursor-pointer'
                }
              `}
            >
              <div
                className={`
                  absolute
                  top-0.5
                  left-0.5
                  w-5
                  h-5
                  rounded-full
                  bg-white
                  dark:bg-gray-100
                  transition-transform
                  ${
                    props.checked
                      ? 'translate-x-5'
                      : 'translate-x-0'
                  }
                `}
              />
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

Switch.displayName = 'Switch';

export default Switch; 