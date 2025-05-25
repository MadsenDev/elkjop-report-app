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
import WeekPicker from './WeekPicker';
import useReportStore from '../store';
import { db } from '../services/db';
import ResetLoadingScreen from './ResetLoadingScreen';
import { useDisplaySettings } from '../contexts/DisplaySettingsContext';
import CompactDaySummary from './CompactDaySummary';
import CompactAVSSection from './CompactAVSSection';
import CompactInsuranceSection from './CompactInsuranceSection';
import CompactTVSection from './CompactTVSection';
import CompactRepairSection from './CompactRepairSection';

interface LayoutProps {
  selectedDay: Day;
  onDayChange: (day: Day) => void;
}

export default function CompactLayout({ selectedDay, onDayChange }: LayoutProps) {
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
  const [isResetting, setIsResetting] = useState(false);
  const { settings: displaySettings } = useDisplaySettings();

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

  // Generate Day Report Image
  const handleDayReport = async () => {
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
        openModalWithCountdown('Could not generate daily image: ' + err, 5);
      }
    }
  };

  // Generate Week Report Image
  async function handleWeekReportImage() {
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
        openModalWithCountdown('Could not generate weekly image: ' + err, 5);
      }
    }
  }

  function handleResetData() {
    const selectedWeek = useReportStore.getState().selectedWeek;
    if (!selectedWeek) return;

    setIsResetting(true);
    setResetModalOpen(false);

    Promise.all([
      db.setAVSAssignments([], selectedWeek),
      db.setInsuranceAgreements([], selectedWeek),
      db.setPrecalibratedTVs([], selectedWeek),
      db.setRepairTickets([], selectedWeek),
      db.setQualityInspections([], selectedWeek),
      db.setWeekDates({
        Monday: '',
        Tuesday: '',
        Wednesday: '',
        Thursday: '',
        Friday: '',
        Saturday: ''
      }, selectedWeek)
    ]).then(() => {
      useReportStore.setState({
        avsAssignments: [],
        insuranceAgreements: [],
        precalibratedTVs: [],
        repairTickets: [],
        qualityInspections: [],
        weekDates: {
          Monday: '',
          Tuesday: '',
          Wednesday: '',
          Thursday: '',
          Friday: '',
          Saturday: ''
        }
      });
      
      setTimeout(() => {
        setIsResetting(false);
        openModalWithCountdown('Week data has been reset successfully.', 3);
      }, 3000);
    }).catch(error => {
      setIsResetting(false);
      openModalWithCountdown('Failed to reset week data: ' + error, 3);
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-[background-color,color,border-color] duration-500 ease-in-out">
      <main>
        <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
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
                className="fixed inset-y-0 left-0 w-64 bg-elkjop-blue shadow-lg z-30 transition-[background-color,color,border-color] duration-500 ease-in-out"
              >
                <div className="flex flex-col h-full">
                  <div className="p-4 border-b border-elkjop-green/30">
                    <div className="flex items-center justify-between">
                      <img src="/elkjop_logo_white.png" alt="Elkjøp logo" className="h-8 w-auto" />
                      <div className="flex items-center gap-2">
                        <DarkModeToggle />
                        <button
                          onClick={() => setSettingsOpen(true)}
                          className="p-1.5 rounded-lg hover:bg-elkjop-blue-dark"
                          title="Settings"
                        >
                          <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <nav className="flex-1 px-3 py-4 space-y-1">
                    <div className="px-2 mb-2">
                      <h2 className="text-xs font-semibold text-elkjop-green uppercase tracking-wider">
                        Navigation
                      </h2>
                    </div>
                    {days.map((day) => (
                      <button
                        key={day}
                        onClick={() => onDayChange(day)}
                        className={`w-full px-3 py-2 text-left rounded-lg transition-all ${
                          selectedDay === day
                            ? 'bg-elkjop-green/10 text-elkjop-green font-semibold shadow-sm'
                            : 'text-white hover:bg-elkjop-blue-dark'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-sm">{day}</span>
                        </div>
                      </button>
                    ))}
                  </nav>

                  <div className="p-3 border-t border-elkjop-green/30 flex flex-col gap-3">
                    <div className="flex items-center space-x-2 text-xs text-elkjop-green">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span>Selected: <span className="font-medium text-white">{selectedDay}</span></span>
                    </div>
                    <div className="flex flex-col gap-2">
                      <WeekPicker />
                      <button
                        onClick={() => setResetModalOpen(true)}
                        className="flex items-center space-x-2 px-3 py-1.5 text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        disabled={isResetting}
                      >
                        {isResetting ? (
                          <>
                            <svg className="animate-spin h-4 w-4 text-red-600 dark:text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Resetting...</span>
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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

          {/* Main content */}
          <div className={`flex transition-all duration-500 ease-in-out ${sidebarOpen ? 'ml-64' : ''}`}>
            <div className="flex-1 transition-[background-color,color,border-color] duration-500 ease-in-out">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="p-1.5 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                  >
                    {sidebarOpen ? (
                      <XMarkIcon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    ) : (
                      <Bars3Icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                    )}
                  </button>
                  <motion.div
                    key={selectedDay}
                    className="text-lg font-semibold text-gray-800 dark:text-gray-200"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    {selectedDay}
                  </motion.div>
                </div>
                <ReportButtons
                  onDayReport={handleDayReport}
                  onWeekReport={handleWeekReportImage}
                  selectedDay={selectedDay}
                />
              </div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-4"
              >
                <CompactDaySummary day={selectedDay} />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {displaySettings.showSections.avs && (
                    <CompactAVSSection day={selectedDay} />
                  )}
                  {displaySettings.showSections.insurance && (
                    <CompactInsuranceSection day={selectedDay} />
                  )}
                  {displaySettings.showSections.precalibrated && (
                    <CompactTVSection day={selectedDay} />
                  )}
                  {displaySettings.showSections.repair && (
                    <CompactRepairSection day={selectedDay} />
                  )}
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </main>

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
        confirmText="Reset"
        cancelText="Cancel"
      />

      <ResetLoadingScreen isOpen={isResetting} />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </div>
  );
} 