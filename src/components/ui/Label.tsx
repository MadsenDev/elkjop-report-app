import React from 'react';

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  error?: boolean;
}

export default function Label({
  children,
  required,
  error,
  className = '',
  ...props
}: LabelProps) {
  return (
    <label
      className={`
        block
        text-sm
        font-medium
        ${
          error
            ? 'text-red-600 dark:text-red-400'
            : 'text-gray-700 dark:text-gray-300'
        }
        ${className}
      `}
      {...props}
    >
      {children}
      {required && (
        <span className="ml-1 text-red-600 dark:text-red-400">*</span>
      )}
    </label>
  );
} 