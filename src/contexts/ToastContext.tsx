import { createContext, useContext, useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast, { ToastType } from '../components/ui/Toast';
import useReportStore from '../store';

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
  duration?: number;
}

type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

const getPositionClasses = (position: ToastPosition) => {
  switch (position) {
    case 'top-right':
      return 'top-4 right-4';
    case 'top-left':
      return 'top-4 left-4';
    case 'bottom-right':
      return 'bottom-4 right-4';
    case 'bottom-left':
      return 'bottom-4 left-4';
    case 'top-center':
      return 'top-4 left-1/2 -translate-x-1/2';
    case 'bottom-center':
      return 'bottom-4 left-1/2 -translate-x-1/2';
    default:
      return 'top-4 right-4';
  }
};

// Default settings in case store settings are not loaded yet
const defaultSettings = {
  enabled: true,
  sound: true,
  duration: 3000,
  goalsAchievement: true,
  position: 'top-right' as const,
  style: {
    theme: 'system' as const,
    animation: 'slide' as const,
    showProgress: true
  },
  behavior: {
    stack: true,
    maxVisible: 3,
    pauseOnHover: true,
    closeOnClick: false,
    groupSimilar: true
  }
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const settings = useReportStore(state => state.settings);

  const showToast = useCallback((message: string, type: ToastType, duration?: number) => {
    // Use default settings if store settings are not loaded yet
    const notificationSettings = settings?.notifications || defaultSettings;
    
    if (!notificationSettings.enabled) return;
    
    const id = Date.now();
    const toastDuration = duration || notificationSettings.duration;
    
    // Check if we should stack notifications
    if (notificationSettings.behavior.stack) {
      setToasts(prev => {
        // If we have reached max visible, remove the oldest one
        if (prev.length >= notificationSettings.behavior.maxVisible) {
          return [...prev.slice(1), { id, message, type, duration: toastDuration }];
        }
        return [...prev, { id, message, type, duration: toastDuration }];
      });
    } else {
      // If not stacking, replace all existing toasts
      setToasts([{ id, message, type, duration: toastDuration }]);
    }

    if (notificationSettings.sound) {
      const audio = new Audio('/notification.mp3');
      audio.play().catch(() => {
        // Ignore errors if sound can't be played
      });
    }
  }, [settings?.notifications]);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // Use default settings if store settings are not loaded yet
  const notificationSettings = settings?.notifications || defaultSettings;

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div 
        className={`fixed z-50 space-y-2 ${getPositionClasses(notificationSettings.position)}`}
      >
        <AnimatePresence>
          {toasts.map(toast => (
            <Toast
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onClose={() => removeToast(toast.id)}
              duration={notificationSettings.duration}
              style={{
                theme: notificationSettings.style.theme,
                animation: notificationSettings.style.animation,
                showProgress: notificationSettings.style.showProgress
              }}
              behavior={{
                stack: notificationSettings.behavior.stack,
                maxVisible: notificationSettings.behavior.maxVisible,
                pauseOnHover: notificationSettings.behavior.pauseOnHover,
                closeOnClick: notificationSettings.behavior.closeOnClick,
                groupSimilar: notificationSettings.behavior.groupSimilar
              }}
            />
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
} 