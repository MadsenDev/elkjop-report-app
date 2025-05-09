import React from 'react';
import { FaInfoCircle, FaCheckCircle, FaExclamationTriangle, FaExclamationCircle, FaTimes } from 'react-icons/fa';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export default function Alert({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
}: AlertProps) {
  const typeStyles = {
    info: {
      container: 'bg-blue-50 dark:bg-blue-900/50 border-blue-200 dark:border-blue-800',
      icon: 'text-blue-400 dark:text-blue-300',
      title: 'text-blue-800 dark:text-blue-200',
      text: 'text-blue-700 dark:text-blue-300',
    },
    success: {
      container: 'bg-green-50 dark:bg-green-900/50 border-green-200 dark:border-green-800',
      icon: 'text-green-400 dark:text-green-300',
      title: 'text-green-800 dark:text-green-200',
      text: 'text-green-700 dark:text-green-300',
    },
    warning: {
      container: 'bg-yellow-50 dark:bg-yellow-900/50 border-yellow-200 dark:border-yellow-800',
      icon: 'text-yellow-400 dark:text-yellow-300',
      title: 'text-yellow-800 dark:text-yellow-200',
      text: 'text-yellow-700 dark:text-yellow-300',
    },
    error: {
      container: 'bg-red-50 dark:bg-red-900/50 border-red-200 dark:border-red-800',
      icon: 'text-red-400 dark:text-red-300',
      title: 'text-red-800 dark:text-red-200',
      text: 'text-red-700 dark:text-red-300',
    },
  };

  const icons = {
    info: FaInfoCircle,
    success: FaCheckCircle,
    warning: FaExclamationTriangle,
    error: FaExclamationCircle,
  };

  const Icon = icons[type];

  return (
    <div
      className={`
        p-4
        rounded-lg
        border
        ${typeStyles[type].container}
        ${className}
      `}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <Icon className={`w-5 h-5 ${typeStyles[type].icon}`} />
        </div>
        <div className="ml-3 flex-1">
          {title && (
            <h3 className={`text-sm font-medium ${typeStyles[type].title}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${typeStyles[type].text}`}>
            {children}
          </div>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              type="button"
              onClick={onClose}
              className={`
                inline-flex
                rounded-md
                p-1.5
                focus:outline-none
                focus:ring-2
                focus:ring-offset-2
                dark:focus:ring-offset-gray-800
                ${typeStyles[type].icon}
                hover:opacity-75
              `}
            >
              <span className="sr-only">Close</span>
              <FaTimes className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 