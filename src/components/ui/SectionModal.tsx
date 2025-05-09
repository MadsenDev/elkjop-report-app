import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import Button from './Button';

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  color: 'blue' | 'green' | 'orange' | 'purple';
  onSubmit: (e: React.FormEvent) => void;
  submitText?: string;
  isEditing?: boolean;
}

export default function SectionModal({
  isOpen,
  onClose,
  title,
  children,
  color,
  onSubmit,
  submitText = 'Add',
  isEditing = false,
}: SectionModalProps) {
  const colorClasses = {
    blue: {
      focus: 'focus:ring-blue-500 focus:border-blue-500',
      button: 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600',
      outline: 'text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/50',
      border: 'border-blue-200 dark:border-blue-800',
    },
    green: {
      focus: 'focus:ring-green-500 focus:border-green-500',
      button: 'bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600',
      outline: 'text-green-600 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/50',
      border: 'border-green-200 dark:border-green-800',
    },
    orange: {
      focus: 'focus:ring-orange-500 focus:border-orange-500',
      button: 'bg-orange-600 hover:bg-orange-700 dark:bg-orange-500 dark:hover:bg-orange-600',
      outline: 'text-orange-600 hover:bg-orange-50 dark:text-orange-400 dark:hover:bg-orange-900/50',
      border: 'border-orange-200 dark:border-orange-800',
    },
    purple: {
      focus: 'focus:ring-purple-500 focus:border-purple-500',
      button: 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600',
      outline: 'text-purple-600 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-purple-900/50',
      border: 'border-purple-200 dark:border-purple-800',
    },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative w-full max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-xl overflow-hidden"
          >
            <div className={`flex items-center justify-between p-6 border-b ${colorClasses[color].border}`}>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {isEditing ? `Edit ${title}` : title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="p-6">
              <div className="space-y-4">
                {children}
              </div>

              <div className="mt-6 flex justify-end gap-3">
                <Button
                  type="button"
                  onClick={onClose}
                  variant="outline"
                  color={color}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color={color}
                >
                  {submitText}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 