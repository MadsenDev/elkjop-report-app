import React, { useEffect, useState } from 'react';
import { FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { motion } from 'framer-motion';
import useReportStore from '../store';
import { Day } from '../types';
import { formatCurrency } from '../utils/format';

interface GoalProgressProps {
  day: Day;
  section: 'AVS' | 'Insurance Agreements' | 'Precalibrated TVs' | 'RepairTickets';
  color: string;
}

export default function GoalProgress({ day, section, color }: GoalProgressProps) {
  const avsAssignments = useReportStore((s) => s.avsAssignments);
  const insuranceAgreements = useReportStore((s) => s.insuranceAgreements);
  const precalibratedTVs = useReportStore((s) => s.precalibratedTVs);
  const repairTickets = useReportStore((s) => s.repairTickets);

  const [goalsData, setGoalsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/goals.json');
        if (!res.ok) throw new Error('Failed to fetch goals');
        setGoalsData(await res.json());
        setLoading(false);
      } catch (e) {
        setError('Could not load goals from public/.');
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) return <div className="text-gray-700 dark:text-gray-300">Loading goals...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;

  const sectionData = goalsData.find(g => g.section === section);
  if (!sectionData) return null;

  const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day);
  const goal = sectionData.goals[dayIndex];

  const getCurrentValue = () => {
    const previousDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].slice(0, dayIndex + 1);
    
    switch (section) {
      case 'AVS':
        return previousDays.reduce((sum, d) => {
          return sum + avsAssignments
            .filter(a => a.day === d)
            .reduce((daySum, a) => daySum + a.gm, 0);
        }, 0);
      case 'Insurance Agreements':
        return previousDays.reduce((sum, d) => {
          return sum + insuranceAgreements
            .filter(t => t.day === d)
            .reduce((daySum, t) => daySum + t.sold, 0);
        }, 0);
      case 'Precalibrated TVs':
        return previousDays.reduce((sum, d) => {
          return sum + precalibratedTVs
            .filter(p => p.day === d)
            .reduce((daySum, p) => daySum + p.completed, 0);
        }, 0);
      case 'RepairTickets':
        return previousDays.reduce((sum, d) => {
          return sum + repairTickets
            .filter(r => r.day === d)
            .reduce((daySum, r) => daySum + r.completed, 0);
        }, 0);
      default:
        return 0;
    }
  };

  const currentValue = getCurrentValue();
  const progress = goal > 0 ? Math.min((currentValue / goal) * 100, 100) : 0;

  const descriptions = {
    'AVS': 'Cumulative GM Goal',
    'Insurance Agreements': 'Cumulative Sales Goal',
    'Precalibrated TVs': 'Cumulative Completions Goal',
    'RepairTickets': 'Cumulative Tickets Goal',
  };

  const colorStyles = {
    blue: {
      bg: 'bg-blue-100 dark:bg-blue-900/30',
      progress: 'bg-blue-500',
      text: 'text-blue-700 dark:text-blue-400',
    },
    green: {
      bg: 'bg-green-100 dark:bg-green-900/30',
      progress: 'bg-green-500',
      text: 'text-green-700 dark:text-green-400',
    },
    purple: {
      bg: 'bg-purple-100 dark:bg-purple-900/30',
      progress: 'bg-purple-500',
      text: 'text-purple-700 dark:text-purple-400',
    },
    orange: {
      bg: 'bg-orange-100 dark:bg-orange-900/30',
      progress: 'bg-orange-500',
      text: 'text-orange-700 dark:text-orange-400',
    },
  };

  const style = colorStyles[color as keyof typeof colorStyles] || {
    bg: 'bg-gray-200 dark:bg-gray-700',
    progress: 'bg-gray-200',
    text: 'text-gray-500 dark:text-gray-400',
  };

  const isComplete = currentValue >= goal;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{descriptions[section]}</span>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {section === 'AVS' ? formatCurrency(currentValue) : currentValue} / {section === 'AVS' ? formatCurrency(goal) : goal}
        </span>
      </div>
      <div className="relative h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`absolute top-0 left-0 h-full rounded-full ${style.progress}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {progress.toFixed(1)}% complete
        </span>
        {isComplete ? (
          <FaCheckCircle className="text-green-500 dark:text-green-400" />
        ) : (
          <FaTimesCircle className="text-red-500 dark:text-red-400" />
        )}
      </div>
    </div>
  );
} 