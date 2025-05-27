import React from 'react';
import useReportStore from '../store';
import { formatCurrency } from '../utils/format';
import { Day } from '../types';
import { FaUser, FaCheckCircle, FaTools, FaClipboardList, FaShieldAlt, FaTv, FaChartBar } from 'react-icons/fa';
import { useDisplaySettings } from "../contexts/DisplaySettingsContext";
import {
  CurrencyDollarIcon,
  WrenchScrewdriverIcon,
  ShieldCheckIcon,
  TvIcon,
  WrenchIcon,
  ArrowTrendingUpIcon,
} from '@heroicons/react/24/outline';

const days: Day[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function StatCard({ color, icon, label, value, goal, isCurrency }: { color: string; icon: React.ReactNode; label: string; value: number; goal?: number; isCurrency?: boolean }) {
  return (
    <div style={{
      background: color + '22',
      color,
      borderRadius: 12,
      padding: '12px 18px',
      minWidth: 80,
      display: 'flex',
      alignItems: 'center',
      gap: 10,
      fontWeight: 700,
      fontSize: 17,
      boxShadow: '0 1px 4px #0001',
    }}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span>{label}:</span>
      <span style={{ color: '#1e293b', fontWeight: 800 }}>
        {isCurrency ? value.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }) : value}
        {goal !== undefined && goal > 0 && (
          <span style={{ color: color, fontWeight: 600, marginLeft: 4, fontSize: 15 }}>
            {' / '}
            {isCurrency ? goal.toLocaleString('nb-NO', { style: 'currency', currency: 'NOK', maximumFractionDigits: 0 }) : goal}
          </span>
        )}
      </span>
    </div>
  );
}

