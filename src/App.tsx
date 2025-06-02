import { useEffect, useState } from 'react';
import useReportStore from './store';
import Layout from './components/Layout';
import DaySummary from './components/DaySummary';
import AVSSection from './components/AVSSection';
import InsuranceAgreementSection from './components/TrygghetsavtaleSection';
import PreklargjortTVSection from './components/PreklargjortTVSection';
import RepairTicketsSection from './components/RepairTicketsSection';
import LoadingScreen from './components/LoadingScreen';
import { ThemeProvider } from './contexts/ThemeContext';
import { DisplaySettingsProvider, useDisplaySettings } from './contexts/DisplaySettingsContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import { VERSION } from './config/version';
import { loadServices, loadPeople, loadGoals, loadWeekDates, loadAllData, loadSettings, loadAvailableWeeks } from './store';
import TitleBar from './components/TitleBar';
import { Day } from './types';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [initialDay, setInitialDay] = useState<Day>('Monday');

  // Only access store data after initialization
  const selectedDay = useReportStore((state) => isInitialized ? state.selectedDay : initialDay);
  const setSelectedDay = useReportStore((state) => state.setSelectedDay);
  const { settings: displaySettings } = useDisplaySettings();

  useEffect(() => {
    console.log('App mounted');
    
    // Check for dark mode preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const loadData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        console.log('Starting to load initial data...');

        // Load settings first and wait for it to complete
        console.log('Loading settings...');
        await loadSettings();
        console.log('Settings loaded successfully');

        // Then load other data in parallel
        console.log('Loading other data...');
        await Promise.all([
          loadServices(),
          loadPeople(),
          loadGoals(),
          loadWeekDates(),
          loadAvailableWeeks(),
          loadAllData()
        ]);

        // Set initial day after data is loaded
        const jsDay = new Date().getDay();
        const dayMap: (Day | null)[] = [null, 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const today = jsDay === 0 ? 'Monday' : dayMap[jsDay] || 'Monday';
        if (dayMap.includes(today)) {
          setInitialDay(today);
          setSelectedDay(today);
        } else {
          setInitialDay('Monday');
          setSelectedDay('Monday');
        }

        console.log('Initial data loaded successfully');
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setLoadError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        // Ensure loading screen shows for at least 1 second to prevent flickering
        setTimeout(() => setIsLoading(false), 1000);
      }
    };

    loadData();

    // Add keyboard shortcut to toggle loading screen (Ctrl/Cmd + L)
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        setIsLoading(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [setSelectedDay]);

  if (isLoading) {
    return <LoadingScreen version={VERSION} />;
  }

  if (loadError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">Error Loading Data</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Only render the main content when the store is initialized
  if (!isInitialized) {
    return <LoadingScreen version={VERSION} />;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <TitleBar />
      <Layout selectedDay={selectedDay} onDayChange={setSelectedDay}>
        <div className="space-y-6">
          <DaySummary day={selectedDay} />
          <div className="grid grid-cols-2 gap-6">
            <AVSSection day={selectedDay} />
            <InsuranceAgreementSection day={selectedDay} />
            <PreklargjortTVSection day={selectedDay} />
            <RepairTicketsSection day={selectedDay} />
          </div>
        </div>
      </Layout>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <DisplaySettingsProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </DisplaySettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
