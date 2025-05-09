import { ReactNode, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Day } from '../types';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import * as htmlToImage from 'html-to-image';
import Modal from './Modal';
import DarkModeToggle from './DarkModeToggle';
import HiddenReports from './HiddenReports';
import ReportButtons from './ReportButtons';
import SettingsModal from './SettingsModal';

declare global {
  interface Window {
    __TAURI__?: {
      fs?: any;
    };
  }
}

interface LayoutProps {
  children: ReactNode;
  selectedDay: Day;
  onDayChange: (day: Day) => void;
}

export default function Layout({ children, selectedDay, onDayChange }: LayoutProps) {
  const days: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const dayReportRef = useRef<HTMLDivElement>(null);
  const weekReportRef = useRef<HTMLDivElement>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalCountdown, setModalCountdown] = useState(0);
  const modalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Always select current day on mount
  useEffect(() => {
    const jsDay = new Date().getDay(); // 0=Sunday, 1=Monday, ...
    const dayMap = [null, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const today = jsDay === 0 ? 'Monday' : dayMap[jsDay];
    if (days.includes(today as Day)) {
      onDayChange(today as Day);
    } else {
      onDayChange('Monday');
    }
  }, [onDayChange]);

  // Show modal with countdown
  const openModalWithCountdown = (message: string, seconds: number = 5) => {
    setModalMessage(message);
    setModalCountdown(seconds);
    setModalOpen(true);
  };

  useEffect(() => {
    if (modalOpen && modalCountdown > 0) {
      if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
      modalTimerRef.current = setTimeout(() => {
        setModalCountdown((c) => c - 1);
      }, 1000);
    } else if (modalOpen && modalCountdown === 0) {
      setModalOpen(false);
      setModalCountdown(0);
    }
    return () => {
      if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
    };
  }, [modalOpen, modalCountdown]);

  const handleModalClose = () => {
    setModalOpen(false);
    setModalCountdown(0);
    if (modalTimerRef.current) clearTimeout(modalTimerRef.current);
  };

  // Generate Day Report CSV
  const handleDayReport = async () => {
    console.log('Day Report button clicked');
    if (dayReportRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(dayReportRef.current, { backgroundColor: '#f9fafb' });
        const now = new Date();
        const dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
        const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
        const filename = `report_day_${selectedDay}_${dateStr}_${timeStr}.png`;
        const link = document.createElement('a');
        link.href = dataUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        openModalWithCountdown('The daily summary was downloaded as an image. You can find the image in your Downloads folder.', 5);
      } catch (err) {
        openModalWithCountdown('Could not download daily image: ' + err, 5);
      }
    }
  };

  // Generate Week Report Image
  async function handleWeekReportImage() {
    console.log('Week Report button clicked');
    if (weekReportRef.current) {
      try {
        const dataUrl = await htmlToImage.toPng(weekReportRef.current, { backgroundColor: '#f9fafb' });
        const now = new Date();
        const dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
        const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
        const filename = `report_week_${dateStr}_${timeStr}.png`;
        const link = document.createElement('a');
        link.href = dataUrl;
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        openModalWithCountdown('The weekly summary was downloaded as an image. You can find the image in your Downloads folder.', 5);
      } catch (err) {
        openModalWithCountdown('Could not download weekly image: ' + err, 5);
      }
    }
  }

  function handleResetData() {
    localStorage.removeItem('elkjop-report-store');
    window.location.reload();
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <HiddenReports
        dayReportRef={dayReportRef}
        weekReportRef={weekReportRef}
        selectedDay={selectedDay}
      />

      {/* Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed inset-y-0 left-0 w-72 bg-elkjop-blue shadow-lg z-30"
          >
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-elkjop-green/30">
                <div className="flex items-center justify-between">
                  <img src="/elkjop_logo_white.png" alt="Elkjøp logo" className="h-10 w-auto" />
                  <div className="flex items-center gap-2">
                    <DarkModeToggle />
                    <button
                      onClick={() => setSettingsOpen(true)}
                      className="p-2 rounded-lg hover:bg-elkjop-blue-dark"
                      title="Settings"
                    >
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              
              <nav className="flex-1 px-4 py-6 space-y-2">
                <div className="px-3 mb-4">
                  <h2 className="text-xs font-semibold text-elkjop-green uppercase tracking-wider">
                    Navigation
                  </h2>
                </div>
                {days.map((day) => (
                  <button
                    key={day}
                    onClick={() => onDayChange(day)}
                    className={`w-full px-4 py-3 text-left rounded-xl transition-all ${
                      selectedDay === day
                        ? 'bg-elkjop-green/10 text-elkjop-green font-semibold shadow-sm'
                        : 'text-white hover:bg-elkjop-blue-dark'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>{day}</span>
                    </div>
                  </button>
                ))}
              </nav>

              <div className="p-4 border-t border-elkjop-green/30 flex flex-col gap-4">
                <div className="flex items-center space-x-3 text-sm text-elkjop-green">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>Selected: <span className="font-medium text-white">{selectedDay}</span></span>
                </div>
                <button
                  onClick={() => setResetModalOpen(true)}
                  className="mt-4 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Reset Data
                </button>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className={`flex transition-all duration-300 ${sidebarOpen ? 'ml-72' : ''}`}>
        <div className="flex-1 p-6">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
            >
              {sidebarOpen ? (
                <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Bars3Icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            <ReportButtons
              onDayReport={handleDayReport}
              onWeekReport={handleWeekReportImage}
            />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto space-y-8"
          >
            {children}
          </motion.div>
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={modalOpen}
        onClose={handleModalClose}
        title="Notification"
        message={modalMessage}
        countdown={modalCountdown}
      />

      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Data"
        message="Are you sure you want to reset all data? This action cannot be undone."
        onConfirm={handleResetData}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
} 