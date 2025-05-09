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

export default function App() {
  const selectedDay = useReportStore((state) => state.selectedDay);
  const setSelectedDay = useReportStore((state) => state.setSelectedDay);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for dark mode preference
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Simulate loading time for initial data fetch
    const loadInitialData = async () => {
      try {
        // Add a longer loading time for testing
        await Promise.all([
          new Promise(resolve => setTimeout(resolve, 3000)), // 5 seconds
          // Add any actual data loading here
        ]);
      } finally {
        setIsLoading(false);
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
  }, []);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <ThemeProvider>
      <DisplaySettingsProvider>
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
      </DisplaySettingsProvider>
    </ThemeProvider>
  );
}
