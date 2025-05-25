import { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import Label from './ui/Label';
import { useDisplaySettings } from '../contexts/DisplaySettingsContext';
import { useToast } from '../contexts/ToastContext';
import useReportStore, { loadServices, loadPeople, loadGoals, loadAllData, loadAvailableWeeks, loadSettings, loadWeekDates } from '../store';
import { db } from '../services/db';
import { VERSION } from '../config/version';
import ResetLoadingScreen from './ResetLoadingScreen';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'People' | 'Services' | 'Goals' | 'Display' | 'Theme' | 'Data' | 'Report' | 'Notifications' | 'Backup' | 'About';

interface DisplaySettings {
  compactView: boolean;
  showSections: {
    avs: boolean;
    insurance: boolean;
    precalibrated: boolean;
    repair: boolean;
  };
  defaultDay: 'current' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
  numberFormat: {
    currencyDecimals: number;
    numberDecimals: number;
  };
}

interface ThemeSettings {
  fontSize: 'small' | 'medium' | 'large';
  animationSpeed: 'slow' | 'normal' | 'fast';
  accentColors: {
    avs: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
    insurance: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
    precalibrated: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
    repair: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
    summary: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
  };
}

interface DataSettings {
  autoSave: boolean;
  autoSaveInterval: number;
  dataRetention: number;
  defaultValues: {
    serviceSold: number;
    repairTickets: number;
    precalibratedTVs: number;
    insuranceAgreements: number;
  };
}

interface ReportSettings {
  defaultFormat: 'png' | 'pdf';
  defaultQuality: 'low' | 'medium' | 'high';
  defaultSize: 'small' | 'medium' | 'large';
  autoExport: boolean;
  autoExportOnSave: boolean;
}

interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  duration: number;
  goalsAchievement: boolean;
}

interface BackupSettings {
  autoBackup: boolean;
  backupFrequency: number;
  retentionPeriod: number;
  encryptBackups: boolean;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('About');
  const { showToast } = useToast();
  const { settings: displaySettings, updateSettings: updateDisplaySettings } = useDisplaySettings();
  const { people: storePeople, services: storeServices, goals: storeGoals, loadPeople, loadServices, loadGoals } = useReportStore();
  const storeSettings = useReportStore(state => state.settings);
  const updateStoreSettings = useReportStore(state => state.updateSettings);
  const [isDeletingAllData, setIsDeletingAllData] = useState(false);
  const [resetModalOpen, setResetModalOpen] = useState(false);
  const [modalMessage, setModalMessage] = useState('');
  const [modalConfirmAction, setModalConfirmAction] = useState<(() => Promise<void>) | null>(null);

  // Local state for editing
  const [people, setPeople] = useState(storePeople);
  const [services, setServices] = useState(storeServices);
  const [goals, setGoals] = useState(storeGoals);

  // Update local state when store data changes
  useEffect(() => {
    setPeople(storePeople);
    setServices(storeServices);
    setGoals(storeGoals);
  }, [storePeople, storeServices, storeGoals]);

  // Flag to control which tabs are enabled
  const enabledTabs: Record<SettingsTab, boolean> = {
    People: true,
    Services: true,
    Goals: true,
    Display: true,
    Theme: false,
    Data: true,
    Report: false,
    Notifications: false,
    Backup: false,
    About: true
  };

  // Theme Settings
  const [themeSettings, setThemeSettings] = useState(() => storeSettings?.theme || {
    fontSize: 'medium',
    animationSpeed: 'normal',
    accentColors: {
      avs: 'blue',
      insurance: 'green',
      precalibrated: 'purple',
      repair: 'orange',
      summary: 'indigo'
    }
  });

  // Data Settings
  const [dataSettings, setDataSettings] = useState(() => storeSettings?.data || {
    autoSave: true,
    autoSaveInterval: 5,
    dataRetention: 30,
    defaultValues: {
      serviceSold: 1,
      repairTickets: 1,
      precalibratedTVs: 1,
      insuranceAgreements: 1
    }
  });

  // Report Settings
  const [reportSettings, setReportSettings] = useState(() => storeSettings?.report || {
    defaultFormat: 'png',
    defaultQuality: 'high',
    defaultSize: 'medium',
    autoExport: false,
    autoExportOnSave: false
  });

