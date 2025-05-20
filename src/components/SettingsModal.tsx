import { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import Label from './ui/Label';
import { useDisplaySettings } from '../contexts/DisplaySettingsContext';
import { useToast } from '../contexts/ToastContext';
import useReportStore, { loadServices, loadPeople, loadGoals } from '../store';
import { db } from '../services/db';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SettingsTab = 'People' | 'Services' | 'Goals' | 'Display' | 'Theme' | 'Data' | 'About';

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

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('About');
  const { showToast } = useToast();
  const { settings: displaySettings, updateSettings: updateDisplaySettings } = useDisplaySettings();
  const { people: storePeople, services: storeServices, goals: storeGoals, loadPeople, loadServices, loadGoals } = useReportStore();

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
    Display: false,
    Theme: false,
    Data: true,
    About: true
  };

  // Theme Settings
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>(() => {
    const saved = localStorage.getItem('themeSettings');
    return saved ? JSON.parse(saved) : {
      fontSize: 'medium',
      animationSpeed: 'normal',
      accentColors: {
        avs: 'blue',
        insurance: 'green',
        precalibrated: 'purple',
        repair: 'orange',
        summary: 'indigo'
      }
    };
  });

  // Data Settings
  const [dataSettings, setDataSettings] = useState<DataSettings>(() => {
    const saved = localStorage.getItem('dataSettings');
    return saved ? JSON.parse(saved) : {
      autoSave: true,
      autoSaveInterval: 5, // minutes
      dataRetention: 30, // days
      defaultValues: {
        serviceSold: 1,
        repairTickets: 1,
        precalibratedTVs: 1,
        insuranceAgreements: 1
      }
    };
  });

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('themeSettings', JSON.stringify(themeSettings));
  }, [themeSettings]);

  useEffect(() => {
    localStorage.setItem('dataSettings', JSON.stringify(dataSettings));
  }, [dataSettings]);

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
    if (window.confirm('Are you sure you want to delete all data? This cannot be undone.')) {
      try {
        await db.deleteDatabase();
        window.location.reload();
      } catch (error) {
        showToast('Failed to delete database', 'error');
      }
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
                    {services.map((service, idx) => (
                      <div key={idx} className="p-4 flex items-center gap-4">
                        <div className="flex-1 grid grid-cols-4 gap-4">
                          <Input
                            type="text"
                            value={service.id}
                            onChange={(e) => handleServiceChange(idx, 'id', e.target.value)}
                            placeholder="ID"
                            className="bg-gray-50 dark:bg-gray-900"
                          />
                          <Input
                            type="text"
                            value={service.name}
                            onChange={(e) => handleServiceChange(idx, 'name', e.target.value)}
                            placeholder="Name"
                            className="bg-gray-50 dark:bg-gray-900"
                          />
                          <Input
                            type="number"
                            value={service.price}
                            onChange={(e) => handleServiceChange(idx, 'price', parseFloat(e.target.value))}
                            placeholder="Price"
                            className="bg-gray-50 dark:bg-gray-900"
                          />
                          <Input
                            type="number"
                            value={service.cost}
                            onChange={(e) => handleServiceChange(idx, 'cost', parseFloat(e.target.value))}
                            placeholder="Cost"
                            className="bg-gray-50 dark:bg-gray-900"
                          />
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
                          {section.goals.map((goal: number, goalIdx: number) => (
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
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <Label>Auto-save</Label>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Automatically save changes periodically</p>
                      </div>
                      <input
                        type="checkbox"
                        checked={dataSettings.autoSave}
                        onChange={(e) => setDataSettings(prev => ({ ...prev, autoSave: e.target.checked }))}
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
                          onChange={(e) => setDataSettings(prev => ({
                            ...prev,
                            autoSaveInterval: parseInt(e.target.value)
                          }))}
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
                        onChange={(e) => setDataSettings(prev => ({
                          ...prev,
                          dataRetention: parseInt(e.target.value)
                        }))}
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
                              onChange={(e) => setDataSettings(prev => ({
                                ...prev,
                                defaultValues: { ...prev.defaultValues, [key]: parseInt(e.target.value) }
                              }))}
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
                          onClick={handleDeleteDatabase}
                        >
                          Delete All Data
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {settingsTab === 'About' && (
              <div className="space-y-6">
                <div className="text-center">
                  <img src="/elkjop_logo.png" alt="Elkjøp logo" className="h-20 mx-auto mb-6" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Elkjøp Report App</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Version 1.0.0</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">About the App</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      The Elkjøp Report App is a specialized tool designed for the aftersales operations team to generate daily and weekly reports. 
                      It provides a streamlined interface for creating and exporting reports that track key metrics such as service sales, repair tickets, 
                      precalibrated TVs, and insurance agreements.
                    </p>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Key Features</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Report Generation</h4>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                          <li>Daily report compilation</li>
                          <li>Weekly report summaries</li>
                          <li>Image export for chat sharing</li>
                          <li>Clean, professional layout</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Data Management</h4>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                          <li>Service sales tracking</li>
                          <li>Repair ticket management</li>
                          <li>Precalibrated TV monitoring</li>
                          <li>Insurance agreement tracking</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Technical Details</h3>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Built With</h4>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                          <li>React + TypeScript</li>
                          <li>Tauri for desktop app</li>
                          <li>Tailwind CSS for styling</li>
                          <li>Framer Motion for animations</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Statistics</h4>
                        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
                          <li>98.5% TypeScript</li>
                          <li>1.5% Other</li>
                          <li>All Rights Reserved</li>
                          <li>Personal Project</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact</h3>
                    <div className="space-y-4">
                      <p className="text-gray-600 dark:text-gray-400">
                        Created by Christoffer Madsen, a developer focused on creating efficient tools for the aftersales operations team.
                      </p>
                      <a 
                        href="mailto:chris@madsens.dev" 
                        className="flex items-center text-elkjop-green hover:text-elkjop-green-dark"
                      >
                        <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M0 3v18h24v-18h-24zm21.518 2l-9.518 7.713-9.518-7.713h19.036zm-19.518 14v-11.817l10 8.104 10-8.104v11.817h-20z"/>
                        </svg>
                        chris@madsens.dev
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
} 