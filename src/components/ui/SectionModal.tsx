// components/ui/SectionModal.tsx
import { useEffect, MouseEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import Button from './Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  color: 'blue' | 'green' | 'orange' | 'purple';
  onSubmit: (e: React.FormEvent) => void;
  submitText?: string;
  isEditing?: boolean;
}

const palette = {
  blue:   { ring: 'ring-blue-500',   grad: 'from-blue-50 to-blue-100 dark:from-blue-900/60 dark:to-blue-800/90' },
  green:  { ring: 'ring-green-500',  grad: 'from-green-50 to-green-100 dark:from-green-900/60 dark:to-green-800/90' },
  orange: { ring: 'ring-orange-500', grad: 'from-orange-50 to-orange-100 dark:from-orange-900/60 dark:to-orange-800/90' },
  purple: { ring: 'ring-purple-500', grad: 'from-purple-50 to-purple-100 dark:from-purple-900/60 dark:to-purple-800/90' },
} as const;

export default function SectionModal({
  isOpen,
  onClose,
  title,
  children,
  color,
  onSubmit,
  submitText = 'Save',
  isEditing = false,
}: Props) {
  /* esc-to-close */
  useEffect(() => {
    if (!isOpen) return;
    const fn = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [isOpen, onClose]);

  /* click outside → close */
  const backdropClick = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const { ring, grad } = palette[color];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
          onMouseDown={backdropClick}
        >
          <motion.div
            key="panel"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1,   opacity: 1 }}
            exit={{    scale: 0.9, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 240, damping: 26 }}
            className={`
              relative w-full max-w-xl
              rounded-3xl border border-white/20 shadow-2xl
              ring-1 ${ring}
              bg-gradient-to-br ${grad} backdrop-blur-md
              dark:border-white/10
              flex flex-col
            `}
          >
            {/* header */}
            <div className="flex items-center justify-between px-7 py-5">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                {isEditing ? `Edit ${title}` : title}
              </h2>
              <button
                aria-label="Close"
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 focus:outline-none"
              >
                <FaTimes className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>
            </div>

            {/* body (scrollable) */}
            <form
              onSubmit={onSubmit}
              className="flex-1 px-7 pb-28 overflow-y-auto space-y-6"
            >
              {children}

              {/* sticky footer */}
              <div
                className={`
                  absolute bottom-0 left-0 right-0
                  backdrop-blur-md bg-white/70 dark:bg-gray-900/70
                  border-t border-gray-200/60 dark:border-gray-700/60
                  rounded-b-3xl
                `}
              >
                <div className="flex justify-end gap-3 px-7 py-4">
                  <Button
                    type="button"
                    variant="outline"
                    color={color}
                    onClick={onClose}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" color={color}>
                    {submitText}
                  </Button>
                </div>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}