  // Notification Settings
  const [notificationSettings, setNotificationSettings] = useState(() => storeSettings?.notifications || {
    enabled: true,
    sound: true,
    duration: 3000,
    goalsAchievement: true
  });

  // Backup Settings
  const [backupSettings, setBackupSettings] = useState(() => storeSettings?.backup || {
    autoBackup: true,
    backupFrequency: 24,
    retentionPeriod: 30,
    encryptBackups: true
  });

  // Update local settings when store settings change
  useEffect(() => {
    if (storeSettings?.theme) setThemeSettings(storeSettings.theme);
    if (storeSettings?.data) setDataSettings(storeSettings.data);
    if (storeSettings?.report) setReportSettings(storeSettings.report);
    if (storeSettings?.notifications) setNotificationSettings(storeSettings.notifications);
    if (storeSettings?.backup) setBackupSettings(storeSettings.backup);
  }, [storeSettings]);

  // Save settings to database
  useEffect(() => {
    updateStoreSettings({ theme: themeSettings });
  }, [themeSettings, updateStoreSettings]);

  useEffect(() => {
    updateStoreSettings({ data: dataSettings });
  }, [dataSettings, updateStoreSettings]);

  useEffect(() => {
    updateStoreSettings({ report: reportSettings });
  }, [reportSettings, updateStoreSettings]);

  useEffect(() => {
    updateStoreSettings({ notifications: notificationSettings });
  }, [notificationSettings, updateStoreSettings]);

  useEffect(() => {
    updateStoreSettings({ backup: backupSettings });
  }, [backupSettings, updateStoreSettings]);

  // Handlers for People
  const handlePersonChange = (idx: number, field: string, value: string) => {
    const updatedPeople = [...people];
    updatedPeople[idx] = { ...updatedPeople[idx], [field]: value };
    setPeople(updatedPeople);
  };

  const handleAddPerson = () => {
    const newPerson = {
      code: '',
      firstName: '',
      lastName: ''
    };
    setPeople([newPerson, ...people]);
  };

  const handleDeletePerson = (idx: number) => {
    setPeople(people.filter((_, i) => i !== idx));
  };

  const handleSavePeople = async () => {
    try {
      await db.setPeople(people);
      await loadPeople();
      showToast('People saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save people', 'error');
    }
  };

  // Handlers for Services
  const handleServiceChange = (idx: number, field: string, value: string | number) => {
    const updatedServices = [...services];
    updatedServices[idx] = { ...updatedServices[idx], [field]: value };
    setServices(updatedServices);
  };

  const handleAddService = () => {
    const newService = {
      id: '',
      name: '',
      price: 0,
      cost: 0
    };
    setServices([newService, ...services]);
  };

  const handleDeleteService = (idx: number) => {
    setServices(services.filter((_, i) => i !== idx));
  };

  const handleSaveServices = async () => {
    try {
      await db.setServices(services);
      await loadServices();
      showToast('Services saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save services', 'error');
    }
  };

  // Handlers for Goals
  const handleGoalChange = (sectionIdx: number, goalIdx: number, value: number) => {
    const updatedGoals = [...goals];
    updatedGoals[sectionIdx] = {
      ...updatedGoals[sectionIdx],
      goals: updatedGoals[sectionIdx].goals.map((g, i) => i === goalIdx ? value : g)
    };
    setGoals(updatedGoals);
  };

  const handleSaveGoals = async () => {
    try {
      await db.setGoals(goals);
      await loadGoals();
      showToast('Goals saved successfully', 'success');
    } catch (error) {
      showToast('Failed to save goals', 'error');
    }
  };

  // Add export/import functionality
  const handleExportData = async () => {
    try {
      const data = await db.exportData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'elkjop-report-data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('Data exported successfully', 'success');
    } catch (error) {
      showToast('Failed to export data', 'error');
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await db.importData(data);
      showToast('Data imported successfully', 'success');
      // Reload the data
      await Promise.all([
        loadServices(),
        loadPeople(),
        loadGoals()
      ]);
    } catch (error) {
      showToast('Failed to import data', 'error');
    }
  };

  const handleDeleteDatabase = async () => {
    setResetModalOpen(false);
    setIsDeletingAllData(true);
    try {
      await db.deleteDatabase();
      window.location.reload();
    } catch (error) {
      showToast('Failed to delete database', 'error');
      setIsDeletingAllData(false);
    }
  };

