import { ReactNode, useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
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
import elkjopLogoWhite from '../assets/elkjop_logo_white.png';
import { useDisplaySettings } from '../contexts/DisplaySettingsContext';
import TitleBar from './TitleBar';
import MissingDataChecker from './MissingDataChecker';
import { format } from 'date-fns';

declare global {
  interface Window {
    __TAURI__?: {
      fs?: any;
    };
  }
}

// Animated number counter
function AnimatedNumber({ value, className = "" }: { value: number, className?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = display;
    let end = value;
    if (start === end) return;
    let raf: number;
    const step = () => {
      start += (end - start) / 8;
      if (Math.abs(end - start) < 1) {
        setDisplay(end);
      } else {
        setDisplay(start);
        raf = requestAnimationFrame(step);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className={className}>{Math.round(display)}</span>;
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
  const [partyMode, setPartyMode] = useState(false);
  const [showMessage, setShowMessage] = useState(false);
  const partyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const messageTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [partyProgress, setPartyProgress] = useState(0);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const mainContentControls = useAnimation();
  const [isResetting, setIsResetting] = useState(false);
  const { settings } = useDisplaySettings();
  const [reportImageData, setReportImageData] = useState<string | null>(null);
  const [reportType, setReportType] = useState<'day' | 'week' | null>(null);
  const [dayProgresses, setDayProgresses] = useState<Record<Day, number>>({
    Monday: 0,
    Tuesday: 0,
    Wednesday: 0,
    Thursday: 0,
    Friday: 0,
    Saturday: 0
  });

  // Get all the data we need from the store
  const avsAssignments = useReportStore((state) => state.avsAssignments);
  const insuranceAgreements = useReportStore((state) => state.insuranceAgreements);
  const precalibratedTVs = useReportStore((state) => state.precalibratedTVs);
  const repairTickets = useReportStore((state) => state.repairTickets);
  const goals = useReportStore((state) => state.goals);
  const weekDates = useReportStore((state) => state.weekDates);
  const loadWeekDates = useReportStore((state) => state.loadWeekDates);
  const setSelectedWeek = useReportStore((state) => state.setSelectedWeek);

  // Load week dates when component mounts
  useEffect(() => {
    const loadDates = async () => {
      await loadWeekDates();
    };
    loadDates();
  }, [loadWeekDates]);

  // Recalculate progress whenever any of the data changes
  useEffect(() => {
    const newProgresses = days.reduce((acc, day) => {
      acc[day] = calculateDayProgress(day);
      return acc;
    }, {} as Record<Day, number>);
    setDayProgresses(newProgresses);
  }, [avsAssignments, insuranceAgreements, precalibratedTVs, repairTickets, goals]);

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
    console.log('Layout: handleDayReport called');
    if (dayReportRef.current) {
      try {
        console.log('Layout: Generating day report image');
        const dataUrl = await htmlToImage.toPng(dayReportRef.current, { backgroundColor: '#f9fafb' });
        console.log('Layout: Image generated successfully');
        
        // Copy to clipboard using Electron
        console.log('Layout: Copying to clipboard');
        await window.electron.writeImage(dataUrl);
        
        // Store the image data and type for potential download
        setReportImageData(dataUrl);
        setReportType('day');
        
        console.log('Layout: Day report completed successfully');
        openModalWithCountdown('The daily summary was copied to clipboard.', 5);
      } catch (err) {
        console.error('Layout: Error generating day report:', err);
        openModalWithCountdown('Could not generate daily image: ' + err, 5);
      }
    }
  };

  // Generate Week Report Image
  async function handleWeekReportImage() {
    console.log('Layout: handleWeekReportImage called');
    if (weekReportRef.current) {
      try {
        console.log('Layout: Generating week report image');
        const dataUrl = await htmlToImage.toPng(weekReportRef.current, { backgroundColor: '#f9fafb' });
        console.log('Layout: Image generated successfully');
        
        // Copy to clipboard using Electron
        console.log('Layout: Copying to clipboard');
        await window.electron.writeImage(dataUrl);
        
        // Store the image data and type for potential download
        setReportImageData(dataUrl);
        setReportType('week');
        
        console.log('Layout: Week report completed successfully');
        openModalWithCountdown('The weekly summary was copied to clipboard.', 5);
      } catch (err) {
        console.error('Layout: Error generating week report:', err);
        openModalWithCountdown('Could not generate weekly image: ' + err, 5);
      }
    }
  }

  const handleDownloadReport = () => {
    if (!reportImageData || !reportType) return;

    const now = new Date();
    const dateStr = `${String(now.getDate()).padStart(2, '0')}.${String(now.getMonth() + 1).padStart(2, '0')}.${now.getFullYear()}`;
    const timeStr = `${String(now.getHours()).padStart(2, '0')}-${String(now.getMinutes()).padStart(2, '0')}-${String(now.getSeconds()).padStart(2, '0')}`;
    const filename = reportType === 'day' 
      ? `report_day_${selectedDay}_${dateStr}_${timeStr}.png`
      : `report_week_${dateStr}_${timeStr}.png`;

    const link = document.createElement('a');
    link.href = reportImageData;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  function handleResetData() {
    const selectedWeek = useReportStore.getState().selectedWeek;
    if (!selectedWeek) return;

    setIsResetting(true);
    setResetModalOpen(false);

    // Reset all data for the current week
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
      // Update the store state directly
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
      
      // Wait for 3 seconds before hiding the loading screen
      setTimeout(() => {
        setIsResetting(false);
        openModalWithCountdown('Week data has been reset successfully.', 3);
      }, 3000);
    }).catch(error => {
      setIsResetting(false);
      openModalWithCountdown('Failed to reset week data: ' + error, 3);
    });
  }

  const startParty = () => {
    if (partyTimerRef.current) return;
    partyTimerRef.current = setTimeout(() => {
      setPartyMode(true);
      // Show message after 1 second
      messageTimerRef.current = setTimeout(() => {
        setShowMessage(true);
      }, 1000);
      mainContentControls.start({
        scale: [1, 1.02, 1],
        rotate: [0, 1, -1, 0],
        transition: {
          duration: 2,
          repeat: Infinity,
          ease: "linear",
        }
      });
    }, 2000);
  };

  const stopParty = () => {
    if (partyTimerRef.current) {
      clearTimeout(partyTimerRef.current);
      partyTimerRef.current = null;
    }
    if (messageTimerRef.current) {
      clearTimeout(messageTimerRef.current);
      messageTimerRef.current = null;
    }
    setPartyMode(false);
    setShowMessage(false);
    setPartyProgress(0);
    mainContentControls.start({
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut"
      }
    });
  };

  const updatePartyProgress = () => {
    if (partyTimerRef.current) {
      setPartyProgress(prev => Math.min(prev + 1, 100));
    }
  };

  useEffect(() => {
    if (partyTimerRef.current) {
      const interval = setInterval(updatePartyProgress, 20);
      return () => clearInterval(interval);
    }
  }, [partyTimerRef.current]);

  // Calculate progress for each day
  const calculateDayProgress = (day: Day) => {
    const dayIdx = days.indexOf(day);
    const daysUpTo = days.slice(0, dayIdx + 1);

    // Calculate cumulative totals up to and including the selected day
    const totalGM = avsAssignments
      .filter((assignment) => daysUpTo.includes(assignment.day))
      .reduce((sum, assignment) => sum + assignment.gm, 0);

    const insuranceAgreementsTotal = insuranceAgreements
      .filter((t) => daysUpTo.includes(t.day))
      .reduce((sum, t) => sum + t.sold, 0);

    const precalibratedTVsTotal = precalibratedTVs
      .filter((p) => daysUpTo.includes(p.day))
      .reduce((sum, p) => sum + p.completed, 0);

    const repairTicketsTotal = repairTickets
      .filter((r) => daysUpTo.includes(r.day))
      .reduce((sum, r) => sum + r.completed, 0);

    // Get goals for the day
    const avsGoal = goals.find(g => g.section === 'AVS')?.goals[dayIdx] || 0;
    const insuranceAgreementsGoal = goals.find(g => g.section === 'Insurance Agreements')?.goals[dayIdx] || 0;
    const precalibratedTVsGoal = goals.find(g => g.section === 'Precalibrated TVs')?.goals[dayIdx] || 0;
    const repairTicketsGoal = goals.find(g => g.section === 'RepairTickets')?.goals[dayIdx] || 0;

    // Calculate progress for each section
    const avsProgress = avsGoal ? totalGM / avsGoal : 0;
    const insuranceAgreementsProgress = insuranceAgreementsGoal ? insuranceAgreementsTotal / insuranceAgreementsGoal : 0;
    const precalibratedTVsProgress = precalibratedTVsGoal ? precalibratedTVsTotal / precalibratedTVsGoal : 0;
    const repairTicketsProgress = repairTicketsGoal ? repairTicketsTotal / repairTicketsGoal : 0;

    // Cap each section's progress at 1 (100%)
    const cappedProgresses = [avsProgress, insuranceAgreementsProgress, precalibratedTVsProgress, repairTicketsProgress].map(p => Math.min(p, 1));
    const allGoalsMet = [avsProgress, insuranceAgreementsProgress, precalibratedTVsProgress, repairTicketsProgress].every(p => p >= 1);

    // Calculate daily progress
    const dailyProgress = ((allGoalsMet
      ? [avsProgress, insuranceAgreementsProgress, precalibratedTVsProgress, repairTicketsProgress]
      : cappedProgresses
    ).reduce((a, b) => a + b, 0) / 4) * 100;

    return Math.round(dailyProgress);
  };

  // Calculate if the current day's goal is met
  const isGoalMet = dayProgresses[selectedDay] >= 100;

  return (
    <div className="h-screen flex bg-gray-50 dark:bg-gray-900">
      <TitleBar isGoalMet={isGoalMet} />
          {/* Sidebar */}
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
                      <h2 className="text-xs font-semibold text-elkjop-green uppercase tracking-wider">
                        Navigation
                      </h2>
                    </div>
                    {days.map((day) => {
                  const progress = dayProgresses[day];
                      const isGoalMet = progress >= 100;
                  const date = weekDates[day];
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
                            {date && (
                              <span className="text-xs opacity-75">{date}</span>
                            )}
                          </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-16 h-1.5 bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min(progress, 100)}%` }}
                              transition={{ duration: 0.7 }}
                                  className={`h-full ${
                                    isGoalMet
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
                                isGoalMet ? 'text-elkjop-green' : 'text-white/70'
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
                      <span>Selected: <span className="font-medium text-white">{selectedDay}</span></span>
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
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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

      {/* Main Content */}
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
                            type: "spring",
                            stiffness: 500,
                            damping: 30
                          }}
                        >
                          {char}
                        </motion.span>
                      ))}
                    </motion.div>
                  </div>
                  <div className="flex items-center gap-2">
                    <MissingDataChecker 
                      onNavigateToDay={onDayChange} 
                      onNavigateToWeek={setSelectedWeek}
                    />
                    <ReportButtons
                      onDayReport={handleDayReport}
                      onWeekReport={handleWeekReportImage}
                      selectedDay={selectedDay}
                    />
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

      {/* Hidden Reports for Image Generation */}
      <HiddenReports
        dayReportRef={dayReportRef}
        weekReportRef={weekReportRef}
        selectedDay={selectedDay}
      />

          {/* Modals */}
          <Modal
            isOpen={modalOpen}
            onClose={handleModalClose}
        title="Success"
            message={modalMessage}
            countdown={modalCountdown}
          />
          <Modal
            isOpen={resetModalOpen}
            onClose={() => setResetModalOpen(false)}
            title="Reset Data"
            message="Are you sure you want to reset all data? This action cannot be undone."
        confirmText="Reset"
            onConfirm={handleResetData}
          />
          <SettingsModal
            isOpen={settingsOpen}
            onClose={() => setSettingsOpen(false)}
          />
      {isResetting && <ResetLoadingScreen isOpen={isResetting} />}
    </div>
  );
} 