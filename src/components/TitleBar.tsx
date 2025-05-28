import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import elkjopLogoWhite from '../assets/icon.png';
import elkjopLogoDark from '../assets/icon.png';

export default function TitleBar() {
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    // Listen for window maximize/restore events
    const unsubMaximize = window.electron.on('window-maximize', () => setIsMaximized(true));
    const unsubUnmaximize = window.electron.on('window-unmaximize', () => setIsMaximized(false));

    return () => {
      // Cleanup listeners
      unsubMaximize();
      unsubUnmaximize();
    };
  }, []);

  const handleMinimize = () => {
    window.electron.minimize();
  };

  const handleMaximize = () => {
    window.electron.maximize();
  };

  const handleClose = () => {
    window.electron.close();
  };

  return (
    <motion.div 
      className="h-12 bg-white dark:bg-gray-800 flex items-center justify-between px-4 select-none app-drag fixed top-0 left-0 right-0 z-50 shadow-md"
      style={{ WebkitAppRegion: 'drag' as any }}
      initial={{ y: -48 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      {/* Logo and Title */}
      <motion.div 
        className="flex items-center gap-2"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AnimatePresence mode="wait">
          <motion.img
            key="dark-logo"
            src={elkjopLogoDark}
            alt="Elkjøp logo"
            className="h-6 w-auto dark:hidden"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          />
          <motion.img
            key="light-logo"
            src={elkjopLogoWhite}
            alt="Elkjøp logo"
            className="h-6 w-auto hidden dark:block"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          />
        </AnimatePresence>
        <motion.span 
          className="text-gray-800 dark:text-white text-sm font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          Elkjøp Daily Report
        </motion.span>
      </motion.div>

      {/* Window Controls */}
      <motion.div 
        className="flex items-center gap-2" 
        style={{ WebkitAppRegion: 'no-drag' as any }}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
      >
        <motion.button
          onClick={handleMinimize}
          className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" />
          </svg>
        </motion.button>
        <motion.button
          onClick={handleMaximize}
          className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-white hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <AnimatePresence mode="wait">
            {isMaximized ? (
              <motion.svg
                key="restore"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ opacity: 0, rotate: -180 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 180 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 3v3a2 2 0 01-2 2H3m18 0h-3a2 2 0 01-2-2V3m0 18v-3a2 2 0 012-2h3M3 16h3a2 2 0 012 2v3" />
              </motion.svg>
            ) : (
              <motion.svg
                key="maximize"
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                initial={{ opacity: 0, rotate: 180 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: -180 }}
                transition={{ duration: 0.2 }}
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
              </motion.svg>
            )}
          </AnimatePresence>
        </motion.button>
        <motion.button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-white hover:bg-red-500 hover:text-white rounded transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </motion.button>
      </motion.div>
    </motion.div>
  );
} 