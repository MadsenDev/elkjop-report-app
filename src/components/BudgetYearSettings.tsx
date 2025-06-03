import { useState, useEffect } from 'react';
import useReportStore from '../store';

const BudgetYearSettings = () => {
  const { budgetYears, loadBudgetYears, setBudgetYear } = useReportStore();
  const [selectedYear, setSelectedYear] = useState('');
  const [previousYearGM, setPreviousYearGM] = useState('');
  const [goals, setGoals] = useState({
    avs: '',
    insurance: '',
    precalibrated: '',
    repair: ''
  });

  useEffect(() => {
    loadBudgetYears();
  }, [loadBudgetYears]);

  useEffect(() => {
    if (selectedYear && budgetYears[selectedYear]) {
      const year = budgetYears[selectedYear];
      setPreviousYearGM(year.previousYearGM.toString());
      setGoals({
        avs: year.goals.avs.toString(),
        insurance: year.goals.insurance.toString(),
        precalibrated: year.goals.precalibrated.toString(),
        repair: year.goals.repair.toString()
      });
    }
  }, [selectedYear, budgetYears]);

  const handleSave = async () => {
    if (!selectedYear) return;

    const yearData = {
      startDate: new Date(parseInt(selectedYear.split('/')[0]), 4, 1).toISOString(),
      endDate: new Date(parseInt(selectedYear.split('/')[1]), 3, 31).toISOString(),
      previousYearGM: parseFloat(previousYearGM) || 0,
      goals: {
        avs: parseFloat(goals.avs) || 0,
        insurance: parseFloat(goals.insurance) || 0,
        precalibrated: parseFloat(goals.precalibrated) || 0,
        repair: parseFloat(goals.repair) || 0
      }
    };

    await setBudgetYear(selectedYear, yearData);
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-lg font-medium text-gray-900">Budget Year Settings</h4>
        <p className="mt-1 text-sm text-gray-500">
          Set goals and previous year GM for each budget year.
        </p>
      </div>

      <div>
        <label htmlFor="year" className="block text-sm font-medium text-gray-700">
          Budget Year
        </label>
        <select
          id="year"
          value={selectedYear}
          onChange={(e) => setSelectedYear(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">Select a year</option>
          {Object.keys(budgetYears).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {selectedYear && (
        <>
          <div>
            <label htmlFor="previousYearGM" className="block text-sm font-medium text-gray-700">
              Previous Year GM
            </label>
            <input
              type="number"
              id="previousYearGM"
              value={previousYearGM}
              onChange={(e) => setPreviousYearGM(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Enter previous year GM"
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Goals</h4>
            
            <div>
              <label htmlFor="avsGoal" className="block text-sm font-medium text-gray-700">
                AVS Goal
              </label>
              <input
                type="number"
                id="avsGoal"
                value={goals.avs}
                onChange={(e) => setGoals({ ...goals, avs: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter AVS goal"
              />
            </div>

            <div>
              <label htmlFor="insuranceGoal" className="block text-sm font-medium text-gray-700">
                Insurance Goal
              </label>
              <input
                type="number"
                id="insuranceGoal"
                value={goals.insurance}
                onChange={(e) => setGoals({ ...goals, insurance: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter insurance goal"
              />
            </div>

            <div>
              <label htmlFor="precalibratedGoal" className="block text-sm font-medium text-gray-700">
                Precalibrated TVs Goal
              </label>
              <input
                type="number"
                id="precalibratedGoal"
                value={goals.precalibrated}
                onChange={(e) => setGoals({ ...goals, precalibrated: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter precalibrated TVs goal"
              />
            </div>

            <div>
              <label htmlFor="repairGoal" className="block text-sm font-medium text-gray-700">
                Repair Goal
              </label>
              <input
                type="number"
                id="repairGoal"
                value={goals.repair}
                onChange={(e) => setGoals({ ...goals, repair: e.target.value })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                placeholder="Enter repair goal"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleSave}
              className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Save Settings
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default BudgetYearSettings; 