  // Add settings management
  const { settings, updateSettings } = useReportStore();

  // Add these new handlers at the top of the component
  const handleExportUserData = async () => {
    try {
      const data = await db.exportUserData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'elkjop-report-user-data.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('User data exported successfully', 'success');
    } catch (error) {
      showToast('Failed to export user data', 'error');
    }
  };

  const handleImportUserData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await useReportStore.getState().importUserData(file);
      await useReportStore.getState().loadAllData();
      event.target.value = ''; // Reset the input
    } catch (error) {
      console.error('Error importing user data:', error);
    }
  };

  const handleExportConfig = async () => {
    try {
      await useReportStore.getState().exportData();
    } catch (error) {
      console.error('Error exporting configuration:', error);
    }
  };

  const handleImportConfig = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await useReportStore.getState().importData(file);
      await useReportStore.getState().loadAllData();
      event.target.value = ''; // Reset the input
    } catch (error) {
      console.error('Error importing configuration:', error);
    }
  };

  const handleResetUserData = async () => {
    setResetModalOpen(false);
    setIsDeletingAllData(true);
    
    try {
      // Delete only user data while preserving services, goals, and people
      await db.deleteUserData();
      
      // Reload all data
      await Promise.all([
        loadServices(),
        loadPeople(),
        loadGoals(),
        loadWeekDates(),
        loadAvailableWeeks(),
        loadSettings(),
        loadAllData()  // Add this to reload all weekly data
      ]);

      showToast('All user data has been reset successfully', 'success');
    } catch (error) {
      console.error('Error resetting user data:', error);
      showToast('Failed to reset user data. Please try again.', 'error');
    } finally {
      setIsDeletingAllData(false);
    }
  };

  const handleResetAllData = async () => {
    setResetModalOpen(false);
    setIsDeletingAllData(true);
    
    try {
      // Delete everything including services, goals, and people
      await db.deleteDatabase();
      
      // Reload all data
      await Promise.all([
        loadServices(),
        loadPeople(),
        loadGoals(),
        loadWeekDates(),
        loadAvailableWeeks(),
        loadSettings(),
        loadAllData()  // Add this to reload all weekly data
      ]);

      showToast('All data has been reset successfully', 'success');
    } catch (error) {
      console.error('Error resetting all data:', error);
      showToast('Failed to reset data. Please try again.', 'error');
    } finally {
      setIsDeletingAllData(false);
    }
  };

  // Handlers for settings changes
  const handleThemeChange = (field: keyof typeof themeSettings, value: any) => {
    setThemeSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleDataChange = (field: keyof typeof dataSettings, value: any) => {
    setDataSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleReportChange = (field: keyof typeof reportSettings, value: any) => {
    setReportSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleNotificationChange = (field: keyof typeof notificationSettings, value: any) => {
    setNotificationSettings(prev => ({ ...prev, [field]: value }));
  };

  const handleBackupChange = (field: keyof typeof backupSettings, value: any) => {
    setBackupSettings(prev => ({ ...prev, [field]: value }));
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
            {settingsTab === 'People' && (
              <div className="space-y-6">
                {/* Sticky header with title and actions */}
                <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 pb-4 -mx-6 px-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">People Management</h2>
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={handleSavePeople}
                        color="green"
                        className="px-6"
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={handleAddPerson}
                        color="gray"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Person
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {people.map((person, idx) => (
                      <div key={idx} className="p-4 flex items-center gap-4">
                        <div className="flex-1 grid grid-cols-3 gap-4">
                          <Input
                            type="text"
                            value={person.code}
                            onChange={(e) => handlePersonChange(idx, 'code', e.target.value)}
                            placeholder="Code"
                            className="bg-gray-50 dark:bg-gray-900"
                          />
                          <Input
                            type="text"
                            value={person.firstName}
                            onChange={(e) => handlePersonChange(idx, 'firstName', e.target.value)}
                            placeholder="First Name"
                            className="bg-gray-50 dark:bg-gray-900"
                          />
                          <Input
                            type="text"
                            value={person.lastName}
                            onChange={(e) => handlePersonChange(idx, 'lastName', e.target.value)}
                            placeholder="Last Name"
                            className="bg-gray-50 dark:bg-gray-900"
                          />
                        </div>
                        <Button
                          onClick={() => handleDeletePerson(idx)}
                          color="red"
                          variant="ghost"
                          className="p-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {settingsTab === 'Services' && (
              <div className="space-y-6">
                {/* Sticky header with title and actions */}
                <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 pb-4 -mx-6 px-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Services Management</h2>
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={handleSaveServices}
                        color="green"
                        className="px-6"
                      >
                        Save Changes
                      </Button>
                      <Button
                        onClick={handleAddService}
                        color="gray"
                        variant="outline"
                        className="flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                        </svg>
                        Add Service
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {/* Column Headers */}
                    <div className="p-4 grid grid-cols-12 gap-4 border-b border-gray-200 dark:border-gray-700">
                      <div className="col-span-5">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Article</span>
                      </div>
                      <div className="col-span-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Price</span>
                      </div>
                      <div className="col-span-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Cost</span>
                      </div>
                    </div>
                    {services.map((service, idx) => (
                      <div key={idx} className="p-4 flex items-center gap-4">
                        <div className="flex-1 grid grid-cols-12 gap-4">
                          <div className="col-span-5">
                          <Input
                            type="text"
                            value={service.id}
                            onChange={(e) => handleServiceChange(idx, 'id', e.target.value)}
                            placeholder="ID"
                            className="bg-gray-50 dark:bg-gray-900"
                          />
                          </div>
                          <div className="col-span-3">
                          <Input
                            type="number"
                            value={service.price}
                            onChange={(e) => handleServiceChange(idx, 'price', parseFloat(e.target.value))}
                            placeholder="Price"
                            className="bg-gray-50 dark:bg-gray-900"
                          />
                          </div>
                          <div className="col-span-3">
                          <Input
                            type="number"
                            value={service.cost}
                            onChange={(e) => handleServiceChange(idx, 'cost', parseFloat(e.target.value))}
                            placeholder="Cost"
                            className="bg-gray-50 dark:bg-gray-900"
                          />
                          </div>
                        </div>
                        <Button
                          onClick={() => handleDeleteService(idx)}
                          color="red"
                          variant="ghost"
                          className="p-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {settingsTab === 'Goals' && (
              <div className="space-y-6">
                {/* Sticky header with title and actions */}
                <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 pb-4 -mx-6 px-6 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Goals Management</h2>
                    <Button
                      onClick={handleSaveGoals}
                      color="green"
                      className="px-6"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {goals.map((section, sectionIdx) => (
                      <div key={sectionIdx} className="p-6">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">{section.section}</h3>
                        <div className="grid grid-cols-3 gap-6">
                          {section.goals.slice(0, 6).map((goal: number, goalIdx: number) => (
                            <div key={goalIdx} className="space-y-2">
                              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][goalIdx]}
                              </Label>
                              <Input
                                type="number"
                                value={goal}
                                onChange={(e) => handleGoalChange(sectionIdx, goalIdx, parseFloat(e.target.value))}
                                className="bg-gray-50 dark:bg-gray-900"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {settingsTab === 'Data' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data Management</h2>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="space-y-6">
                    {/* Configuration Data Export/Import */}
                    <div className="space-y-4">
                      <Label>Configuration Data</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Export or import configuration data (services, people, goals)
                      </p>
                      <div className="flex gap-4">
                        <Button
                          onClick={handleExportConfig}
                          color="blue"
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Export Configuration
                        </Button>
                        <div>
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleImportConfig}
                            className="hidden"
                            id="import-config"
                          />
                          <Button
                            onClick={() => document.getElementById('import-config')?.click()}
                            color="blue"
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Import Configuration
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* User Data Export/Import */}
                    <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                      <Label>User Data</Label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Export or import weekly records (sales, repairs, insurance agreements, etc.)
                      </p>
                      <div className="flex gap-4">
                        <Button
                          onClick={handleExportUserData}
                          color="blue"
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Export User Data
                        </Button>
                        <div>
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleImportUserData}
                            className="hidden"
                            id="import-user-data"
                          />
                          <Button
                            onClick={() => document.getElementById('import-user-data')?.click()}
                            color="blue"
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Import User Data
                          </Button>
                        </div>
                        <Button
                          onClick={() => setResetModalOpen(true)}
                          variant="danger"
                          className="flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Reset User Data
                        </Button>
                      </div>
                    </div>

                    {/* Existing settings */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Auto-save</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Automatically save changes periodically</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={dataSettings.autoSave}
                        onChange={(e) => handleDataChange('autoSave', e.target.checked)}
                        className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
                      />
                    </div>

                    {dataSettings.autoSave && (
                      <div className="space-y-2">
                        <Label>Auto-save Interval (minutes)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="60"
                          value={dataSettings.autoSaveInterval}
                          onChange={(e) => handleDataChange('autoSaveInterval', parseInt(e.target.value))}
                          className="bg-gray-50 dark:bg-gray-900"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label>Data Retention (days)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        value={dataSettings.dataRetention}
                        onChange={(e) => handleDataChange('dataRetention', parseInt(e.target.value))}
                        className="bg-gray-50 dark:bg-gray-900"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label>Default Values</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(dataSettings.defaultValues).map(([key, value]) => (
                          <div key={key} className="space-y-2">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </Label>
                            <Input
                              type="number"
                              min="0"
                              value={value}
                              onChange={(e) => handleDataChange('defaultValues', { ...dataSettings.defaultValues, [key]: parseInt(e.target.value) })}
                              className="bg-gray-50 dark:bg-gray-900"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Data Export/Import</Label>
                      <div className="flex gap-4">
                        <Button
                          onClick={handleExportData}
                          color="blue"
                          variant="outline"
                          className="flex items-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                          Export Data
                        </Button>
                        <div>
                          <input
                            type="file"
                            accept=".json"
                            onChange={handleImportData}
                            className="hidden"
                            id="import-data"
                          />
                          <Button
                            onClick={() => document.getElementById('import-data')?.click()}
                            color="blue"
                            variant="outline"
                            className="flex items-center gap-2"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Import Data
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                      <div className="space-y-4">
                        <Label>Danger Zone</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">These actions cannot be undone</p>
                        <Button
                          variant="outline"
                          color="red"
                          onClick={() => {
                            setResetModalOpen(true);
                            // Set a flag to indicate this is a full reset
                            setModalMessage("Are you sure you want to reset ALL data? This will delete everything including services, goals, and people. This action cannot be undone.");
                            setModalConfirmAction(handleResetAllData);
                          }}
                        >
                          Reset All Data
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {settingsTab === 'Report' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Report Settings</h2>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <Label>Default Export Format</Label>
                      <div className="flex gap-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={reportSettings.defaultFormat === 'png'}
                            onChange={(e) => handleReportChange('defaultFormat', 'png')}
                            className="mr-2"
                          />
                          PNG
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={reportSettings.defaultFormat === 'pdf'}
                            onChange={(e) => handleReportChange('defaultFormat', 'pdf')}
                            className="mr-2"
                          />
                          PDF
                        </label>
                      </div>
                  </div>

                    <div className="space-y-4">
                      <Label>Default Quality</Label>
                      <select
                        value={reportSettings.defaultQuality}
                        onChange={(e) => handleReportChange('defaultQuality', e.target.value as 'low' | 'medium' | 'high')}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                      </div>

                    <div className="space-y-4">
                      <Label>Default Size</Label>
                      <select
                        value={reportSettings.defaultSize}
                        onChange={(e) => handleReportChange('defaultSize', e.target.value as 'small' | 'medium' | 'large')}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      >
                        <option value="small">Small</option>
                        <option value="medium">Medium</option>
                        <option value="large">Large</option>
                      </select>
                      </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Auto-export</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Automatically export reports periodically</p>
                    </div>
                      <input
                        type="checkbox"
                        checked={reportSettings.autoExport}
                        onChange={(e) => handleReportChange('autoExport', e.target.checked)}
                        className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
                      />
                  </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Auto-export on Save</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Export report when saving changes</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={reportSettings.autoExportOnSave}
                        onChange={(e) => handleReportChange('autoExportOnSave', e.target.checked)}
                        className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {settingsTab === 'Notifications' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notification Settings</h2>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Enable Notifications</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Show notifications for important events</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.enabled}
                        onChange={(e) => handleNotificationChange('enabled', e.target.checked)}
                        className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Notification Sound</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Play sound when notifications appear</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.sound}
                        onChange={(e) => handleNotificationChange('sound', e.target.checked)}
                        className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label>Notification Duration (ms)</Label>
                      <Input
                        type="number"
                        min="1000"
                        max="10000"
                        step="500"
                        value={notificationSettings.duration}
                        onChange={(e) => handleNotificationChange('duration', parseInt(e.target.value))}
                        className="bg-gray-50 dark:bg-gray-900"
                      />
                      </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Goals Achievement Notifications</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Notify when goals are achieved</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={notificationSettings.goalsAchievement}
                        onChange={(e) => handleNotificationChange('goalsAchievement', e.target.checked)}
                        className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {settingsTab === 'Backup' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Backup Settings</h2>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Auto-backup</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Automatically backup data periodically</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={backupSettings.autoBackup}
                        onChange={(e) => handleBackupChange('autoBackup', e.target.checked)}
                        className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
                      />
                    </div>

                    {backupSettings.autoBackup && (
                    <div className="space-y-4">
                        <Label>Backup Frequency (hours)</Label>
                        <Input
                          type="number"
                          min="1"
                          max="168"
                          value={backupSettings.backupFrequency}
                          onChange={(e) => handleBackupChange('backupFrequency', parseInt(e.target.value))}
                          className="bg-gray-50 dark:bg-gray-900"
                        />
                      </div>
                    )}

                    <div className="space-y-4">
                      <Label>Backup Retention Period (days)</Label>
                      <Input
                        type="number"
                        min="1"
                        max="365"
                        value={backupSettings.retentionPeriod}
                        onChange={(e) => handleBackupChange('retentionPeriod', parseInt(e.target.value))}
                        className="bg-gray-50 dark:bg-gray-900"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Encrypt Backups</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Encrypt backup files for security</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={backupSettings.encryptBackups}
                        onChange={(e) => handleBackupChange('encryptBackups', e.target.checked)}
                        className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {settingsTab === 'About' && (
              <div className="relative">
                {/* Main Content */}
                <div className="relative">
                  {/* Header with Logo */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="relative flex-shrink-0">
                      <div className="absolute inset-0 bg-gradient-to-br from-elkjop-green/20 to-blue-500/20 rounded-lg blur-sm" />
                      <img 
                        src="/elkjop_logo.png" 
                        alt="Elkjøp logo" 
                        className="relative w-10 h-10 object-contain"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h2 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                        Elkjøp Report App
                      </h2>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                        <span className="px-1.5 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 font-medium">v{VERSION}</span>
                        <span>Personal Project</span>
                      </div>
                    </div>
                      <a 
                        href="mailto:chris@madsens.dev" 
                      className="flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-elkjop-green bg-elkjop-green/5 hover:bg-elkjop-green/10 rounded-lg transition-colors"
                      >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      Contact
                      </a>
                    </div>

                  {/* Description */}
                  <div className="mb-6 p-4 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      A specialized tool designed for the aftersales operations team to generate daily and weekly reports. 
                      Streamlining your workflow with an intuitive interface for tracking service sales, repair tickets, 
                      precalibrated TVs, and insurance agreements.
                    </p>
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    {/* Report Generation */}
                    <div className="group">
                      <div className="relative p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-elkjop-green/50 dark:hover:border-elkjop-green/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 p-2 rounded-md bg-gradient-to-br from-elkjop-green/10 to-blue-500/10">
                            <svg className="w-4 h-4 text-elkjop-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Report Generation</h3>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {['Daily reports', 'Weekly summaries', 'Image export'].map((feature) => (
                                <span key={feature} className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  <svg className="w-3 h-3 mr-1 text-elkjop-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Data Management */}
                    <div className="group">
                      <div className="relative p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-elkjop-green/50 dark:hover:border-elkjop-green/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 p-2 rounded-md bg-gradient-to-br from-elkjop-green/10 to-blue-500/10">
                            <svg className="w-4 h-4 text-elkjop-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Data Management</h3>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {['Service tracking', 'Repair tickets', 'Insurance tracking'].map((feature) => (
                                <span key={feature} className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  <svg className="w-3 h-3 mr-1 text-elkjop-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Technical Stack */}
                    <div className="group">
                      <div className="relative p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-elkjop-green/50 dark:hover:border-elkjop-green/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 p-2 rounded-md bg-gradient-to-br from-elkjop-green/10 to-blue-500/10">
                            <svg className="w-4 h-4 text-elkjop-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Technical Stack</h3>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {['React + TypeScript', 'Tauri', 'Tailwind CSS'].map((tech) => (
                                <span key={tech} className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  <svg className="w-3 h-3 mr-1 text-elkjop-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Statistics */}
                    <div className="group">
                      <div className="relative p-3 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-elkjop-green/50 dark:hover:border-elkjop-green/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 p-2 rounded-md bg-gradient-to-br from-elkjop-green/10 to-blue-500/10">
                            <svg className="w-4 h-4 text-elkjop-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 dark:text-white">Statistics</h3>
                            <div className="mt-1 flex flex-wrap gap-2">
                              {['98.5% TypeScript', 'Personal Project', 'All Rights Reserved'].map((stat) => (
                                <span key={stat} className="inline-flex items-center text-xs text-gray-500 dark:text-gray-400">
                                  <svg className="w-3 h-3 mr-1 text-elkjop-green flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                                  </svg>
                                  {stat}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Created by Christoffer Madsen</span>
                      <span>© {new Date().getFullYear()}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {settingsTab === 'Display' && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Display Settings</h2>

                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="space-y-6">
                    {/* Week Display Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">Week Display</h3>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label>Show All Weeks</Label>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            Display all weeks of the current year, even if they don't contain data
                          </p>
                        </div>
                        <input
                          type="checkbox"
                          checked={settings.showAllWeeks}
                          onChange={(e) => updateSettings({ ...settings, showAllWeeks: e.target.checked })}
                          className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
                        />
                      </div>
                    </div>

                    {/* Existing Display Settings */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Compact View</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Use a more compact layout for data display</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={displaySettings.compactView}
                        onChange={(e) => updateDisplaySettings({ ...displaySettings, compactView: e.target.checked })}
                        className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
                      />
                    </div>

                    <div className="space-y-4">
                      <Label>Visible Sections</Label>
                      <div className="grid grid-cols-2 gap-4">
                        {Object.entries(displaySettings.showSections).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between">
                            <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </Label>
                            <input
                              type="checkbox"
                              checked={value}
                              onChange={(e) => updateDisplaySettings({
                                ...displaySettings,
                                showSections: {
                                  ...displaySettings.showSections,
                                  [key]: e.target.checked
                                }
                              })}
                              className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <Label>Default Day</Label>
                      <select
                        value={displaySettings.defaultDay}
                        onChange={(e) => updateDisplaySettings({
                          ...displaySettings,
                          defaultDay: e.target.value as DisplaySettings['defaultDay']
                        })}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
                      >
                        <option value="current">Current Day</option>
                        <option value="monday">Monday</option>
                        <option value="tuesday">Tuesday</option>
                        <option value="wednesday">Wednesday</option>
                        <option value="thursday">Thursday</option>
                        <option value="friday">Friday</option>
                        <option value="saturday">Saturday</option>
                      </select>
                    </div>

                    <div className="space-y-4">
                      <Label>Number Format</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Currency Decimals
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            max="4"
                            value={displaySettings.numberFormat.currencyDecimals}
                            onChange={(e) => updateDisplaySettings({
                              ...displaySettings,
                              numberFormat: {
                                ...displaySettings.numberFormat,
                                currencyDecimals: parseInt(e.target.value)
                              }
                            })}
                            className="bg-gray-50 dark:bg-gray-900"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Number Decimals
                          </Label>
                          <Input
                            type="number"
                            min="0"
                            max="4"
                            value={displaySettings.numberFormat.numberDecimals}
                            onChange={(e) => updateDisplaySettings({
                              ...displaySettings,
                              numberFormat: {
                                ...displaySettings.numberFormat,
                                numberDecimals: parseInt(e.target.value)
                              }
                            })}
                            className="bg-gray-50 dark:bg-gray-900"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Reset Confirmation Modal */}
      <Modal
        isOpen={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        title="Reset Data"
        message={modalMessage || "Are you sure you want to reset all data? This will delete all weekly records, including sales, repairs, insurance agreements, and more. This action cannot be undone."}
        onConfirm={modalConfirmAction || handleResetUserData}
        confirmText="Reset Data"
        cancelText="Cancel"
      />

      {/* Add Reset Loading Screen */}
      <ResetLoadingScreen isOpen={isDeletingAllData} />
    </Modal>
  );
} 