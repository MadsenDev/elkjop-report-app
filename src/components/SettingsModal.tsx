import { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './ui/Input';
import Button from './ui/Button';
import Alert from './ui/Alert';
import Label from './ui/Label';
import { readJsonTauri, saveJsonTauri } from '../tauriSave';
import { useDisplaySettings } from '../contexts/DisplaySettingsContext';

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
  const [peopleData, setPeopleData] = useState<any[]>([]);
  const [servicesData, setServicesData] = useState<any[]>([]);
  const [goalsData, setGoalsData] = useState<any[]>([]);
  const [settingsMessage, setSettingsMessage] = useState('');
  const { settings: displaySettings, updateSettings: updateDisplaySettings } = useDisplaySettings();

  // Flag to control which tabs are enabled
  const enabledTabs: Record<SettingsTab, boolean> = {
    People: false,
    Services: false,
    Goals: false,
    Display: false,
    Theme: false,
    Data: false,
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

  // Fetch data from app directory or public/ when settings modal is opened
  useEffect(() => {
    if (isOpen) {
      const loadData = async () => {
        try {
          const [people, services, goals] = await Promise.all([
            readJsonTauri('people.json'),
            readJsonTauri('services.json'),
            readJsonTauri('goals.json')
          ]);
          
          setPeopleData(people);
          setServicesData(services);
          
          // Ensure the goals data structure is correct when loading
          const formattedGoals = goals.map((section: any) => ({
            section: section.section,
            goals: section.goals || Array(6).fill(0) // Default to 6 zeros if goals array is missing
          }));
          setGoalsData(formattedGoals);
        } catch (err) {
          console.error('Error loading data:', err);
          setSettingsMessage('Error loading data: ' + err);
        }
      };
      
      loadData();
    }
  }, [isOpen]);

  // Handlers for People
  const handlePersonChange = (idx: number, field: string, value: string) => {
    setPeopleData(prev => prev.map((p, i) => i === idx ? { ...p, [field]: value } : p));
  };
  const handleAddPerson = () => {
    setPeopleData(prev => [...prev, { code: '', firstName: '', lastName: '' }]);
  };
  const handleDeletePerson = (idx: number) => {
    setPeopleData(prev => prev.filter((_, i) => i !== idx));
  };
  const handleSavePeople = async () => {
    try {
      await saveJsonTauri('data/people.json', peopleData);
      setSettingsMessage('People saved to file!');
    } catch (err) {
      console.error('Tauri save error:', err);
      setSettingsMessage('Failed to save: ' + err);
    }
    setTimeout(() => setSettingsMessage(''), 2000);
  };

  // Handlers for Services
  const handleServiceChange = (idx: number, field: string, value: string | number) => {
    setServicesData(prev => prev.map((s, i) => i === idx ? { ...s, [field]: value } : s));
  };
  const handleAddService = () => {
    setServicesData(prev => [...prev, { id: '', name: '', price: 0, cost: 0 }]);
  };
  const handleDeleteService = (idx: number) => {
    setServicesData(prev => prev.filter((_, i) => i !== idx));
  };
  const handleSaveServices = async () => {
    try {
      await saveJsonTauri('data/services.json', servicesData);
      setSettingsMessage('Services saved to file!');
    } catch (err) {
      console.error('Tauri save error:', err);
      setSettingsMessage('Failed to save: ' + err);
    }
    setTimeout(() => setSettingsMessage(''), 2000);
  };

  // Handlers for Goals
  const handleGoalChange = (sectionIdx: number, goalIdx: number, value: number) => {
    setGoalsData(prev => prev.map((g, i) => i === sectionIdx ? { 
      ...g, 
      goals: g.goals.map((goal: number, j: number) => j === goalIdx ? value : goal) 
    } : g));
  };

  const handleSaveGoals = async () => {
    try {
      const formattedGoals = goalsData.map(section => ({
        section: section.section,
        goals: section.goals
      }));
      await saveJsonTauri('data/goals.json', formattedGoals);
      setSettingsMessage('Goals saved to file!');
    } catch (err) {
      console.error('Tauri save error:', err);
      setSettingsMessage('Failed to save: ' + err);
    }
    setTimeout(() => setSettingsMessage(''), 2000);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Settings"
      size="lg"
      noFooter
    >
      <div className="flex h-[600px]">
        {/* Sidebar */}
        <div className="w-48 border-r border-gray-200 dark:border-gray-700 pr-4">
          <nav className="space-y-1">
            {Object.entries(enabledTabs).map(([tab, isEnabled]) => (
              <button
                key={tab}
                onClick={() => isEnabled && setSettingsTab(tab as SettingsTab)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  settingsTab === tab
                    ? 'bg-elkjop-green bg-opacity-10 text-elkjop-green'
                    : isEnabled
                      ? 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      : 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                }`}
                disabled={!isEnabled}
              >
                <div className="flex items-center justify-between">
                  <span>{tab}</span>
                  {!isEnabled && (
                    <span className="text-xs text-gray-400 dark:text-gray-600">Soon</span>
                  )}
                </div>
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 pl-6 overflow-y-auto">
          {settingsTab === 'People' && (
            <div className="space-y-4">
              {peopleData.map((person, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <Input
                    type="text"
                    value={person.code}
                    onChange={(e) => handlePersonChange(idx, 'code', e.target.value)}
                    placeholder="Code"
                  />
                  <Input
                    type="text"
                    value={person.firstName}
                    onChange={(e) => handlePersonChange(idx, 'firstName', e.target.value)}
                    placeholder="First Name"
                  />
                  <Input
                    type="text"
                    value={person.lastName}
                    onChange={(e) => handlePersonChange(idx, 'lastName', e.target.value)}
                    placeholder="Last Name"
                  />
                  <Button
                    onClick={() => handleDeletePerson(idx)}
                    color="red"
                    variant="ghost"
                  >
                    Delete
                  </Button>
                </div>
              ))}
              <Button
                onClick={handleAddPerson}
                color="gray"
                variant="outline"
                className="w-full"
              >
                Add Person
              </Button>
              <Button
                onClick={handleSavePeople}
                color="green"
                className="w-full"
              >
                Save Changes
              </Button>
            </div>
          )}

          {settingsTab === 'Services' && (
            <div className="space-y-4">
              {servicesData.map((service, idx) => (
                <div key={idx} className="flex gap-4 items-center">
                  <Input
                    type="text"
                    value={service.id}
                    onChange={(e) => handleServiceChange(idx, 'id', e.target.value)}
                    placeholder="ID"
                  />
                  <Input
                    type="text"
                    value={service.name}
                    onChange={(e) => handleServiceChange(idx, 'name', e.target.value)}
                    placeholder="Name"
                  />
                  <Input
                    type="number"
                    value={service.price}
                    onChange={(e) => handleServiceChange(idx, 'price', parseFloat(e.target.value))}
                    placeholder="Price"
                  />
                  <Input
                    type="number"
                    value={service.cost}
                    onChange={(e) => handleServiceChange(idx, 'cost', parseFloat(e.target.value))}
                    placeholder="Cost"
                  />
                  <Button
                    onClick={() => handleDeleteService(idx)}
                    color="red"
                    variant="ghost"
                  >
                    Delete
                  </Button>
                </div>
              ))}
              <Button
                onClick={handleAddService}
                color="gray"
                variant="outline"
                className="w-full"
              >
                Add Service
              </Button>
              <Button
                onClick={handleSaveServices}
                color="green"
                className="w-full"
              >
                Save Changes
              </Button>
            </div>
          )}

          {settingsTab === 'Goals' && (
            <div className="space-y-4">
              {goalsData.map((section, sectionIdx) => (
                <div key={sectionIdx} className="space-y-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{section.section}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {section.goals.map((goal: number, goalIdx: number) => (
                      <div key={goalIdx} className="flex items-center gap-2">
                        <Label>{['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][goalIdx]}:</Label>
                        <Input
                          type="number"
                          value={goal}
                          onChange={(e) => handleGoalChange(sectionIdx, goalIdx, parseFloat(e.target.value))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
              <Button
                onClick={handleSaveGoals}
                color="green"
                className="w-full"
              >
                Save Changes
              </Button>
            </div>
          )}

          {settingsTab === 'Display' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Compact View</Label>
                  <input
                    type="checkbox"
                    checked={displaySettings.compactView}
                    onChange={(e) => updateDisplaySettings({ compactView: e.target.checked })}
                    className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Visible Sections</Label>
                  <div className="space-y-2">
                    {Object.entries(displaySettings.showSections).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <Label className="capitalize">{key}</Label>
                        <input
                          type="checkbox"
                          checked={value}
                          onChange={(e) => updateDisplaySettings({
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

                <div className="space-y-2">
                  <Label>Default Day</Label>
                  <select
                    value={displaySettings.defaultDay}
                    onChange={(e) => updateDisplaySettings({
                      defaultDay: e.target.value as DisplaySettings['defaultDay']
                    })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-elkjop-green focus:ring-elkjop-green"
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

                <div className="space-y-2">
                  <Label>Number Format</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Currency Decimals</Label>
                      <Input
                        type="number"
                        min="0"
                        max="4"
                        value={displaySettings.numberFormat.currencyDecimals}
                        onChange={(e) => updateDisplaySettings({
                          numberFormat: {
                            ...displaySettings.numberFormat,
                            currencyDecimals: parseInt(e.target.value)
                          }
                        })}
                      />
                    </div>
                    <div>
                      <Label>Number Decimals</Label>
                      <Input
                        type="number"
                        min="0"
                        max="4"
                        value={displaySettings.numberFormat.numberDecimals}
                        onChange={(e) => updateDisplaySettings({
                          numberFormat: {
                            ...displaySettings.numberFormat,
                            numberDecimals: parseInt(e.target.value)
                          }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {settingsTab === 'Theme' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <select
                    value={themeSettings.fontSize}
                    onChange={(e) => setThemeSettings(prev => ({ 
                      ...prev, 
                      fontSize: e.target.value as ThemeSettings['fontSize']
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-elkjop-green focus:ring-elkjop-green"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Animation Speed</Label>
                  <select
                    value={themeSettings.animationSpeed}
                    onChange={(e) => setThemeSettings(prev => ({ 
                      ...prev, 
                      animationSpeed: e.target.value as ThemeSettings['animationSpeed']
                    }))}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-elkjop-green focus:ring-elkjop-green"
                  >
                    <option value="slow">Slow</option>
                    <option value="normal">Normal</option>
                    <option value="fast">Fast</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label>Accent Colors</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(themeSettings.accentColors).map(([section, color]) => (
                      <div key={section} className="space-y-1">
                        <Label className="capitalize">{section}</Label>
                        <select
                          value={color}
                          onChange={(e) => setThemeSettings(prev => ({
                            ...prev,
                            accentColors: { 
                              ...prev.accentColors, 
                              [section]: e.target.value as ThemeSettings['accentColors'][keyof ThemeSettings['accentColors']]
                            }
                          }))}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-elkjop-green focus:ring-elkjop-green"
                        >
                          <option value="blue">Blue</option>
                          <option value="green">Green</option>
                          <option value="purple">Purple</option>
                          <option value="orange">Orange</option>
                          <option value="indigo">Indigo</option>
                        </select>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {settingsTab === 'Data' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Auto-save</Label>
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
                  />
                </div>

                <div className="space-y-2">
                  <Label>Default Values</Label>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(dataSettings.defaultValues).map(([key, value]) => (
                      <div key={key} className="space-y-1">
                        <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Label>
                        <Input
                          type="number"
                          min="0"
                          value={value}
                          onChange={(e) => setDataSettings(prev => ({
                            ...prev,
                            defaultValues: { ...prev.defaultValues, [key]: parseInt(e.target.value) }
                          }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {settingsTab === 'About' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="text-center">
                  <img src="/elkjop_logo.png" alt="Elkjøp logo" className="h-16 mx-auto mb-4 mt-4" />
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Elkjøp Report App</h2>
                  <p className="text-gray-600 dark:text-gray-400 mt-2">Version 1.0.0</p>
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">About the App</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      The Elkjøp Report App is a specialized tool designed for the aftersales operations team to generate daily and weekly reports. 
                      It provides a streamlined interface for creating and exporting reports that track key metrics such as service sales, repair tickets, 
                      precalibrated TVs, and insurance agreements.
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Key Features</h3>
                    <div className="grid grid-cols-2 gap-4">
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

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Technical Details</h3>
                    <div className="grid grid-cols-2 gap-4">
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
                          <li>Proprietary Software</li>
                          <li>Elkjøp Internal Use</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Legal Notice</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      This application is developed as a personal project by Christoffer Madsen. The code and implementation 
                      are the intellectual property of the developer. Elkjøp branding, logos, and related assets are the 
                      property of Elkjøp and are used with permission for internal use only.
                    </p>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                      This software is provided as-is, without any warranty. While developed for use within Elkjøp, 
                      it is not an official Elkjøp product.
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Creator</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Created by Christoffer Madsen, a developer focused on creating efficient tools for the aftersales operations team.
                    </p>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Contact</h3>
                    <div className="space-y-2">
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
            </div>
          )}

          {settingsMessage && (
            <Alert
              type="success"
              className="mt-4"
            >
              {settingsMessage}
            </Alert>
          )}
        </div>
      </div>
    </Modal>
  );
} 