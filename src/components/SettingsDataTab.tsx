import React, { useState, useEffect } from 'react';
import Input from './ui/Input';
import Label from './ui/Label';
import Button from './ui/Button';
import ConfirmModal from './ui/ConfirmModal';
import useReportStore from '../store';
import { db } from '../services/db';

interface DataSettingsProps {
  settings: any;
  updateSettings: (settings: Partial<any>) => void;
  onExportConfig: () => Promise<void>;
  onImportConfig: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onExportUserData: () => Promise<void>;
  onImportUserData: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onResetUserData: () => void;
  onResetAllData: () => void;
}

export default function SettingsDataTab({
  settings,
  updateSettings,
  onExportConfig,
  onImportConfig,
  onExportUserData,
  onImportUserData,
  onResetUserData,
  onResetAllData
}: DataSettingsProps) {
  const { budgetYears, selectedBudgetYear, setSelectedBudgetYear, setBudgetYear, deleteBudgetYear } = useReportStore();
  const [editingYear, setEditingYear] = useState<string | null>(null);
  const [yearToDelete, setYearToDelete] = useState<string | null>(null);
  const [newYear, setNewYear] = useState({
    startDate: '',
    endDate: '',
    previousYearGM: {
      avs: 0,
      ta: 0
    },
    goals: {
      avs: 0,
      insurance: 0,
      precalibrated: 0,
      repair: 0
    }
  });

  // Effect to update goals when budget year changes
  useEffect(() => {
    const updateGoals = async () => {
      if (selectedBudgetYear && budgetYears[selectedBudgetYear]) {
        console.log('Budget year changed:', selectedBudgetYear);
        const yearData = budgetYears[selectedBudgetYear];
        console.log('Year data:', yearData);
        
        const avsDailyGoals = calculateDailyGoals(yearData.goals.avs);
        const taDailyGoals = calculateDailyGoals(yearData.goals.insurance); // TA goal is stored in insurance
        console.log('Calculated daily goals:', { avsDailyGoals, taDailyGoals });

        // Update the goals in the store
        const currentGoals = useReportStore.getState().goals;
        console.log('Current goals in store:', currentGoals);
        
        const updatedGoals = currentGoals.map(goal => {
          if (goal.section === 'AVS') {
            return {
              ...goal,
              goals: Object.values(avsDailyGoals)
            };
          }
          if (goal.section === 'Insurance Agreements') {
            return {
              ...goal,
              goals: Object.values(taDailyGoals)
            };
          }
          return goal;
        });
        console.log('Updated goals to save:', updatedGoals);

        // Save the updated goals to the database and update store
        try {
          await db.setGoals(updatedGoals);
          console.log('Goals saved to database');
          // Update the store state directly
          useReportStore.setState({ goals: updatedGoals });
          console.log('Store state updated with new goals');
        } catch (error) {
          console.error('Failed to update goals:', error);
        }
      }
    };
    updateGoals();
  }, [selectedBudgetYear, budgetYears]);

  const calculateAVSGoal = (previousYearGM: number) => {
    const increasedGM = previousYearGM * 1.05; // Increase by 5%
    const weeklyGoal = increasedGM / 52; // Divide by 52 weeks
    console.log('Calculating AVS goal:', { previousYearGM, increasedGM, weeklyGoal });
    return Math.round(weeklyGoal); // Round to nearest whole number
  };

  const calculateTAGoal = (previousYearGM: number) => {
    const increasedGM = previousYearGM * 1.05; // Increase by 5%
    const weeklyGM = increasedGM / 52; // Divide by 52 weeks
    const averageTAPrice = 115; // Average TA price in NOK
    const weeklyTACount = Math.round(weeklyGM / averageTAPrice); // Calculate number of TAs needed
    console.log('Calculating TA goal:', { previousYearGM, increasedGM, weeklyGM, weeklyTACount });
    return weeklyTACount;
  };

  const calculateDailyGoals = (weeklyGoal: number) => {
    const baseDailyGoal = Math.round(weeklyGoal / 6); // Divide by 6 days (Mon-Sat)
    const dailyGoals = {
      Monday: baseDailyGoal,
      Tuesday: baseDailyGoal * 2,
      Wednesday: baseDailyGoal * 3,
      Thursday: baseDailyGoal * 4,
      Friday: baseDailyGoal * 5,
      Saturday: baseDailyGoal * 6
    };
    console.log('Calculating daily goals:', { weeklyGoal, baseDailyGoal, dailyGoals });
    return dailyGoals;
  };

  const handlePreviousYearGMChange = async (yearKey: string, yearData: any, value: string, type: 'avs' | 'ta') => {
    console.log('Previous year GM changed:', { yearKey, type, value });
    const newValue = parseFloat(value) || 0;
    const updatedData = {
      ...yearData,
      previousYearGM: {
        ...yearData.previousYearGM,
        [type]: newValue
      }
    };
    console.log('Updated year data:', updatedData);

    // Update goals based on type
    if (type === 'avs') {
      const calculatedGoal = calculateAVSGoal(newValue);
      const dailyGoals = calculateDailyGoals(calculatedGoal);
      updatedData.goals = {
        ...yearData.goals,
        avs: calculatedGoal
      };
      console.log('Updated AVS goals:', { calculatedGoal, dailyGoals });
      
      // Update the goals in the store
      const currentGoals = useReportStore.getState().goals;
      const updatedGoals = currentGoals.map(goal => {
        if (goal.section === 'AVS') {
          return {
            ...goal,
            goals: Object.values(dailyGoals)
          };
        }
        return goal;
      });
      console.log('Updated store goals for AVS:', updatedGoals);
      try {
        await db.setGoals(updatedGoals);
        useReportStore.setState({ goals: updatedGoals });
      } catch (error) {
        console.error('Failed to update goals:', error);
      }
    } else if (type === 'ta') {
      const calculatedGoal = calculateTAGoal(newValue);
      const dailyGoals = calculateDailyGoals(calculatedGoal);
      updatedData.goals = {
        ...yearData.goals,
        insurance: calculatedGoal
      };
      console.log('Updated TA goals:', { calculatedGoal, dailyGoals });
      
      // Update the goals in the store
      const currentGoals = useReportStore.getState().goals;
      const updatedGoals = currentGoals.map(goal => {
        if (goal.section === 'Insurance Agreements') {
          return {
            ...goal,
            goals: Object.values(dailyGoals)
          };
        }
        return goal;
      });
      console.log('Updated store goals for TA:', updatedGoals);
      try {
        await db.setGoals(updatedGoals);
        useReportStore.setState({ goals: updatedGoals });
      } catch (error) {
        console.error('Failed to update goals:', error);
      }
    }

    await setBudgetYear(yearKey, updatedData);
  };

  const handleAddYear = async () => {
    if (!newYear.startDate || !newYear.endDate) {
      alert('Please fill in all required fields');
      return;
    }

    const startYear = new Date(newYear.startDate).getFullYear();
    const yearKey = `${startYear}/${startYear + 1}`;

    // Calculate goals based on previous year GM
    const calculatedAVSGoal = calculateAVSGoal(newYear.previousYearGM.avs);
    const calculatedTAGoal = calculateTAGoal(newYear.previousYearGM.ta);

    // Calculate daily goals
    const avsDailyGoals = calculateDailyGoals(calculatedAVSGoal);
    const taDailyGoals = calculateDailyGoals(calculatedTAGoal);

    try {
      // Update the goals in the store
      const currentGoals = useReportStore.getState().goals;
      const updatedGoals = currentGoals.map(goal => {
        if (goal.section === 'AVS') {
          return {
            ...goal,
            goals: Object.values(avsDailyGoals)
          };
        }
        if (goal.section === 'Insurance Agreements') {
          return {
            ...goal,
            goals: Object.values(taDailyGoals)
          };
        }
        return goal;
      });
      useReportStore.getState().loadGoals();

      await setBudgetYear(yearKey, {
        startDate: new Date(newYear.startDate).toISOString(),
        endDate: new Date(newYear.endDate).toISOString(),
        previousYearGM: {
          avs: newYear.previousYearGM.avs || 0,
          ta: newYear.previousYearGM.ta || 0
        },
        goals: {
          avs: calculatedAVSGoal,
          insurance: calculatedTAGoal,
          precalibrated: newYear.goals.precalibrated || 0,
          repair: newYear.goals.repair || 0
        }
      });

      setNewYear({
        startDate: '',
        endDate: '',
        previousYearGM: {
          avs: 0,
          ta: 0
        },
        goals: {
          avs: 0,
          insurance: 0,
          precalibrated: 0,
          repair: 0
        }
      });
    } catch (error) {
      console.error('Failed to add budget year:', error);
      alert('Failed to add budget year');
    }
  };

  const handleDeleteYear = async () => {
    if (!yearToDelete) return;
    try {
      await deleteBudgetYear(yearToDelete);
      setYearToDelete(null);
    } catch (error) {
      console.error('Failed to delete budget year:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data Management</h2>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-6">
          {/* Budget Year Management */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Budget Year</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Select the current budget year
                </p>
              </div>
              <div className="flex gap-2">
                {Object.keys(budgetYears).map((yearKey) => (
                  <Button
                    key={yearKey}
                    onClick={() => setSelectedBudgetYear(yearKey)}
                    color={selectedBudgetYear === yearKey ? 'green' : 'gray'}
                    variant={selectedBudgetYear === yearKey ? 'primary' : 'outline'}
                    className="text-sm"
                  >
                    {yearKey}
                  </Button>
                ))}
              </div>
            </div>

            {/* Budget Year Settings */}
            <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <Label>Budget Year Settings</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Manage budget years and their goals
              </p>
              
              {/* Existing Budget Years */}
              <div className="space-y-4">
                {Object.entries(budgetYears).map(([yearKey, yearData]) => (
                  <div key={yearKey} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">{yearKey}</h3>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => setEditingYear(editingYear === yearKey ? null : yearKey)}
                          color="gray"
                          variant="outline"
                        >
                          {editingYear === yearKey ? 'Done' : 'Edit'}
                        </Button>
                        <Button
                          onClick={() => setYearToDelete(yearKey)}
                          color="red"
                          variant="outline"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    
                    {editingYear === yearKey ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Start Date</Label>
                            <Input
                              type="date"
                              value={yearData.startDate.split('T')[0]}
                              onChange={(e) => setBudgetYear(yearKey, {
                                ...yearData,
                                startDate: new Date(e.target.value).toISOString()
                              })}
                              className="bg-gray-50 dark:bg-gray-900"
                            />
                          </div>
                          <div>
                            <Label>End Date</Label>
                            <Input
                              type="date"
                              value={yearData.endDate.split('T')[0]}
                              onChange={(e) => setBudgetYear(yearKey, {
                                ...yearData,
                                endDate: new Date(e.target.value).toISOString()
                              })}
                              className="bg-gray-50 dark:bg-gray-900"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>Previous Year AVS GM</Label>
                            <Input
                              type="number"
                              value={yearData.previousYearGM?.avs || 0}
                              onChange={(e) => handlePreviousYearGMChange(
                                yearKey,
                                yearData,
                                e.target.value,
                                'avs'
                              )}
                              className="bg-gray-50 dark:bg-gray-900"
                            />
                          </div>
                          <div>
                            <Label>Previous Year TA GM</Label>
                            <Input
                              type="number"
                              value={yearData.previousYearGM?.ta || 0}
                              onChange={(e) => handlePreviousYearGMChange(
                                yearKey,
                                yearData,
                                e.target.value,
                                'ta'
                              )}
                              className="bg-gray-50 dark:bg-gray-900"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label>AVS Goal</Label>
                            <Input
                              type="number"
                              value={yearData.goals?.avs || 0}
                              onChange={(e) => setBudgetYear(yearKey, {
                                ...yearData,
                                goals: {
                                  ...yearData.goals,
                                  avs: parseFloat(e.target.value) || 0
                                }
                              })}
                              className="bg-gray-50 dark:bg-gray-900"
                            />
                          </div>
                          <div>
                            <Label>Insurance Goal</Label>
                            <Input
                              type="number"
                              value={yearData.goals?.insurance || 0}
                              onChange={(e) => setBudgetYear(yearKey, {
                                ...yearData,
                                goals: {
                                  ...yearData.goals,
                                  insurance: parseFloat(e.target.value) || 0
                                }
                              })}
                              className="bg-gray-50 dark:bg-gray-900"
                            />
                          </div>
                          <div>
                            <Label>Precalibrated Goal</Label>
                            <Input
                              type="number"
                              value={yearData.goals?.precalibrated || 0}
                              onChange={(e) => setBudgetYear(yearKey, {
                                ...yearData,
                                goals: {
                                  ...yearData.goals,
                                  precalibrated: parseFloat(e.target.value) || 0
                                }
                              })}
                              className="bg-gray-50 dark:bg-gray-900"
                            />
                          </div>
                          <div>
                            <Label>Repair Goal</Label>
                            <Input
                              type="number"
                              value={yearData.goals?.repair || 0}
                              onChange={(e) => setBudgetYear(yearKey, {
                                ...yearData,
                                goals: {
                                  ...yearData.goals,
                                  repair: parseFloat(e.target.value) || 0
                                }
                              })}
                              className="bg-gray-50 dark:bg-gray-900"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Previous Year GM:</span>
                          <div className="mt-1 space-y-1">
                            <div>AVS: {(yearData.previousYearGM?.avs || 0).toLocaleString()}</div>
                            <div>TA: {(yearData.previousYearGM?.ta || 0).toLocaleString()}</div>
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500 dark:text-gray-400">Goals:</span>
                          <div className="mt-1 space-y-1">
                            <div>AVS: {(yearData.goals?.avs || 0).toLocaleString()}</div>
                            <div>Insurance: {(yearData.goals?.insurance || 0).toLocaleString()}</div>
                            <div>Precalibrated: {(yearData.goals?.precalibrated || 0).toLocaleString()}</div>
                            <div>Repair: {(yearData.goals?.repair || 0).toLocaleString()}</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add New Budget Year */}
              <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Budget Year</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Start Date</Label>
                      <Input
                        type="date"
                        value={newYear.startDate}
                        onChange={(e) => setNewYear({
                          ...newYear,
                          startDate: e.target.value
                        })}
                        className="bg-gray-50 dark:bg-gray-900"
                      />
                    </div>
                    <div>
                      <Label>End Date</Label>
                      <Input
                        type="date"
                        value={newYear.endDate}
                        onChange={(e) => setNewYear({
                          ...newYear,
                          endDate: e.target.value
                        })}
                        className="bg-gray-50 dark:bg-gray-900"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Previous Year AVS GM</Label>
                      <Input
                        type="number"
                        value={newYear.previousYearGM.avs}
                        onChange={(e) => setNewYear({
                          ...newYear,
                          previousYearGM: {
                            ...newYear.previousYearGM,
                            avs: parseFloat(e.target.value)
                          }
                        })}
                        className="bg-gray-50 dark:bg-gray-900"
                      />
                    </div>
                    <div>
                      <Label>Previous Year TA GM</Label>
                      <Input
                        type="number"
                        value={newYear.previousYearGM.ta}
                        onChange={(e) => setNewYear({
                          ...newYear,
                          previousYearGM: {
                            ...newYear.previousYearGM,
                            ta: parseFloat(e.target.value)
                          }
                        })}
                        className="bg-gray-50 dark:bg-gray-900"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>AVS Goal</Label>
                      <Input
                        type="number"
                        value={newYear.goals.avs}
                        onChange={(e) => setNewYear({
                          ...newYear,
                          goals: {
                            ...newYear.goals,
                            avs: parseFloat(e.target.value)
                          }
                        })}
                        className="bg-gray-50 dark:bg-gray-900"
                      />
                    </div>
                    <div>
                      <Label>Insurance Goal</Label>
                      <Input
                        type="number"
                        value={newYear.goals.insurance}
                        onChange={(e) => setNewYear({
                          ...newYear,
                          goals: {
                            ...newYear.goals,
                            insurance: parseFloat(e.target.value)
                          }
                        })}
                        className="bg-gray-50 dark:bg-gray-900"
                      />
                    </div>
                    <div>
                      <Label>Precalibrated Goal</Label>
                      <Input
                        type="number"
                        value={newYear.goals.precalibrated}
                        onChange={(e) => setNewYear({
                          ...newYear,
                          goals: {
                            ...newYear.goals,
                            precalibrated: parseFloat(e.target.value)
                          }
                        })}
                        className="bg-gray-50 dark:bg-gray-900"
                      />
                    </div>
                    <div>
                      <Label>Repair Goal</Label>
                      <Input
                        type="number"
                        value={newYear.goals.repair}
                        onChange={(e) => setNewYear({
                          ...newYear,
                          goals: {
                            ...newYear.goals,
                            repair: parseFloat(e.target.value)
                          }
                        })}
                        className="bg-gray-50 dark:bg-gray-900"
                      />
                    </div>
                  </div>
                  <Button
                    onClick={handleAddYear}
                    color="green"
                    className="w-full"
                  >
                    Add Budget Year
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Configuration Data Export/Import */}
          <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Label>Configuration Data</Label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Export or import configuration data (services, people, goals)
            </p>
            <div className="flex gap-4">
              <Button
                onClick={onExportConfig}
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
                  onChange={onImportConfig}
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
                onClick={onExportUserData}
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
                  onChange={onImportUserData}
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
                onClick={onResetUserData}
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

          {/* Auto-save Settings */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Auto-save</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Automatically save changes periodically</p>
            </div>
            <input
              type="checkbox"
              checked={settings.data.autoSave}
              onChange={(e) => updateSettings({ data: { ...settings.data, autoSave: e.target.checked } })}
              className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
            />
          </div>

          {settings.data.autoSave && (
            <div className="space-y-2">
              <Label>Auto-save Interval (minutes)</Label>
              <Input
                type="number"
                min="1"
                max="60"
                value={settings.data.autoSaveInterval}
                onChange={(e) => updateSettings({ data: { ...settings.data, autoSaveInterval: parseInt(e.target.value) } })}
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
              value={settings.data.dataRetention}
              onChange={(e) => updateSettings({ data: { ...settings.data, dataRetention: parseInt(e.target.value) } })}
              className="bg-gray-50 dark:bg-gray-900"
            />
          </div>

          {/* Default Values */}
          <div className="space-y-4">
            <Label>Default Values</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(settings.data.defaultValues).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={value as number}
                    onChange={(e) => updateSettings({
                      data: {
                        ...settings.data,
                        defaultValues: {
                          ...settings.data.defaultValues,
                          [key]: parseInt(e.target.value)
                        }
                      }
                    })}
                    className="bg-gray-50 dark:bg-gray-900"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="space-y-4">
              <Label>Danger Zone</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">These actions cannot be undone</p>
              <Button
                variant="outline"
                color="red"
                onClick={onResetAllData}
              >
                Reset All Data
              </Button>
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={!!yearToDelete}
        onClose={() => setYearToDelete(null)}
        onConfirm={handleDeleteYear}
        title="Delete Budget Year"
        message={`Are you sure you want to delete the budget year ${yearToDelete}? This will permanently delete all data associated with this budget year, including sales, repairs, and other records. This action cannot be undone.`}
        confirmText="Delete Budget Year"
        cancelText="Cancel"
      />
    </div>
  );
} 