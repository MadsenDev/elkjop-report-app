import { useEffect, useState } from 'react';
import useReportStore, {
  loadAllData,
  loadAvailableWeeks,
  loadGoals,
  loadPeople,
  loadServices,
  loadSettings,
  loadWeekDates,
} from './store';
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
import TitleBar from './components/TitleBar';
import { useAppUpdates } from './hooks/useAppUpdates';
import UpdateModal from './components/UpdateModal';
import { useAutoSelectDay } from './hooks/useAutoSelectDay';

function AppContent() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const selectedDay = useReportStore((state) => state.selectedDay);
  const setSelectedDay = useReportStore((state) => state.setSelectedDay);

  useAutoSelectDay(isInitialized);

  const {
    isUpdateModalOpen,
    updateInfo,
    isDownloading,
    downloadProgress,
    downloadUpdate,
    skipUpdate,
    remindLater,
    closeUpdateModal,
  } = useAppUpdates();

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        setLoadError(null);

        await loadSettings();
        await Promise.all([
          loadServices(),
          loadPeople(),
          loadGoals(),
          loadWeekDates(),
          loadAvailableWeeks(),
          loadAllData(),
        ]);

        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to load initial data:', error);
        setLoadError(error instanceof Error ? error.message : 'Failed to load data');
      } finally {
        setTimeout(() => setIsLoading(false), 1000);
      }
    };

    loadData();

    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
        e.preventDefault();
        setIsLoading((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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

  if (!isInitialized) {
    return <LoadingScreen version={VERSION} />;
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
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

      <UpdateModal
        isOpen={isUpdateModalOpen}
        onClose={closeUpdateModal}
        updateInfo={updateInfo || undefined}
        onDownload={downloadUpdate}
        onSkip={skipUpdate}
        onRemindLater={remindLater}
        isDownloading={isDownloading}
        downloadProgress={downloadProgress}
      />
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
