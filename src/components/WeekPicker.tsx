import { useEffect, useState, useRef } from 'react';
import useReportStore from '../store';
import { format, addDays, startOfWeek, endOfWeek } from 'date-fns';

export default function WeekPicker() {
  const selectedWeek = useReportStore((state) => state.selectedWeek);
  const availableWeeks = useReportStore((state) => state.availableWeeks);
  const setSelectedWeek = useReportStore((state) => state.setSelectedWeek);
  const loadAvailableWeeks = useReportStore((state) => state.loadAvailableWeeks);
  const settings = useReportStore((state) => state.settings);
  const selectedBudgetYear = useReportStore((state) => state.selectedBudgetYear);
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectedWeekRef = useRef<HTMLDivElement>(null);

  // Get the budget year (starts May 1st)
  const getBudgetYear = (date: Date) => {
    const month = date.getMonth() + 1; // getMonth() returns 0-11
    const year = date.getFullYear();
    return month < 5 ? year - 1 : year;
  };

  // Get the week number within the budget year
  const getWeekNumber = (date: Date) => {
    const budgetYear = getBudgetYear(date);
    const budgetYearStart = new Date(budgetYear, 4, 1); // May 1st (month is 0-based)
    
    // If the date is before May 1st, use the previous year's budget
    const startDate = date < budgetYearStart ? new Date(budgetYear - 1, 4, 1) : budgetYearStart;
    
    // Calculate days since budget year start
    const daysSinceStart = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate week number (1-based)
    return Math.floor(daysSinceStart / 7) + 1;
  };

  // Get current week key in budget year format
  const getCurrentWeekKey = () => {
    const now = new Date();
    const budgetYear = getBudgetYear(now);
    const weekNumber = getWeekNumber(now);
    return `${budgetYear}/${budgetYear + 1}-${weekNumber.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const initializeWeek = async () => {
      try {
        await loadAvailableWeeks();
        if (!selectedWeek) {
          // If we have a selected budget year, use its first week
          if (selectedBudgetYear) {
            const [startYear] = selectedBudgetYear.split('/');
            const firstWeek = `${selectedBudgetYear}-01`;
            setSelectedWeek(firstWeek);
            // Set initial week dates
            const budgetYear = parseInt(startYear);
            const budgetYearStart = new Date(budgetYear, 4, 1); // May 1st
            const weekStart = addDays(budgetYearStart, 0); // Week 1
            const start = startOfWeek(weekStart, { weekStartsOn: 1 });
            
            const dates = {
              Monday: format(addDays(start, 0), 'dd.MM'),
              Tuesday: format(addDays(start, 1), 'dd.MM'),
              Wednesday: format(addDays(start, 2), 'dd.MM'),
              Thursday: format(addDays(start, 3), 'dd.MM'),
              Friday: format(addDays(start, 4), 'dd.MM'),
              Saturday: format(addDays(start, 5), 'dd.MM')
            };
            
            await useReportStore.getState().setWeekDates(dates);
          } else {
            const currentWeek = getCurrentWeekKey();
            setSelectedWeek(currentWeek);
            // Set current week dates
            const [yearPart, weekNum] = currentWeek.split('-');
            const [startYear] = yearPart.split('/');
            const budgetYear = parseInt(startYear);
            const weekNumber = parseInt(weekNum);
            
            const budgetYearStart = new Date(budgetYear, 4, 1); // May 1st
            const weekStart = addDays(budgetYearStart, (weekNumber - 1) * 7);
            const start = startOfWeek(weekStart, { weekStartsOn: 1 });
            
            const dates = {
              Monday: format(addDays(start, 0), 'dd.MM'),
              Tuesday: format(addDays(start, 1), 'dd.MM'),
              Wednesday: format(addDays(start, 2), 'dd.MM'),
              Thursday: format(addDays(start, 3), 'dd.MM'),
              Friday: format(addDays(start, 4), 'dd.MM'),
              Saturday: format(addDays(start, 5), 'dd.MM')
            };
            
            await useReportStore.getState().setWeekDates(dates);
          }
        }
      } catch (error) {
        console.error('Failed to initialize week:', error);
      }
    };

    initializeWeek();
  }, [selectedBudgetYear]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && selectedWeekRef.current) {
      selectedWeekRef.current.scrollIntoView({ block: 'center' });
    }
  }, [isOpen]);

  const checkPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const dropdownHeight = 240;
      setDropUp(spaceBelow < dropdownHeight && spaceAbove > spaceBelow);
    }
  };

  const handleClick = () => {
    checkPosition();
    setIsOpen(!isOpen);
  };

  const formatWeekLabel = (weekKey: string) => {
    try {
      const [yearPart, week] = weekKey.split('-');
      const [startYear, endYear] = yearPart.split('/');
      const budgetYear = parseInt(startYear);
      const weekNum = parseInt(week);
      
      // Calculate the actual date for this week
      const budgetYearStart = new Date(budgetYear, 4, 1); // May 1st
      const weekStart = addDays(budgetYearStart, (weekNum - 1) * 7);
      const start = startOfWeek(weekStart, { weekStartsOn: 1 });
      const end = endOfWeek(weekStart, { weekStartsOn: 1 });
      
      return `${budgetYear}/${endYear}-${weekNum} (${format(start, 'MMM d')} - ${format(end, 'MMM d')})`;
    } catch (error) {
      console.error('Error formatting week:', error);
      return weekKey;
    }
  };

  const handleWeekSelect = async (week: string) => {
    setSelectedWeek(week);
    setIsOpen(false);

    // Calculate dates using the same logic as formatWeekLabel
    const [yearPart, weekNum] = week.split('-');
    const [startYear] = yearPart.split('/');
    const budgetYear = parseInt(startYear);
    const weekNumber = parseInt(weekNum);
    
    // Calculate the actual date for this week
    const budgetYearStart = new Date(budgetYear, 4, 1); // May 1st
    const weekStart = addDays(budgetYearStart, (weekNumber - 1) * 7);
    const start = startOfWeek(weekStart, { weekStartsOn: 1 });
    
    // Generate dates for each day of the week
    const dates = {
      Monday: format(addDays(start, 0), 'dd.MM'),
      Tuesday: format(addDays(start, 1), 'dd.MM'),
      Wednesday: format(addDays(start, 2), 'dd.MM'),
      Thursday: format(addDays(start, 3), 'dd.MM'),
      Friday: format(addDays(start, 4), 'dd.MM'),
      Saturday: format(addDays(start, 5), 'dd.MM')
    };
    
    await useReportStore.getState().setWeekDates(dates);
  };

  // Get the weeks to display based on the settings and selected budget year
  const displayWeeks = settings.showAllWeeks 
    ? Array.from({ length: 52 }, (_, i) => {
        const weekNum = i + 1;
        if (selectedBudgetYear) {
          return `${selectedBudgetYear}-${weekNum.toString().padStart(2, '0')}`;
        }
        const currentYear = new Date().getFullYear();
        const budgetYear = getBudgetYear(new Date());
        return `${budgetYear}/${budgetYear + 1}-${weekNum.toString().padStart(2, '0')}`;
      })
    : [...new Set([...availableWeeks, getCurrentWeekKey()])]
        .filter(week => !selectedBudgetYear || week.startsWith(selectedBudgetYear))
        .sort((a, b) => {
          const [yearPartA, weekA] = a.split('-');
          const [yearPartB, weekB] = b.split('-');
          const [startYearA] = yearPartA.split('/');
          const [startYearB] = yearPartB.split('/');
          const budgetYearA = parseInt(startYearA);
          const budgetYearB = parseInt(startYearB);
          const weekNumA = parseInt(weekA);
          const weekNumB = parseInt(weekB);
          return budgetYearA === budgetYearB ? weekNumA - weekNumB : budgetYearA - budgetYearB;
        });

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        ref={buttonRef}
        onClick={handleClick}
        className="flex items-center justify-between w-full px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-elkjop-green"
      >
        <span>{selectedWeek ? formatWeekLabel(selectedWeek) : 'Select Week'}</span>
        <svg
          className={`w-5 h-5 ml-2 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div 
          className={`absolute z-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto ${
            dropUp ? 'bottom-full mb-1' : 'top-full mt-1'
          }`}
        >
          {displayWeeks.map((week) => {
            const isCurrentWeek = week === getCurrentWeekKey();
            const isSelected = week === selectedWeek;
            
            return (
              <div
                key={week}
                ref={isSelected ? selectedWeekRef : null}
                onClick={() => handleWeekSelect(week)}
                className={`px-3 py-2 text-sm cursor-pointer text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                  isSelected 
                    ? 'bg-elkjop-green/10 dark:bg-elkjop-green/20 font-medium' 
                    : isCurrentWeek 
                      ? 'bg-gray-50 dark:bg-gray-700/50 border-l-2 border-elkjop-green'
                      : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <span>{formatWeekLabel(week)}</span>
                  {isCurrentWeek && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full bg-elkjop-green/10 dark:bg-elkjop-green/20 text-elkjop-green">
                      Current
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
} 