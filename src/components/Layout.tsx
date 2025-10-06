import { ReactNode, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Day, days } from '../types';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import Modal from './Modal';
import DarkModeToggle from './DarkModeToggle';
import HiddenReports from './HiddenReports';
import ReportButtons from './ReportButtons';
import SettingsModal from './SettingsModal';
import WeekPicker from './WeekPicker';
import useReportStore from '../store';
import ResetLoadingScreen from './ResetLoadingScreen';
import elkjopLogoWhite from '../assets/elkjop_logo_white.png';
import TitleBar from './TitleBar';
import MissingDataChecker from './MissingDataChecker';
import { useReportExport } from '../hooks/useReportExport';
import { useDayProgress } from '../hooks/useDayProgress';
import { useWeekReset } from '../hooks/useWeekReset';

function AnimatedNumber({ value, className = '' }: { value: number; className?: string }) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    let start = display;
    const end = value;
    if (start === end) {
      return;
    }

    let animationFrame: number;
    const step = () => {
      start += (end - start) / 8;
      if (Math.abs(end - start) < 1) {
        setDisplay(end);
      } else {
        setDisplay(start);
        animationFrame = requestAnimationFrame(step);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [value]);

  return <span className={className}>{Math.round(display)}</span>;
}

interface LayoutProps {
  children: ReactNode;
  selectedDay: Day;
  onDayChange: (day: Day) => void;
}

export default function Layout({ children, selectedDay, onDayChange }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalCountdown, setModalCountdown] = useState(0);
  const modalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const weekDates = useReportStore((state) => state.weekDates);
  const loadWeekDates = useReportStore((state) => state.loadWeekDates);
  const setSelectedWeek = useReportStore((state) => state.setSelectedWeek);

  const openModalWithCountdown = (message: string, seconds = 5) => {
    setModalMessage(message);
    setModalCountdown(seconds);
    setModalOpen(true);
  };

  const { dayProgresses, isGoalMet } = useDayProgress(selectedDay);
  const { isResetting, resetWeek } = useWeekReset();

  const { dayReportRef, weekReportRef, handleDayReport, handleWeekReport } = useReportExport({
    onSuccess: (message) => openModalWithCountdown(message, 5),
    onError: (message) => openModalWithCountdown(message, 5),
  });

  useEffect(() => {
    void loadWeekDates();
  }, [loadWeekDates]);

  useEffect(() => {
    if (!modalOpen) {
      return;
    }

    if (modalCountdown > 0) {
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current);
      }
      modalTimerRef.current = setTimeout(() => {
        setModalCountdown((count) => count - 1);
      }, 1000);
    } else {
      setModalOpen(false);
    }

    return () => {
      if (modalTimerRef.current) {
        clearTimeout(modalTimerRef.current);
      }
    };
  }, [modalCountdown, modalOpen]);

  const handleModalClose = () => {
    setModalOpen(false);
    setModalCountdown(0);
    if (modalTimerRef.current) {
      clearTimeout(modalTimerRef.current);
    }
  };

  const handleResetData = async () => {
    try {
      const success = await resetWeek();
      if (success) {
        openModalWithCountdown('Week data has been reset successfully.', 3);
      } else {
        openModalWithCountdown('Select a week before resetting data.', 3);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      openModalWithCountdown(`Failed to reset week data: ${message}`, 5);
    }
  };

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      <TitleBar isGoalMet={isGoalMet} />

      <AnimatePresence>
        {sidebarOpen && (
          <motion.aside
            initial={{ x: -300 }}
            animate={{ x: 0 }}
            exit={{ x: -300 }}
            className="fixed inset-y-0 left-0 w-72 bg-elkjop-blue shadow-lg z-40 mt-12 transition-[background-color,color,border-color] duration-500 ease-in-out"
          >
            <div className="flex flex-col h-full">
              <div className="p-6 border-b border-elkjop-green/30">
                <div className="flex items-center justify-between">
                  <img src={elkjopLogoWhite} alt="Elkjøp logo" className="h-10 w-auto" />
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
                  <h2 className="text-xs font-semibold text-elkjop-green uppercase tracking-wider">Navigation</h2>
                </div>
                {days.map((day) => {
                  const progress = dayProgresses[day];
                  const date = weekDates[day];
                  const isDayGoalMet = progress >= 100;
                  return (
                    <button
                      key={day}
                      onClick={() => onDayChange(day)}
                      className={`w-full px-4 py-3 text-left rounded-xl transition-all ${
                        selectedDay === day
                          ? 'bg-elkjop-green/10 text-elkjop-green font-semibold shadow-sm'
                          : 'text-white hover:bg-elkjop-blue-dark'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <div className="flex flex-col">
                            <span>{day}</span>
                            {date && <span className="text-xs opacity-75">{date}</span>}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(progress, 100)}%` }}
                              transition={{ duration: 0.7 }}
                              className={`h-full ${
                                isDayGoalMet
                                  ? 'bg-gradient-to-r from-elkjop-green to-green-400'
                                  : 'bg-elkjop-green'
                              }`}
                            />
                          </div>
                          <motion.span
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.3 }}
                            className={`text-xs font-medium ${
                              isDayGoalMet ? 'text-elkjop-green' : 'text-white/70'
                            }`}
                          >
                            <AnimatedNumber value={progress} />%
                          </motion.span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </nav>

              <div className="p-4 border-t border-elkjop-green/30 flex flex-col gap-4">
                <div className="flex items-center space-x-3 text-sm text-elkjop-green">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>
                    Selected: <span className="font-medium text-white">{selectedDay}</span>
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  <WeekPicker />
                  <button
                    onClick={() => setResetModalOpen(true)}
                    className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    disabled={isResetting}
                  >
                    {isResetting ? (
                      <>
                        <svg className="animate-spin h-5 w-5 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        <span>Resetting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Reset Week</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      <div className={`flex-1 transition-all duration-500 ease-in-out ${sidebarOpen ? 'ml-72' : ''}`}>
        <div className="h-full flex flex-col">
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 pt-16">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-4">
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
                  <motion.div
                    key={selectedDay}
                    className="text-xl font-semibold text-gray-800 dark:text-gray-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {selectedDay.split('').map((char, index) => (
                      <motion.span
                        key={`${char}-${index}`}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{
                          duration: 0.1,
                          delay: index * 0.05,
                          type: 'spring',
                          stiffness: 500,
                          damping: 30,
                        }}
                      >
                        {char}
                      </motion.span>
                    ))}
                  </motion.div>
                </div>
                <div className="flex items-center gap-2">
                  <MissingDataChecker onNavigateToDay={onDayChange} onNavigateToWeek={setSelectedWeek} />
                  <ReportButtons onDayReport={handleDayReport} onWeekReport={handleWeekReport} selectedDay={selectedDay} />
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                {children}
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      <HiddenReports dayReportRef={dayReportRef} weekReportRef={weekReportRef} selectedDay={selectedDay} />

      <Modal isOpen={modalOpen} onClose={handleModalClose} title="Success" message={modalMessage} countdown={modalCountdown} />
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Data"
        message="Are you sure you want to reset all data? This action cannot be undone."
        confirmText="Reset"
        onConfirm={handleResetData}
      />
      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      {isResetting && <ResetLoadingScreen isOpen={isResetting} />}
    </div>
  );
}
