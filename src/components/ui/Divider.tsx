import React from 'react';

interface DividerProps {
  text?: string;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
}

export default function Divider({
  text,
  orientation = 'horizontal',
  className = '',
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={`
          h-full
          w-px
          bg-gray-200
          dark:bg-gray-700
          ${className}
        `}
      />
    );
  }

  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-gray-200 dark:border-gray-700" />
      </div>
      {text && (
        <div className="relative flex justify-center">
          <span className="px-2 text-sm text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800">
            {text}
          </span>
        </div>
      )}
    </div>
  );
} 