import { useState } from 'react';
import useReportStore from '../store';
import Modal from './Modal';
import elkjopLogo from '../assets/elkjop_logo.png';
import ReactMarkdown from 'react-markdown';
import SettingsDataTab from './SettingsDataTab';
import SettingsThemeTab from './SettingsThemeTab';
import SettingsBackupTab from './SettingsBackupTab';
import SettingsReportTab from './SettingsReportTab';
import SettingsDisplayTab from './SettingsDisplayTab';
import SettingsNotificationsTab from './SettingsNotificationsTab';
import SettingsAboutTab from './SettingsAboutTab';
import SettingsPeopleTab from './SettingsPeopleTab';
import SettingsServicesTab from './SettingsServicesTab';
import SettingsGoalsTab from './SettingsGoalsTab';
import ResetLoadingScreen from './ResetLoadingScreen';
import { db } from '../services/db';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'People' | 'Services' | 'Goals' | 'Display' | 'Theme' | 'Data' | 'Report' | 'Notifications' | 'About' | 'Changelog';

const enabledTabs: Record<SettingsTab, boolean> = {
  People: true,
  Services: true,
  Goals: true,
  Display: true,
  Theme: true,
  Data: true,
  Report: true,
  Notifications: true,
  About: true,
  Changelog: true
};

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useReportStore();
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('People');
  const [isDeletingAllData, setIsDeletingAllData] = useState(false);

  const handleExportConfig = async () => {
    try {
      await useReportStore.getState().exportData();
    } catch (error) {
      console.error('Failed to export config:', error);
    }
  };

  const handleImportConfig = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
    const file = event.target.files?.[0];
      if (file) {
        await useReportStore.getState().importData(file);
      }
    } catch (error) {
      console.error('Failed to import config:', error);
    }
  };

  const handleExportUserData = async () => {
    try {
      await useReportStore.getState().exportUserData();
    } catch (error) {
      console.error('Failed to export user data:', error);
    }
  };

  const handleImportUserData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (file) {
      await useReportStore.getState().importUserData(file);
    }
    } catch (error) {
      console.error('Failed to import user data:', error);
    }
  };

  const handleResetUserData = async () => {
    try {
      setIsDeletingAllData(true);
      await db.deleteUserData();
      setIsDeletingAllData(false);
    } catch (error) {
      console.error('Failed to reset user data:', error);
      setIsDeletingAllData(false);
    }
  };

  const handleResetAllData = async () => {
    try {
      setIsDeletingAllData(true);
      await db.deleteDatabase();
      setIsDeletingAllData(false);
    } catch (error) {
      console.error('Failed to reset all data:', error);
      setIsDeletingAllData(false);
    }
  };

  const renderTabContent = () => {
    switch (settingsTab) {
      case 'People':
        return <SettingsPeopleTab settings={settings} updateSettings={updateSettings} />;
      case 'Services':
        return <SettingsServicesTab />;
      case 'Goals':
        return <SettingsGoalsTab />;
      case 'Display':
        return <SettingsDisplayTab settings={settings} updateSettings={updateSettings} />;
      case 'Theme':
        return <SettingsThemeTab settings={settings} updateSettings={updateSettings} />;
      case 'Data':
        return (
          <SettingsDataTab
            settings={settings}
            updateSettings={updateSettings}
            onExportConfig={handleExportConfig}
            onImportConfig={handleImportConfig}
            onExportUserData={handleExportUserData}
            onImportUserData={handleImportUserData}
            onResetUserData={handleResetUserData}
            onResetAllData={handleResetAllData}
          />
        );
      case 'Report':
        return <SettingsReportTab settings={settings} updateSettings={updateSettings} />;
      case 'Notifications':
        return <SettingsNotificationsTab settings={settings} updateSettings={updateSettings} />;
      case 'About':
        return <SettingsAboutTab />;
      case 'Changelog':
        return (
          <div className="settings-changelog">
            <ReactMarkdown>
              {/* Changelog content */}
            </ReactMarkdown>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      size="lg"
      noFooter
    >
      <div className="flex h-[700px] bg-gray-50 dark:bg-gray-900 rounded-lg overflow-hidden">
        {/* Sidebar */}
        <div className="w-56 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
          <nav className="p-4 space-y-1">
            {Object.entries(enabledTabs).map(([tab, isEnabled]) => (
              <button
                key={tab}
                onClick={() => isEnabled && setSettingsTab(tab as SettingsTab)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  settingsTab === tab
                    ? 'bg-elkjop-green bg-opacity-10 text-elkjop-green font-medium shadow-sm'
                    : isEnabled
                      ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                      : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
                disabled={!isEnabled}
              >
                <div className="flex items-center justify-between">
                  <span>{tab}</span>
                  {!isEnabled && (
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">Soon</span>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Add Reset Loading Screen */}
      <ResetLoadingScreen isOpen={isDeletingAllData} />
    </Modal>
  );
} 