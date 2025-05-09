import { motion } from "framer-motion";
import useReportStore from "../store";
import { Day } from "../types";
import { formatCurrency } from "../utils/format";
import {
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  TvIcon,
  WrenchIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';
import { useEffect, useState } from "react";

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
  const avsAssignments = useReportStore((state) => state.avsAssignments);
  const insuranceAgreements = useReportStore((state) => state.insuranceAgreements);
  const precalibratedTVs = useReportStore((state) => state.precalibratedTVs);
  const repairTickets = useReportStore((state) => state.repairTickets);
  const qualityInspections = useReportStore((state) => state.qualityInspections);
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
  const gmGoal = goalsData.find(g => g.section === 'AVS')?.goals[dayIdx] || null;
  const taGoal = goalsData.find(g => g.section === 'Insurance Agreements')?.goals[dayIdx] || null;
  const tvGoal = goalsData.find(g => g.section === 'Precalibrated TVs')?.goals[dayIdx] || null;
  const ticketsGoal = goalsData.find(g => g.section === 'RepairTickets')?.goals[dayIdx] || null;

  if (loading) return <div className="text-gray-700 dark:text-gray-300">Loading goals...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;

  return (
      <div className="bg-white dark:bg-gray-800 max-w-lg px-4 sm:px-8 py-6 sm:py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-elkjop-blue dark:text-elkjop-green">
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24"><path d="M7 7h10M7 11h6m-6 4h10M5 3a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2H5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white tracking-tight">Daily Report: <span className="capitalize">{day}</span></h2>
        </div>
        {/* Stat Pills Row */}
        <div className="flex flex-wrap gap-y-2 mb-6">
          <StatPill icon={CurrencyDollarIcon} label="GM" value={formatCurrency(gm)} goal={gmGoal ? formatCurrency(gmGoal) : null} color="text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30" />
          <StatPill icon={WrenchScrewdriverIcon} label="AVS" value={avs} color="text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30" />
          <StatPill icon={ShieldCheckIcon} label="TA" value={ta} goal={taGoal} color="text-green-700 dark:text-green-400 bg-green-100 dark:bg-green-900/30" />
          <StatPill icon={TvIcon} label="TV" value={tv} goal={tvGoal} color="text-purple-700 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30" />
          <StatPill icon={WrenchIcon} label="Tickets" value={tickets} goal={ticketsGoal} color="text-orange-700 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30" />
          <StatPill icon={ArrowTrendingUpIcon} label="QI" value={qi} color="text-gray-700 dark:text-gray-400 bg-gray-200 dark:bg-gray-700/30" />
        </div>
        {/* AVS Section */}
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
                  <th className="text-left px-3 py-1 font-semibold text-blue-700 dark:text-blue-400">Sold</th>
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
                      <td className="px-3 py-1 text-gray-900 dark:text-gray-100">{a.sold}</td>
                      <td className="px-3 py-1 text-gray-900 dark:text-gray-100">{formatCurrency(a.gm)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {/* Insurance Agreements Section */}
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
        {/* Precalibrated TVs Section */}
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
        {/* Repair Tickets Section */}
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
      </div>
  );
}