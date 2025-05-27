import useReportStore from "../store";
import { Day } from "../types";
import { formatCurrency } from "../utils/format";
import { useDisplaySettings } from "../contexts/DisplaySettingsContext";
import {
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  TvIcon,
  WrenchIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

interface DayReportCardProps {
  day: Day;
}

function StatPill({ icon: Icon, label, value, goal, color }: any) {
  return (
    <div className={`flex items-center gap-1 px-3 py-1 rounded-xl font-bold text-sm mr-2 mb-2 ${color} bg-opacity-10`}>
      <Icon className={`w-5 h-5 mr-1`} />
      <span>{label}:</span>
      <span className="ml-1 font-extrabold">{value}</span>
      {goal !== undefined && goal !== null && (
        <span className="ml-1 font-normal text-xs opacity-80">/ {goal}</span>
      )}
    </div>
  );
}

export default function DayReportCard({ day }: DayReportCardProps) {
  const { avsAssignments, insuranceAgreements, precalibratedTVs, repairTickets, goals, settings } = useReportStore();
  const qualityInspections = useReportStore((state) => state.qualityInspections);
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);
  const [hasShownConfetti, setHasShownConfetti] = useState(false);

  const daysOrder = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const dayIdx = daysOrder.indexOf(day);
  const daysUpTo = daysOrder.slice(0, dayIdx + 1);

  // Cumulative section data up to and including the selected day
  const gm = avsAssignments.filter(a => daysUpTo.includes(a.day)).reduce((sum, a) => sum + a.gm, 0);
  const avs = avsAssignments.filter(a => daysUpTo.includes(a.day)).reduce((sum, a) => sum + a.sold, 0);
  const ta = insuranceAgreements.filter(t => daysUpTo.includes(t.day)).reduce((sum, t) => sum + t.sold, 0);
  const tv = precalibratedTVs.filter(p => daysUpTo.includes(p.day)).reduce((sum, p) => sum + p.completed, 0);
  const tickets = repairTickets.filter(r => daysUpTo.includes(r.day)).reduce((sum, r) => sum + r.completed, 0);
  const qi = qualityInspections.find(qi => qi.day === day)?.count || 0;

  // Goals for this day
  const gmGoal = goals.find(g => g.section === 'AVS')?.goals[dayIdx] || null;
  const taGoal = goals.find(g => g.section === 'Insurance Agreements')?.goals[dayIdx] || null;
  const tvGoal = goals.find(g => g.section === 'Precalibrated TVs')?.goals[dayIdx] || null;
  const ticketsGoal = goals.find(g => g.section === 'RepairTickets')?.goals[dayIdx] || null;

  // Calculate if all goals are met
  const isGoalMet = gmGoal && taGoal && tvGoal && ticketsGoal &&
    gm >= gmGoal && ta >= taGoal && tv >= tvGoal && tickets >= ticketsGoal;

  // Trigger confetti when goal is first met
  useEffect(() => {
    if (isGoalMet && !hasShownConfetti) {
      setShowConfetti(true);
      setHasShownConfetti(true);
      // Hide confetti after 5 seconds
      const timer = setTimeout(() => {
        setShowConfetti(false);
      }, 5000);
      return () => clearTimeout(timer);
    } else if (!isGoalMet) {
      setHasShownConfetti(false);
    }
  }, [isGoalMet, hasShownConfetti]);

  return (
    <>
      {showConfetti && (
        <Confetti
          width={width}
          height={height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
          colors={['#4F46E5', '#10B981', '#3B82F6', '#F59E0B']}
          style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 9999 }}
        />
      )}
      <div className={`bg-white dark:bg-gray-800 px-4 sm:px-8 py-6 sm:py-8 relative overflow-hidden ${isGoalMet ? 'border-2 border-elkjop-green' : ''}`}>
        {isGoalMet && (
          <>
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
              {/* Static Confetti */}
              <div className="absolute inset-0 overflow-hidden">
                {/* Confetti pieces */}
                <div className="absolute w-2 h-2 bg-indigo-500/30 rotate-45 top-[10%] left-[10%]" />
                <div className="absolute w-2 h-2 bg-purple-500/30 rotate-45 top-[15%] left-[20%]" />
                <div className="absolute w-2 h-2 bg-pink-500/30 rotate-45 top-[20%] left-[30%]" />
                <div className="absolute w-2 h-2 bg-blue-500/30 rotate-45 top-[25%] left-[40%]" />
                <div className="absolute w-2 h-2 bg-indigo-500/30 rotate-45 top-[30%] left-[50%]" />
                <div className="absolute w-2 h-2 bg-purple-500/30 rotate-45 top-[35%] left-[60%]" />
                <div className="absolute w-2 h-2 bg-pink-500/30 rotate-45 top-[40%] left-[70%]" />
                <div className="absolute w-2 h-2 bg-blue-500/30 rotate-45 top-[45%] left-[80%]" />
                <div className="absolute w-2 h-2 bg-indigo-500/30 rotate-45 top-[50%] left-[90%]" />
                <div className="absolute w-2 h-2 bg-purple-500/30 rotate-45 top-[55%] left-[5%]" />
                <div className="absolute w-2 h-2 bg-pink-500/30 rotate-45 top-[60%] left-[15%]" />
                <div className="absolute w-2 h-2 bg-blue-500/30 rotate-45 top-[65%] left-[25%]" />
                <div className="absolute w-2 h-2 bg-indigo-500/30 rotate-45 top-[70%] left-[35%]" />
                <div className="absolute w-2 h-2 bg-purple-500/30 rotate-45 top-[75%] left-[45%]" />
                <div className="absolute w-2 h-2 bg-pink-500/30 rotate-45 top-[80%] left-[55%]" />
                <div className="absolute w-2 h-2 bg-blue-500/30 rotate-45 top-[85%] left-[65%]" />
                <div className="absolute w-2 h-2 bg-indigo-500/30 rotate-45 top-[90%] left-[75%]" />
                <div className="absolute w-2 h-2 bg-purple-500/30 rotate-45 top-[95%] left-[85%]" />
                <div className="absolute w-2 h-2 bg-pink-500/30 rotate-45 top-[5%] left-[95%]" />
                {/* Larger confetti pieces */}
                <div className="absolute w-3 h-3 bg-indigo-500/20 rotate-45 top-[15%] left-[85%]" />
                <div className="absolute w-3 h-3 bg-purple-500/20 rotate-45 top-[45%] left-[15%]" />
                <div className="absolute w-3 h-3 bg-pink-500/20 rotate-45 top-[75%] left-[95%]" />
                <div className="absolute w-3 h-3 bg-blue-500/20 rotate-45 top-[85%] left-[35%]" />
                <div className="absolute w-3 h-3 bg-indigo-500/20 rotate-45 top-[25%] left-[65%]" />
                {/* Diagonal confetti pieces */}
                <div className="absolute w-2 h-2 bg-purple-500/30 rotate-[135deg] top-[20%] left-[25%]" />
                <div className="absolute w-2 h-2 bg-pink-500/30 rotate-[135deg] top-[40%] left-[45%]" />
                <div className="absolute w-2 h-2 bg-blue-500/30 rotate-[135deg] top-[60%] left-[65%]" />
                <div className="absolute w-2 h-2 bg-indigo-500/30 rotate-[135deg] top-[80%] left-[85%]" />
                <div className="absolute w-2 h-2 bg-purple-500/30 rotate-[135deg] top-[30%] left-[35%]" />
                <div className="absolute w-2 h-2 bg-pink-500/30 rotate-[135deg] top-[50%] left-[55%]" />
                <div className="absolute w-2 h-2 bg-blue-500/30 rotate-[135deg] top-[70%] left-[75%]" />
                <div className="absolute w-2 h-2 bg-indigo-500/30 rotate-[135deg] top-[90%] left-[95%]" />
              </div>
            </div>
            <div className="absolute top-2 right-2">
              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white text-xs font-bold">
                ✨
              </span>
            </div>
          </>
        )}
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-elkjop-green/10 to-blue-500/10">
              <svg className="w-5 h-5 text-elkjop-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {day}
            </h2>
          </div>
          {isGoalMet && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-elkjop-green/10 to-blue-500/10 text-elkjop-green text-sm font-medium">
              <span>Goal Met!</span>
              <span>🎉</span>
            </div>
          )}
        </div>
        {/* Stat Pills Row */}
        <div className="flex flex-wrap gap-y-2 mb-6">
          <StatPill icon={CurrencyDollarIcon} label="GM" value={formatCurrency(gm)} goal={gmGoal ? formatCurrency(gmGoal) : null} color="text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30" />
          {settings.display.showSections.avs && (
            <StatPill icon={WrenchScrewdriverIcon} label="AVS" value={avs} color="text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30" />
          )}
          {settings.display.showSections.insurance && (
            <StatPill icon={ShieldCheckIcon} label="TA" value={ta} goal={taGoal} color="text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30" />
          )}
          {settings.display.showSections.precalibrated && (
            <StatPill icon={TvIcon} label="TV" value={tv} goal={tvGoal} color="text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30" />
          )}
          {settings.display.showSections.repair && (
            <StatPill icon={WrenchIcon} label="Tickets" value={tickets} goal={ticketsGoal} color="text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30" />
          )}
          <StatPill icon={ArrowTrendingUpIcon} label="QI" value={qi} color="text-gray-700 dark:text-gray-400 bg-gray-200 dark:bg-gray-700/30" />
        </div>
        {/* AVS Section */}
        {settings.display.showSections.avs && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-1">
              <WrenchScrewdriverIcon className="w-5 h-5 text-blue-700 dark:text-blue-400" />
              <span className="font-semibold text-blue-700 dark:text-blue-400">AVS (Additional Value Services)</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[300px] w-full text-sm mt-1 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <thead>
                  <tr>
                    <th className="text-left px-3 py-1 font-semibold text-blue-700 dark:text-blue-400">Person</th>
                    <th className="text-left px-3 py-1 font-semibold text-blue-700 dark:text-blue-400">Service</th>
                    <th className="text-left px-3 py-1 font-semibold text-blue-700 dark:text-blue-400">GM</th>
                  </tr>
                </thead>
                <tbody>
                  {avsAssignments.filter(a => a.day === day).length === 0 ? (
                    <tr><td colSpan={4} className="text-gray-400 dark:text-gray-500 px-3 py-2">No data</td></tr>
                  ) : (
                    avsAssignments.filter(a => a.day === day).map((a, i) => (
                      <tr key={i} className="bg-white/50 dark:bg-gray-800/50">
                        <td className="px-3 py-1 text-gray-900 dark:text-gray-100">{a.person}</td>
                        <td className="px-3 py-1 text-gray-900 dark:text-gray-100">{a.serviceId}</td>
                        <td className="px-3 py-1 text-gray-900 dark:text-gray-100">{formatCurrency(a.gm)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Insurance Agreements Section */}
        {settings.display.showSections.insurance && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheckIcon className="w-5 h-5 text-green-700 dark:text-green-400" />
              <span className="font-semibold text-green-700 dark:text-green-400">Insurance Agreements</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[200px] w-full text-sm mt-1 bg-green-50 dark:bg-green-900/30 rounded-lg">
                <thead>
                  <tr>
                    <th className="text-left px-3 py-1 font-semibold text-green-700 dark:text-green-400">Person</th>
                    <th className="text-left px-3 py-1 font-semibold text-green-700 dark:text-green-400">Sold</th>
                  </tr>
                </thead>
                <tbody>
                  {insuranceAgreements.filter(t => t.day === day).length === 0 ? (
                    <tr><td colSpan={2} className="text-gray-400 dark:text-gray-500 px-3 py-2">No data</td></tr>
                  ) : (
                    insuranceAgreements.filter(t => t.day === day).map((t, i) => (
                      <tr key={i} className="bg-white/50 dark:bg-gray-800/50">
                        <td className="px-3 py-1 text-gray-900 dark:text-gray-100">{t.person}</td>
                        <td className="px-3 py-1 text-gray-900 dark:text-gray-100">{t.sold}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Precalibrated TVs Section */}
        {settings.display.showSections.precalibrated && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-1">
              <TvIcon className="w-5 h-5 text-purple-700 dark:text-purple-400" />
              <span className="font-semibold text-purple-700 dark:text-purple-400">Precalibrated TVs</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[220px] w-full text-sm mt-1 bg-purple-50 dark:bg-purple-900/30 rounded-lg">
                <thead>
                  <tr>
                    <th className="text-left px-3 py-1 font-semibold text-purple-700 dark:text-purple-400">Person</th>
                    <th className="text-left px-3 py-1 font-semibold text-purple-700 dark:text-purple-400">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {precalibratedTVs.filter(p => p.day === day).length === 0 ? (
                    <tr><td colSpan={2} className="text-gray-400 dark:text-gray-500 px-3 py-2">No data</td></tr>
                  ) : (
                    precalibratedTVs.filter(p => p.day === day).map((p, i) => (
                      <tr key={i} className="bg-white/50 dark:bg-gray-800/50">
                        <td className="px-3 py-1 text-gray-900 dark:text-gray-100">{p.person}</td>
                        <td className="px-3 py-1 text-gray-900 dark:text-gray-100">{p.completed}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
        {/* Repair Tickets Section */}
        {settings.display.showSections.repair && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-1">
              <WrenchIcon className="w-5 h-5 text-orange-700 dark:text-orange-400" />
              <span className="font-semibold text-orange-700 dark:text-orange-400">Repair Tickets</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[220px] w-full text-sm mt-1 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                <thead>
                  <tr>
                    <th className="text-left px-3 py-1 font-semibold text-orange-700 dark:text-orange-400">Person</th>
                    <th className="text-left px-3 py-1 font-semibold text-orange-700 dark:text-orange-400">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {repairTickets.filter(r => r.day === day).length === 0 ? (
                    <tr><td colSpan={2} className="text-gray-400 dark:text-gray-500 px-3 py-2">No data</td></tr>
                  ) : (
                    repairTickets.filter(r => r.day === day).map((r, i) => (
                      <tr key={i} className="bg-white/50 dark:bg-gray-800/50">
                        <td className="px-3 py-1 text-gray-900 dark:text-gray-100">{r.person}</td>
                        <td className="px-3 py-1 text-gray-900 dark:text-gray-100">{r.completed}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </>
  );
}