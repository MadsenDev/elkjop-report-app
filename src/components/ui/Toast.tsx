import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastStyle {
  theme: 'light' | 'dark' | 'system';
  animation: 'slide' | 'fade' | 'scale';
  showProgress: boolean;
}

interface ToastBehavior {
  stack: boolean;
  maxVisible: number;
  pauseOnHover: boolean;
  closeOnClick: boolean;
  groupSimilar: boolean;
}

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
  style: ToastStyle;
  behavior: ToastBehavior;
}

const getToastStyles = (type: ToastType, theme: ToastStyle['theme']) => {
  const isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  
  switch (type) {
    case 'success':
      return isDark ? 'bg-green-900/50 text-green-200 border-green-800' : 'bg-green-50 text-green-800 border-green-200';
    case 'error':
      return isDark ? 'bg-red-900/50 text-red-200 border-red-800' : 'bg-red-50 text-red-800 border-red-200';
    case 'warning':
      return isDark ? 'bg-yellow-900/50 text-yellow-200 border-yellow-800' : 'bg-yellow-50 text-yellow-800 border-yellow-200';
    case 'info':
      return isDark ? 'bg-blue-900/50 text-blue-200 border-blue-800' : 'bg-blue-50 text-blue-800 border-blue-200';
    default:
      return isDark ? 'bg-gray-900/50 text-gray-200 border-gray-800' : 'bg-gray-50 text-gray-800 border-gray-200';
  }
};

const getAnimationVariants = (animation: ToastStyle['animation']) => {
  switch (animation) {
    case 'slide':
      return {
        initial: { opacity: 0, y: -20, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -20, scale: 0.95 }
      };
    case 'fade':
      return {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 }
      };
    case 'scale':
      return {
        initial: { opacity: 0, scale: 0.8 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.8 }
      };
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

export default function Toast({ message, type, onClose, duration = 3000, style, behavior }: ToastProps) {
  const [progress, setProgress] = useState(100);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!behavior.pauseOnHover || !isPaused) {
      const timer = setTimeout(onClose, duration);
      const progressTimer = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(progressTimer);
            return 0;
          }
          return prev - (100 / (duration / 100));
        });
      }, 100);

      return () => {
        clearTimeout(timer);
        clearInterval(progressTimer);
      };
    }
  }, [duration, onClose, behavior.pauseOnHover, isPaused]);

  const handleClick = () => {
    if (behavior.closeOnClick) {
      onClose();
    }
  };

  return (
    <motion.div
      {...getAnimationVariants(style.animation)}
      transition={{ duration: 0.2 }}
      className={`flex items-center gap-2 px-4 py-3 rounded-lg border ${getToastStyles(type, style.theme)} shadow-lg relative`}
      onClick={handleClick}
      onMouseEnter={() => behavior.pauseOnHover && setIsPaused(true)}
      onMouseLeave={() => behavior.pauseOnHover && setIsPaused(false)}
    >
      {getIcon(type)}
      <p className="text-sm font-medium">{message}</p>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
        className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      {style.showProgress && (
        <div className="absolute bottom-0 left-0 h-1 bg-current opacity-20" style={{ width: `${progress}%` }} />
      )}
    </motion.div>
  );
} 