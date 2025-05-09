import React from 'react';

interface ErrorProps {
  message: string;
  className?: string;
}

export default function Error({ message, className = '' }: ErrorProps) {
  return (
    <p
      className={`
        mt-1
        text-sm
        text-red-600
        dark:text-red-400
        ${className}
      `}
    >
      {message}
    </p>
  );
} 