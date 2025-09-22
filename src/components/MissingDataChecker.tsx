import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useReportStore from '../store';
import { Day } from '../types';
import { ExclamationTriangleIcon, XMarkIcon, ArrowRightIcon, CheckIcon } from '@heroicons/react/24/outline';
import { format, subDays, isAfter, isBefore, startOfDay } from 'date-fns';
import { db } from '../services/db';

interface MissingDay {
  day: Day;
  date: string;
  week: string;
  missingSections: string[];
  hasAnyData: boolean;
}

interface MissingDataCheckerProps {
  onNavigateToDay: (day: Day) => void;
  onNavigateToWeek: (week: string) => void;
}

export default function MissingDataChecker({ onNavigateToDay, onNavigateToWeek }: MissingDataCheckerProps) {
  const [missingDays, setMissingDays] = useState<MissingDay[]>([]);
  const [dismissedDays, setDismissedDays] = useState<Set<string>>(new Set());
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const setSelectedWeek = useReportStore((state) => state.setSelectedWeek);
  const setSelectedDay = useReportStore((state) => state.setSelectedDay);

  // Load dismissed days from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('elkjop-dismissed-days');
    if (saved) {
      try {
        setDismissedDays(new Set(JSON.parse(saved)));
      } catch (error) {
        console.error('Failed to load dismissed days:', error);
      }
    }
  }, []);

  // Save dismissed days to localStorage
  const saveDismissedDays = (newDismissedDays: Set<string>) => {
    setDismissedDays(newDismissedDays);
    localStorage.setItem('elkjop-dismissed-days', JSON.stringify(Array.from(newDismissedDays)));
  };

  // Check for missing data across all weeks
  const checkMissingData = async () => {
    setIsLoading(true);
    
    try {
      // Get all available weeks
      const availableWeeks = await db.getAvailableWeeks();
      const daysToCheck: MissingDay[] = [];
      
      // Generate weeks to check - include recent weeks even if they don't have data
      const weeksToCheck = new Set(availableWeeks);
      
      // Add recent weeks that might not have data yet
      const currentDate = new Date();
      const currentBudgetYear = currentDate.getMonth() < 4 ? currentDate.getFullYear() - 1 : currentDate.getFullYear();
      
      // Add last 8 weeks to check
      for (let i = 0; i < 8; i++) {
        const checkDate = new Date(currentDate);
        checkDate.setDate(checkDate.getDate() - (i * 7));
        
        const budgetYear = checkDate.getMonth() < 4 ? checkDate.getFullYear() - 1 : checkDate.getFullYear();
        const budgetYearStart = new Date(budgetYear, 4, 1); // May 1st
        const daysSinceStart = Math.floor((checkDate.getTime() - budgetYearStart.getTime()) / (1000 * 60 * 60 * 24));
        const weekNumber = Math.floor(daysSinceStart / 7) + 1;
        
        if (weekNumber > 0 && weekNumber <= 52) {
          const weekKey = `${budgetYear}/${budgetYear + 1}-${weekNumber.toString().padStart(2, '0')}`;
          weeksToCheck.add(weekKey);
        }
      }
      
      
      // Check each week for missing data
      for (const week of weeksToCheck) {
        // Get data for this week
        const [avsAssignments, insuranceAgreements, precalibratedTVs, repairTickets, weekDates] = await Promise.all([
          db.getAVSAssignments(week),
          db.getInsuranceAgreements(week),
          db.getPrecalibratedTVs(week),
          db.getRepairTickets(week),
          db.getWeekDates(week)
        ]);
        
        // Check each day of the week
        const days: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        
        for (const day of days) {
          // Get the date for this day if available
          const dayDate = weekDates?.[day] || '';
          const dateString = dayDate || '';
          
          
          // Check if this day has any data
          const dayAVS = (avsAssignments || []).filter(a => a.day === day);
          const dayInsurance = (insuranceAgreements || []).filter(i => i.day === day);
          const dayTVs = (precalibratedTVs || []).filter(t => t.day === day);
          const dayRepairs = (repairTickets || []).filter(r => r.day === day);
          
          const hasAVS = dayAVS.length > 0;
          const hasInsurance = dayInsurance.length > 0;
          const hasTVs = dayTVs.length > 0;
          const hasRepairs = dayRepairs.length > 0;
          
          const hasAnyData = hasAVS || hasInsurance || hasTVs || hasRepairs;
          
          // Only flag days that have NO data in ANY section (completely empty days)
          const dayKey = `${week}-${day}-${dateString}`;
          if (!hasAnyData && !dismissedDays.has(dayKey)) {
            // All sections are missing for completely empty days
            const missingSections = ['AVS', 'Insurance', 'Precalibrated TVs', 'Repair Tickets'];
            
            daysToCheck.push({
              day,
              date: dateString,
              week,
              missingSections,
              hasAnyData: false
            });
          }
        }
      }
      
      // Sort by week (most recent first) and then by day
      daysToCheck.sort((a, b) => {
        if (a.week !== b.week) {
          return b.week.localeCompare(a.week);
        }
        const dayOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day);
      });
      
      setMissingDays(daysToCheck);
    } catch (error) {
      console.error('Failed to check missing data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Run check when component mounts or dismissed days change
  useEffect(() => {
    checkMissingData();
  }, [dismissedDays]);

  const dismissDay = (day: Day, date: string, week: string) => {
    const dayKey = `${week}-${day}-${date}`;
    const newDismissedDays = new Set(dismissedDays);
    newDismissedDays.add(dayKey);
    saveDismissedDays(newDismissedDays);
  };

  const undismissDay = (day: Day, date: string, week: string) => {
    const dayKey = `${week}-${day}-${date}`;
    const newDismissedDays = new Set(dismissedDays);
    newDismissedDays.delete(dayKey);
    saveDismissedDays(newDismissedDays);
  };

  const handleNavigateToDay = async (day: Day, week: string) => {
    // First navigate to the correct week
    await setSelectedWeek(week);
    // Then navigate to the day
    setSelectedDay(day);
    onNavigateToDay(day);
    // Auto-close the dropdown
    setIsOpen(false);
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatDisplayDate = (dateString: string) => {
    if (!dateString || dateString === '') {
      return 'No date';
    }
    
    // Handle dd.MM format (e.g., "15.05")
    if (dateString.includes('.')) {
      const [day, month] = dateString.split('.');
      const currentYear = new Date().getFullYear();
      const date = new Date(currentYear, parseInt(month) - 1, parseInt(day));
      
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      
      return format(date, 'MMM dd');
    }
    
    // Handle other formats
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return format(date, 'MMM dd');
  };

  const getDayColor = (day: Day) => {
    const colors = {
      Monday: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
      Tuesday: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      Wednesday: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
      Thursday: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
      Friday: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
      Saturday: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
    };
    return colors[day];
  };

  const getSectionColor = (section: string) => {
    const colors = {
      'AVS': 'text-blue-600 dark:text-blue-400',
      'Insurance': 'text-green-600 dark:text-green-400',
      'Precalibrated TVs': 'text-purple-600 dark:text-purple-400',
      'Repair Tickets': 'text-orange-600 dark:text-orange-400',
    };
    return colors[section as keyof typeof colors] || 'text-gray-600 dark:text-gray-400';
  };

  if (missingDays.length === 0 && !isLoading) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Notification Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 dark:text-gray-300 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors"
        title={`${missingDays.length} completely empty day${missingDays.length !== 1 ? 's' : ''}`}
      >
        <ExclamationTriangleIcon className="w-6 h-6" />
        {missingDays.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-yellow-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
            {missingDays.length > 99 ? '99+' : missingDays.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-h-96 overflow-hidden"
          >
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-yellow-50 dark:bg-yellow-900/20">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    Empty Days
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {missingDays.length} day{missingDays.length !== 1 ? 's' : ''}
                  </span>
                  <button
                    onClick={checkMissingData}
                    disabled={isLoading}
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                    title="Refresh"
                  >
                    <svg className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="max-h-80 overflow-y-auto">
              {missingDays.length === 0 && !isLoading ? (
                <div className="text-center py-6">
                  <CheckIcon className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    All recent days have some data
                  </p>
                </div>
              ) : (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {missingDays.map((missingDay) => (
                    <motion.div
                      key={`${missingDay.week}-${missingDay.day}-${missingDay.date}`}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      className="p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDayColor(missingDay.day)}`}>
                            {missingDay.day}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {formatDisplayDate(missingDay.date)}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-1.5 py-0.5 rounded">
                            W{missingDay.week.split('-')[1]}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleNavigateToDay(missingDay.day, missingDay.week)}
                            className="p-1.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            title="Go to day"
                          >
                            <ArrowRightIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => dismissDay(missingDay.day, missingDay.date, missingDay.week)}
                            className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                            title="Dismiss (no activity this day)"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <div className="flex flex-wrap gap-1">
                          {missingDay.missingSections.map((section) => (
                            <span
                              key={section}
                              className={`px-2 py-0.5 rounded text-xs font-medium bg-gray-200 dark:bg-gray-700 ${getSectionColor(section)}`}
                            >
                              {section}
                            </span>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
