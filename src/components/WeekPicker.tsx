import { useEffect, useState, useRef } from 'react';
import useReportStore from '../store';
import { format, addDays, startOfWeek, endOfWeek, getWeek, getYear } from 'date-fns';

export default function WeekPicker() {
  const selectedWeek = useReportStore((state) => state.selectedWeek);
  const availableWeeks = useReportStore((state) => state.availableWeeks);
  const setSelectedWeek = useReportStore((state) => state.setSelectedWeek);
  const loadAvailableWeeks = useReportStore((state) => state.loadAvailableWeeks);
  const settings = useReportStore((state) => state.settings);
  const loadSettings = useReportStore((state) => state.loadSettings);
  const [isOpen, setIsOpen] = useState(false);
  const [dropUp, setDropUp] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const selectedWeekRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const initializeWeek = async () => {
      try {
        // First load available weeks
        await loadAvailableWeeks();
        
        // Get the current week key
        const currentWeek = getCurrentWeekKey();
        
        // If no week is selected, set it to current week
        if (!selectedWeek) {
          setSelectedWeek(currentWeek);
        }
      } catch (error) {
        console.error('Failed to initialize week:', error);
      }
    };

    initializeWeek();
  }, []); // Empty dependency array means this runs once on mount

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to selected week when dropdown opens
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
      const dropdownHeight = 240; // Approximate max height of dropdown
      
      setDropUp(spaceBelow < dropdownHeight && spaceAbove > spaceBelow);
    }
  };

  const handleClick = () => {
    checkPosition();
    setIsOpen(!isOpen);
  };

  const formatWeekLabel = (weekKey: string) => {
    try {
      const [year, week] = weekKey.split('-');
      const date = new Date(parseInt(year), 0, 1);
      const weekStart = addDays(date, (parseInt(week) - 1) * 7);
      const start = startOfWeek(weekStart, { weekStartsOn: 1 });
      const end = endOfWeek(weekStart, { weekStartsOn: 1 });
      
      return `Week ${week} (${format(start, 'MMM d')} - ${format(end, 'MMM d, yyyy')})`;
    } catch (error) {
      console.error('Error formatting week:', error);
      return weekKey;
    }
  };

  const handleWeekSelect = (week: string) => {
    setSelectedWeek(week);
    setIsOpen(false);
  };

  // Get the weeks to display based on the settings
  const displayWeeks = settings.showAllWeeks 
    ? Array.from({ length: 52 }, (_, i) => {
        const weekNum = i + 1;
        return `${getYear(new Date())}-${weekNum.toString().padStart(2, '0')}`;
      })
    : availableWeeks;

  // Get current week key
  const getCurrentWeekKey = () => {
    const now = new Date();
    const weekNum = getWeek(now, { weekStartsOn: 1 });
    return `${getYear(now)}-${weekNum.toString().padStart(2, '0')}`;
  };

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