export default function WeekReportCard() {
  const { avsAssignments, insuranceAgreements, precalibratedTVs, repairTickets, goals, settings, selectedWeek } = useReportStore();
  const qualityInspections = useReportStore((state) => state.qualityInspections);
  const { settings: displaySettings } = useDisplaySettings();

  // Cumulative stats for the week
  const totalGM = avsAssignments.reduce((sum, a) => sum + (a.gm || 0), 0);
  const totalAVS = avsAssignments.reduce((sum, a) => sum + (a.sold || 0), 0);
  const totalTA = insuranceAgreements.reduce((sum, t) => sum + (t.sold || 0), 0);
  const totalTV = precalibratedTVs.reduce((sum, p) => sum + (p.completed || 0), 0);
  const totalTickets = repairTickets.reduce((sum, r) => sum + (r.completed || 0), 0);
  const totalQI = qualityInspections.find(qi => qi.day === 'Saturday')?.count || 0;
  const people = new Set([
    ...avsAssignments.map((a) => a.person),
    ...insuranceAgreements.map((t) => t.person),
    ...precalibratedTVs.map((p) => p.person),
    ...repairTickets.map((r) => r.person),
  ]);

  // Per-day breakdowns
  const perDay = days.map((day) => {
    const gm = avsAssignments.filter(a => a.day === day).reduce((sum, a) => sum + (a.gm || 0), 0);
    const avs = avsAssignments.filter(a => a.day === day).reduce((sum, a) => sum + (a.sold || 0), 0);
    const ta = insuranceAgreements.filter(t => t.day === day).reduce((sum, t) => sum + (t.sold || 0), 0);
    const tv = precalibratedTVs.filter(p => p.day === day).reduce((sum, p) => sum + (p.completed || 0), 0);
    const tickets = repairTickets.filter(r => r.day === day).reduce((sum, r) => sum + (r.completed || 0), 0);
    const qi = qualityInspections.find(qi => qi.day === day)?.count || 0;
    return { day, gm, avs, ta, tv, tickets, qi };
  });

  // Weekly goals (Saturday goal)
  const taGoal = goals.find(g => g.section === 'Insurance Agreements')?.goals[5] || 0;
  const tvGoal = goals.find(g => g.section === 'Precalibrated TVs')?.goals[5] || 0;
  const ticketsGoal = goals.find(g => g.section === 'RepairTickets')?.goals[5] || 0;
  const gmGoal = goals.find(g => g.section === 'AVS')?.goals[5] || 0;

  // Per-person breakdown
  const peopleList = Array.from(people).sort();
  const perPerson = peopleList.map(person => {
    const gm = avsAssignments.filter(a => a.person === person).reduce((sum, a) => sum + (a.gm || 0), 0);
    const avs = avsAssignments.filter(a => a.person === person).reduce((sum, a) => sum + (a.sold || 0), 0);
    const ta = insuranceAgreements.filter(t => t.person === person).reduce((sum, t) => sum + (t.sold || 0), 0);
    const tv = precalibratedTVs.filter(p => p.person === person).reduce((sum, p) => sum + (p.completed || 0), 0);
    const tickets = repairTickets.filter(r => r.person === person).reduce((sum, r) => sum + (r.completed || 0), 0);
    return { person, gm, avs, ta, tv, tickets };
  });

  // Section totals
  const avsSection = avsAssignments.reduce((acc, a) => {
    acc[a.serviceId] = (acc[a.serviceId] || 0) + (a.sold || 0);
    return acc;
  }, {} as Record<string, number>);
  const taSection = insuranceAgreements.reduce((acc, t) => {
    acc[t.person] = (acc[t.person] || 0) + (t.sold || 0);
    return acc;
  }, {} as Record<string, number>);
  const tvSection = precalibratedTVs.reduce((acc, p) => {
    acc[p.person] = (acc[p.person] || 0) + (p.completed || 0);
    return acc;
  }, {} as Record<string, number>);
  const ticketsSection = repairTickets.reduce((acc, r) => {
    acc[r.person] = (acc[r.person] || 0) + (r.completed || 0);
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-elkjop-green/10 to-blue-500/10">
            <svg className="w-5 h-5 text-elkjop-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Week {selectedWeek}
          </h2>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
        <StatCard color="#059669" icon={<FaCheckCircle />} label="GM" value={totalGM} goal={gmGoal} isCurrency />
        {displaySettings.showSections.avs && (
          <StatCard color="#2563eb" icon={<FaTools />} label="AVS" value={totalAVS} />
        )}
        {displaySettings.showSections.insurance && (
          <StatCard color="#059669" icon={<FaShieldAlt />} label="TA" value={totalTA} goal={taGoal} />
        )}
        {displaySettings.showSections.precalibrated && (
          <StatCard color="#a21caf" icon={<FaTv />} label="TV" value={totalTV} goal={tvGoal} />
        )}
        {displaySettings.showSections.repair && (
          <StatCard color="#ea580c" icon={<FaUser />} label="Tickets" value={totalTickets} goal={ticketsGoal} />
        )}
        <StatCard color="#64748b" icon={<FaClipboardList />} label="QI" value={totalQI} />
      </div>

      {/* Per-Day Breakdown */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Per-Day Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/30">
                <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white">Day</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white">GM</th>
                {displaySettings.showSections.avs && (
                  <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white">AVS</th>
                )}
                {displaySettings.showSections.insurance && (
                  <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white">TA</th>
                )}
                {displaySettings.showSections.precalibrated && (
                  <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white">TV</th>
                )}
                {displaySettings.showSections.repair && (
                  <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white">Tickets</th>
                )}
                <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white">QI</th>
              </tr>
            </thead>
            <tbody>
              {perDay.map((day, i) => (
                <tr key={i} className="bg-white/50 dark:bg-gray-800/50">
                  <td className="px-3 py-2 text-gray-900 dark:text-white">{day.day}</td>
                  <td className="px-3 py-2 text-gray-900 dark:text-white">{formatCurrency(day.gm)}</td>
                  {displaySettings.showSections.avs && (
                    <td className="px-3 py-2 text-gray-900 dark:text-white">{day.avs}</td>
                  )}
                  {displaySettings.showSections.insurance && (
                    <td className="px-3 py-2 text-gray-900 dark:text-white">{day.ta}</td>
                  )}
                  {displaySettings.showSections.precalibrated && (
                    <td className="px-3 py-2 text-gray-900 dark:text-white">{day.tv}</td>
                  )}
                  {displaySettings.showSections.repair && (
                    <td className="px-3 py-2 text-gray-900 dark:text-white">{day.tickets}</td>
                  )}
                  <td className="px-3 py-2 text-gray-900 dark:text-white">{day.qi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Per-Person Breakdown */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Per-Person Breakdown</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-700/30">
                <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white">Person</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white">GM</th>
                {displaySettings.showSections.avs && (
                  <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white">AVS</th>
                )}
                {displaySettings.showSections.insurance && (
                  <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white">TA</th>
                )}
                {displaySettings.showSections.precalibrated && (
                  <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white">TV</th>
                )}
                {displaySettings.showSections.repair && (
                  <th className="px-3 py-2 text-left font-semibold text-gray-900 dark:text-white">Tickets</th>
                )}
              </tr>
            </thead>
            <tbody>
              {perPerson.map((person, i) => (
                <tr key={i} className="bg-white/50 dark:bg-gray-800/50">
                  <td className="px-3 py-2 text-gray-900 dark:text-white">{person.person}</td>
                  <td className="px-3 py-2 text-gray-900 dark:text-white">{formatCurrency(person.gm)}</td>
                  {displaySettings.showSections.avs && (
                    <td className="px-3 py-2 text-gray-900 dark:text-white">{person.avs}</td>
                  )}
                  {displaySettings.showSections.insurance && (
                    <td className="px-3 py-2 text-gray-900 dark:text-white">{person.ta}</td>
                  )}
                  {displaySettings.showSections.precalibrated && (
                    <td className="px-3 py-2 text-gray-900 dark:text-white">{person.tv}</td>
                  )}
                  {displaySettings.showSections.repair && (
                    <td className="px-3 py-2 text-gray-900 dark:text-white">{person.tickets}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section Totals: 2x2 grid of colored cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="bg-blue-50 dark:bg-blue-900/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">AVS by Service</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Service</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {Object.entries(avsSection).map(([service, sold]) => (
                  <tr key={service} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{service}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{sold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="bg-green-50 dark:bg-green-900/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">Insurance Agreements by Person</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Person</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Sold</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {Object.entries(taSection).map(([person, sold]) => (
                  <tr key={person} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{person}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{sold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="bg-purple-50 dark:bg-purple-900/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-purple-700 dark:text-purple-400">Precalibrated TVs by Person</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Person</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {Object.entries(tvSection).map(([person, completed]) => (
                  <tr key={person} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{person}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="bg-orange-50 dark:bg-orange-900/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-orange-700 dark:text-orange-400">Repair Tickets by Person</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Person</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Completed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {Object.entries(ticketsSection).map(([person, completed]) => (
                  <tr key={person} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{person}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{completed}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 