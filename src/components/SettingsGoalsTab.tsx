import { useState } from 'react';
import { Goal } from '../store';
import useReportStore from '../store';
import { db } from '../services/db';
import Button from './ui/Button';
import Input from './ui/Input';

export default function SettingsGoalsTab() {
  const { goals, loadGoals } = useReportStore();
  const [localGoals, setLocalGoals] = useState<Goal[]>(goals);
  const [isSaving, setIsSaving] = useState(false);

  const handleGoalChange = (idx: number, field: keyof Goal, value: string | number[]) => {
    const newGoals = [...localGoals];
    newGoals[idx] = { ...newGoals[idx], [field]: value };
    setLocalGoals(newGoals);
  };

  const handleSaveGoals = async () => {
    try {
      setIsSaving(true);
      await db.setGoals(localGoals);
      await loadGoals(); // Reload to ensure sync
    } catch (error) {
      console.error('Failed to save goals:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Sticky header with title and actions */}
      <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 pb-4 -mx-6 px-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Goals Management</h2>
          <Button
            onClick={handleSaveGoals}
            color="green"
            className="px-6"
            disabled={isSaving}
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {localGoals.map((goal, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Section Name
              </label>
              <Input
                type="text"
                value={goal.section}
                onChange={(e) => handleGoalChange(idx, 'section', e.target.value)}
                placeholder="Enter section name"
                className="bg-gray-50 dark:bg-gray-900 w-full"
              />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((day, dayIdx) => (
                <div key={day}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    {day}
                  </label>
                  <Input
                    type="number"
                    value={goal.goals[dayIdx]}
                    onChange={(e) => {
                      const newGoals = [...goal.goals];
                      newGoals[dayIdx] = parseInt(e.target.value) || 0;
                      handleGoalChange(idx, 'goals', newGoals);
                    }}
                    placeholder="0"
                    className="bg-gray-50 dark:bg-gray-900 w-full"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 