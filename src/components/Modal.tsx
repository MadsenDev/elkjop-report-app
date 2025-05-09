import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  message?: string;
  countdown?: number;
  onConfirm?: () => void;
  confirmText?: string;
  cancelText?: string;
  size?: 'sm' | 'md' | 'lg';
  noFooter?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  message,
  countdown,
  onConfirm,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  size = 'md',
  noFooter = false,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-lg',
    lg: 'max-w-4xl',
  };

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className={`relative w-full ${sizeClasses[size]} max-h-[90vh] bg-white dark:bg-gray-800 rounded-xl shadow-xl flex flex-col`}
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-hidden">
              {message && (
                <p className="p-6 text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                  {message}
                  {countdown !== undefined && countdown > 0 && (
                    <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                      (Closing in {countdown}s)
                    </span>
                  )}
                </p>
              )}
              <div className="h-full">
                {children}
              </div>
            </div>
            {!noFooter && (
              <div className="flex items-center justify-end gap-4 p-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  {cancelText}
                </button>
                {onConfirm && (
                  <button
                    onClick={onConfirm}
                    disabled={countdown !== undefined && countdown > 0}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {confirmText}
                    {countdown !== undefined && countdown > 0 && ` (${countdown}s)`}
                  </button>
                )}
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 