import React from 'react';
import useReportStore from '../store';
import Button from './ui/Button';

export default function BudgetYearPicker() {
  const { budgetYears, selectedBudgetYear, setSelectedBudgetYear } = useReportStore();

  const handleYearSelect = (yearKey: string) => {
    setSelectedBudgetYear(yearKey);
  };

  return (
    <div className="flex items-center gap-2">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Budget Year:
      </div>
      <div className="flex gap-2">
        {Object.keys(budgetYears).map((yearKey) => (
          <Button
            key={yearKey}
            onClick={() => handleYearSelect(yearKey)}
            color={selectedBudgetYear === yearKey ? 'green' : 'gray'}
            variant={selectedBudgetYear === yearKey ? 'primary' : 'outline'}
            className="text-sm"
          >
            {yearKey}
          </Button>
        ))}
      </div>
    </div>
  );
} 