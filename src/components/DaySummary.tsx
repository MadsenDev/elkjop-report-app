import { motion } from "framer-motion";
import useReportStore from "../store";
import { Day } from "../types";
import { formatCurrency } from "../utils/format";
import {
  UserGroupIcon,
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  WrenchScrewdriverIcon,
  CalendarIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from "react";
import Card from "./ui/Card";

interface DaySummaryProps {
  day: Day;
}

// Animated number counter
function AnimatedNumber({ value, className = "" }: { value: number, className?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = display;
    let end = value;
    if (start === end) return;
    let raf: number;
    const step = () => {
      start += (end - start) / 8;
      if (Math.abs(end - start) < 1) {
        setDisplay(end);
      } else {
        setDisplay(start);
        raf = requestAnimationFrame(step);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className={className}>{Math.round(display)}</span>;
}

export default function DaySummary({ day }: DaySummaryProps) {
  // All hooks must be at the top level
  const avsAssignments = useReportStore((state) => state.avsAssignments);
  const insuranceAgreements = useReportStore((state) => state.insuranceAgreements);
  const precalibratedTVs = useReportStore((state) => state.precalibratedTVs);
  const repairTickets = useReportStore((state) => state.repairTickets);
  const qualityInspections = useReportStore((state) => state.qualityInspections);
  const setQualityInspection = useReportStore((state) => state.setQualityInspection);
  const [isQIModalOpen, setIsQIModalOpen] = useState(false);
  const [qiCount, setQICount] = useState(0);
  const [goalsData, setGoalsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch goals data
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

  // Update QI count when day changes
  useEffect(() => {
    const qiForDay = qualityInspections.find(qi => qi.day === day)?.count || 0;
    setQICount(qiForDay);
  }, [day, qualityInspections]);

  // Days order for cumulative calculation
  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIdx = daysOrder.indexOf(day);
  const daysUpTo = daysOrder.slice(0, dayIdx + 1);

  // Calculate cumulative totals up to and including the selected day
  const totalGM = avsAssignments
    .filter((assignment) => daysUpTo.includes(assignment.day))
    .reduce((sum, assignment) => sum + assignment.gm, 0);

  const totalServices = avsAssignments
    .filter((assignment) => daysUpTo.includes(assignment.day))
    .reduce((sum, assignment) => sum + assignment.sold, 0);

  const insuranceAgreementsTotal = insuranceAgreements
    .filter((t) => daysUpTo.includes(t.day))
    .reduce((sum, t) => sum + t.sold, 0);

  const precalibratedTVsTotal = precalibratedTVs
    .filter((p) => daysUpTo.includes(p.day))
    .reduce((sum, p) => sum + p.completed, 0);

  const repairTicketsTotal = repairTickets
    .filter((r) => daysUpTo.includes(r.day))
    .reduce((sum, r) => sum + r.completed, 0);

  // Get unique people (cumulative)
  const people = new Set([
    ...avsAssignments.filter((a) => daysUpTo.includes(a.day)).map((a) => a.person),
    ...insuranceAgreements.filter((t) => daysUpTo.includes(t.day)).map((t) => t.person),
    ...precalibratedTVs.filter((p) => daysUpTo.includes(p.day)).map((p) => p.person),
    ...repairTickets.filter((r) => daysUpTo.includes(r.day)).map((r) => r.person),
  ]);

  // Calculate progress for each section (cumulative)
  const avsGoal = goalsData.find(g => g.section === 'AVS')?.goals[dayIdx] || 0;
  const insuranceAgreementsGoal = goalsData.find(g => g.section === 'Insurance Agreements')?.goals[dayIdx] || 0;
  const precalibratedTVsGoal = goalsData.find(g => g.section === 'Precalibrated TVs')?.goals[dayIdx] || 0;
  const repairTicketsGoal = goalsData.find(g => g.section === 'RepairTickets')?.goals[dayIdx] || 0;

  const avsProgress = avsGoal ? totalGM / avsGoal : 0;
  const insuranceAgreementsProgress = insuranceAgreementsGoal ? insuranceAgreementsTotal / insuranceAgreementsGoal : 0;
  const precalibratedTVsProgress = precalibratedTVsGoal ? precalibratedTVsTotal / precalibratedTVsGoal : 0;
  const repairTicketsProgress = repairTicketsGoal ? repairTicketsTotal / repairTicketsGoal : 0;

  // Cap each section's progress at 1 (100%)
  const cappedProgresses = [avsProgress, insuranceAgreementsProgress, precalibratedTVsProgress, repairTicketsProgress].map(p => Math.min(p, 1));
  const allGoalsMet = [avsProgress, insuranceAgreementsProgress, precalibratedTVsProgress, repairTicketsProgress].every(p => p >= 1);

  // If all goals are met, use real progress (can exceed 100%), else use capped
  const dailyProgress = ((allGoalsMet
    ? [avsProgress, insuranceAgreementsProgress, precalibratedTVsProgress, repairTicketsProgress]
    : cappedProgresses
  ).reduce((a, b) => a + b, 0) / 4) * 100;

  // QI logic
  const qiForDay = qualityInspections.find(qi => qi.day === day)?.count || 0;

  const handleQISave = () => {
    setQualityInspection(day, qiCount);
    setIsQIModalOpen(false);
  };

  // Stat card icon colors
  const iconColors = [
    'text-elkjop-green',
    'text-elkjop-blue',
    'text-purple-500',
    'text-yellow-500',
  ];

  // Stat cards for grid
  const statCards = [
    {
      name: 'Total GM',
      value: totalGM,
      goal: avsGoal ? formatCurrency(avsGoal) : null,
      icon: CurrencyDollarIcon,
      color: 'from-green-400 to-green-600',
      progress: avsGoal ? totalGM / avsGoal : null,
      tooltip: 'Gross Margin from all sold services (cumulative for the week).',
    },
    {
      name: 'Total Services',
      value: totalServices,
      goal: null,
      icon: WrenchScrewdriverIcon,
      color: 'from-blue-400 to-blue-600',
      progress: null,
      tooltip: 'Number of services sold (cumulative for the week).',
    },
    {
      name: 'People',
      value: people.size,
      goal: null,
      icon: UserGroupIcon,
      color: 'from-purple-400 to-purple-600',
      progress: null,
      tooltip: 'Unique people who contributed to the stats.',
    },
    {
      name: 'Quality Inspections',
      value: qiForDay,
      goal: null,
      icon: ArrowTrendingUpIcon,
      color: 'from-yellow-300 to-yellow-500',
      progress: null,
      tooltip: 'Quality Inspections performed for this day. Click to edit.',
      onClick: () => setIsQIModalOpen(true),
    },
  ];

  if (loading) return <div>Loading goals...</div>;
  if (error) return <div>{error}</div>;

  return (
    <Card
      title="Day Summary"
      color="indigo"
      icon={<CalendarIcon className="w-6 h-6" />}
      description="Daily Progress Overview"
    >
      <div className="space-y-6">
        {/* Daily Progress - Horizontal */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
              <AnimatedNumber value={Math.round(dailyProgress)} />%
            </span>
            {dailyProgress >= 100 && (
              <span className="ml-2 px-2 py-1 rounded bg-indigo-500 text-white text-xs font-bold">Goal Met!</span>
            )}
          </div>
          <div className="w-full h-3 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(dailyProgress, 100)}%` }}
              transition={{ duration: 0.7 }}
              className={`h-3 rounded-full ${dailyProgress >= 100 ? 'bg-indigo-500' : 'bg-indigo-600'}`}
            />
          </div>
          <span className="mt-1 text-xs text-gray-500 dark:text-gray-400 font-medium">Daily Progress</span>
        </div>

        {/* Stat Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          {statCards.map((card, idx) => (
            <motion.div
              key={card.name}
              whileHover={{ scale: 1.03, boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}
              className={`relative bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm p-4 flex flex-col items-start min-h-[110px] transition-transform duration-200 group ${card.onClick ? 'cursor-pointer' : ''}`}
              aria-label={card.name}
              onClick={card.onClick}
            >
              <div className="flex items-center mb-2">
                <span className={`inline-flex items-center justify-center rounded-full w-8 h-8 mr-3 bg-gray-100 dark:bg-gray-700 ${iconColors[idx % iconColors.length]}`}>
                  <card.icon className="w-5 h-5" />
                </span>
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{card.name}</span>
                {card.tooltip && (
                  <InformationCircleIcon className="w-4 h-4 ml-1 text-gray-300 dark:text-gray-600 group-hover:text-elkjop-green transition" />
                )}
              </div>
              <div className="flex items-end space-x-2 mb-2">
                <AnimatedNumber value={card.value} className="text-2xl font-extrabold text-gray-900 dark:text-white" />
                {card.goal && (
                  <span className="text-sm font-semibold text-elkjop-green/90">/ {card.goal}</span>
                )}
              </div>
              {card.progress !== null && card.goal && (
                <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-elkjop-green"
                    style={{ width: `${Math.min(card.progress * 100, 100)}%` }}
                  />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quality Inspection Modal */}
      <div className="fixed inset-0 bg-gray-500/75 dark:bg-gray-900/75 transition-opacity" style={{ display: isQIModalOpen ? 'block' : 'none' }} />
      <div
        className="fixed inset-0 z-10 overflow-y-auto"
        style={{ display: isQIModalOpen ? 'block' : 'none' }}
      >
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
            <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
              <button
                type="button"
                className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                onClick={() => setIsQIModalOpen(false)}
              >
                <span className="sr-only">Close</span>
                <XMarkIcon className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
            <div>
              <div className="mt-3 text-center sm:mt-0 sm:text-left">
                <h3 className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                  Quality Inspections
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Enter the number of quality inspections performed for {day}.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <input
                type="number"
                value={qiCount}
                onChange={(e) => setQICount(parseInt(e.target.value) || 0)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                min="0"
              />
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                onClick={() => setIsQIModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-white bg-elkjop-green border border-transparent rounded-md hover:bg-elkjop-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-elkjop-green dark:focus:ring-offset-gray-800"
                onClick={handleQISave}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
} 