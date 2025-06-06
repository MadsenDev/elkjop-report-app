import { useState } from 'react';
import { FaCheckCircle, FaTimesCircle, FaChartLine } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
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
  const goals = useReportStore((s) => s.goals);
  const [isHovered, setIsHovered] = useState(false);

  console.log('GoalProgress render:', { day, section, goals });

  const sectionData = goals.find(g => g.section === section);
  console.log('Found section data:', sectionData);
  
  if (!sectionData) {
    console.log('No section data found for:', section);
    return null;
  }

  const dayIndex = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].indexOf(day);
  const goal = sectionData.goals[dayIndex];
  console.log('Goal for day:', { day, dayIndex, goal });

  const getCurrentValue = () => {
    const previousDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].slice(0, dayIndex + 1);
    
    switch (section) {
      case 'AVS':
        const avsValue = previousDays.reduce((sum, d) => {
          return sum + avsAssignments
            .filter(a => a.day === d)
            .reduce((daySum, a) => daySum + a.gm, 0);
        }, 0);
        console.log('AVS current value:', { previousDays, avsValue });
        return avsValue;
      case 'Insurance Agreements':
        const insuranceValue = previousDays.reduce((sum, d) => {
          return sum + insuranceAgreements
            .filter(t => t.day === d)
            .reduce((daySum, t) => daySum + t.sold, 0);
        }, 0);
        console.log('Insurance current value:', { previousDays, insuranceValue });
        return insuranceValue;
      case 'Precalibrated TVs':
        const tvValue = previousDays.reduce((sum, d) => {
          return sum + precalibratedTVs
            .filter(p => p.day === d)
            .reduce((daySum, p) => daySum + p.completed, 0);
        }, 0);
        console.log('TV current value:', { previousDays, tvValue });
        return tvValue;
      case 'RepairTickets':
        const repairValue = previousDays.reduce((sum, d) => {
          return sum + repairTickets
            .filter(r => r.day === d)
            .reduce((daySum, r) => daySum + r.completed, 0);
        }, 0);
        console.log('Repair current value:', { previousDays, repairValue });
        return repairValue;
      default:
        return 0;
    }
  };

  const currentValue = getCurrentValue();
  const progress = goal > 0 ? Math.min((currentValue / goal) * 100, 100) : 0;
  const remaining = goal - currentValue;
  console.log('Progress calculation:', { currentValue, goal, progress, remaining });

  const descriptions = {
    'AVS': 'Cumulative GM Goal',
    'Insurance Agreements': 'Cumulative Sales Goal',
    'Precalibrated TVs': 'Cumulative Completions Goal',
    'RepairTickets': 'Cumulative Tickets Goal',
  };

  const colorStyles = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      progress: 'bg-blue-500',
      text: 'text-blue-700 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      icon: 'text-blue-500 dark:text-blue-400',
      hover: 'hover:bg-blue-100 dark:hover:bg-blue-900/30',
      glow: 'shadow-blue-500/20',
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      progress: 'bg-green-500',
      text: 'text-green-700 dark:text-green-400',
      border: 'border-green-200 dark:border-green-800',
      icon: 'text-green-500 dark:text-green-400',
      hover: 'hover:bg-green-100 dark:hover:bg-green-900/30',
      glow: 'shadow-green-500/20',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      progress: 'bg-purple-500',
      text: 'text-purple-700 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
      icon: 'text-purple-500 dark:text-purple-400',
      hover: 'hover:bg-purple-100 dark:hover:bg-purple-900/30',
      glow: 'shadow-purple-500/20',
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      progress: 'bg-orange-500',
      text: 'text-orange-700 dark:text-orange-400',
      border: 'border-orange-200 dark:border-orange-800',
      icon: 'text-orange-500 dark:text-orange-400',
      hover: 'hover:bg-orange-100 dark:hover:bg-orange-900/30',
      glow: 'shadow-orange-500/20',
    },
  };

  const style = colorStyles[color as keyof typeof colorStyles] || {
    bg: 'bg-gray-50 dark:bg-gray-800',
    progress: 'bg-gray-500',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-200 dark:border-gray-700',
    icon: 'text-gray-500 dark:text-gray-400',
    hover: 'hover:bg-gray-100 dark:hover:bg-gray-700',
    glow: 'shadow-gray-500/20',
  };

  const isComplete = currentValue >= goal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${style.bg} ${style.hover} rounded-xl border ${style.border} shadow-sm p-6 transition-all duration-300 ${
        isHovered ? `shadow-lg ${style.glow}` : ''
      }`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <motion.div 
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
        >
          <FaChartLine className={`${style.icon} text-lg`} />
          <span className={`text-sm font-semibold ${style.text}`}>
            {descriptions[section]}
          </span>
        </motion.div>
        <motion.div
          className={`text-sm font-bold ${style.text}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          {section === 'AVS' ? formatCurrency(currentValue) : currentValue} / {section === 'AVS' ? formatCurrency(goal) : goal}
        </motion.div>
      </div>
      
      <div className="relative h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
        <motion.div
          className={`absolute top-0 left-0 h-full rounded-full ${style.progress}`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ 
            duration: 1,
            type: "spring",
            stiffness: 100,
            damping: 20
          }}
        />
        <motion.div
          className="absolute inset-0 bg-white/20"
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </div>

      <div className="flex items-center justify-between">
        <motion.div 
          className="flex flex-col"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <span className={`text-xs font-medium ${style.text}`}>
            {progress.toFixed(1)}% complete
          </span>
          {!isComplete && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {section === 'AVS' ? formatCurrency(remaining) : remaining} remaining
            </span>
          )}
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.div
            key={isComplete ? 'complete' : 'incomplete'}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
            className="relative"
          >
            {isComplete ? (
              <FaCheckCircle className={`text-xl ${style.icon}`} />
            ) : (
              <FaTimesCircle className="text-xl text-red-500 dark:text-red-400" />
            )}
            <motion.div
              className="absolute inset-0 rounded-full"
              initial={{ scale: 0 }}
              animate={{ scale: isHovered ? 1.5 : 0 }}
              transition={{ duration: 0.2 }}
              style={{ 
                background: isComplete ? style.progress : 'rgb(239, 68, 68)',
                opacity: 0.2
              }}
            />
          </motion.div>
        </AnimatePresence>
      </div>
    </motion.div>
  );
} 