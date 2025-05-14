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
import { DisplaySettingsProvider } from './contexts/DisplaySettingsContext';
import { ToastProvider } from './contexts/ToastContext';
import ErrorBoundary from './components/ErrorBoundary';
import { VERSION } from './config/version';

export default function App() {
  const selectedDay = useReportStore((state: any) => state.selectedDay);
  const setSelectedDay = useReportStore((state: any) => state.setSelectedDay);
  const { loadServices, loadPeople, loadGoals } = useReportStore();
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    console.log('App mounted');
    
    // Check for dark mode preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);
        console.log('Starting to load initial data...');
        await Promise.all([
          loadServices(),
          loadPeople(),
          loadGoals()
        ]);
        console.log('Initial data loaded successfully');
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setLoadError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        // Ensure loading screen shows for at least 1 second to prevent flickering
        setTimeout(() => setIsLoading(false), 3000);
      }
    };

    loadInitialData();

    // Add keyboard shortcut to toggle loading screen (Ctrl/Cmd + L)
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        setIsLoading(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [loadServices, loadPeople, loadGoals]);

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

  return (
    <ErrorBoundary>
      <ThemeProvider>
        <DisplaySettingsProvider>
          <ToastProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
              <Layout
                selectedDay={selectedDay}
                onDayChange={setSelectedDay}
              >
                <div className="space-y-8">
                  <DaySummary day={selectedDay} />
                  <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <AVSSection day={selectedDay} />
                    <InsuranceAgreementSection day={selectedDay} />
                    <PreklargjortTVSection day={selectedDay} />
                    <RepairTicketsSection day={selectedDay} />
                  </div>
                </div>
              </Layout>
            </div>
          </ToastProvider>
        </DisplaySettingsProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
