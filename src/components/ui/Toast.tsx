import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

const getToastStyles = (type: ToastType) => {
  switch (type) {
    case 'success':
      return 'bg-green-50 text-green-800 dark:bg-green-900/50 dark:text-green-200 border-green-200 dark:border-green-800';
    case 'error':
      return 'bg-red-50 text-red-800 dark:bg-red-900/50 dark:text-red-200 border-red-200 dark:border-red-800';
    case 'warning':
      return 'bg-yellow-50 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800';
    case 'info':
      return 'bg-blue-50 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 border-blue-200 dark:border-blue-800';
    default:
      return 'bg-gray-50 text-gray-800 dark:bg-gray-900/50 dark:text-gray-200 border-gray-200 dark:border-gray-800';
  }
};

const getIcon = (type: ToastType) => {
  switch (type) {
    case 'success':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      );
    case 'error':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
    case 'warning':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
    case 'info':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${getToastStyles(type)} shadow-lg`}
    >
      {getIcon(type)}
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={onClose}
        className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </motion.div>
  );
} 