import React, { useEffect, useState } from 'react';
import useReportStore from '../store';
import { formatCurrency } from '../utils/format';
import { Day } from '../types';
import { FaUser, FaCheckCircle, FaTools, FaClipboardList, FaShieldAlt, FaTv, FaChartBar } from 'react-icons/fa';

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
  const avsAssignments = useReportStore((s) => s.avsAssignments);
  const insuranceAgreements = useReportStore((s) => s.insuranceAgreements);
  const precalibratedTVs = useReportStore((s) => s.precalibratedTVs);
  const repairTickets = useReportStore((s) => s.repairTickets);
  const qualityInspections = useReportStore((s) => s.qualityInspections);

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

  // State for loaded data
  const [goalsData, setGoalsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [goalsRes] = await Promise.all([
          fetch('/goals.json'),
        ]);
        if (!goalsRes.ok) throw new Error('Failed to fetch data');
        setGoalsData(await goalsRes.json());
        setLoading(false);
      } catch (e) {
        setError('Could not load data from public/.');
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Weekly goals (Saturday goal)
  const taGoal = goalsData.find(g => g.section === 'Insurance Agreements')?.goals[5] || 0;
  const tvGoal = goalsData.find(g => g.section === 'Precalibrated TVs')?.goals[5] || 0;
  const ticketsGoal = goalsData.find(g => g.section === 'RepairTickets')?.goals[5] || 0;
  const gmGoal = goalsData.find(g => g.section === 'AVS')?.goals[5] || 0;

  if (loading) return <div className="text-gray-700 dark:text-gray-300">Loading weekly data...</div>;
  if (error) return <div className="text-red-600 dark:text-red-400">{error}</div>;

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
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-xl">
            <FaChartBar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Weekly Summary</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Overview of all metrics and performance</p>
          </div>
        </div>
        <div className="h-12 w-auto">
          <img src="/elkjop_logo.png" alt="Elkjøp Logo" className="h-full w-auto" />
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard color="#059669" icon={<FaCheckCircle />} label="GM" value={totalGM} goal={gmGoal} isCurrency />
        <StatCard color="#2563eb" icon={<FaTools />} label="AVS" value={totalAVS} />
        <StatCard color="#059669" icon={<FaShieldAlt />} label="TA" value={totalTA} goal={taGoal} />
        <StatCard color="#a21caf" icon={<FaTv />} label="TV" value={totalTV} goal={tvGoal} />
        <StatCard color="#ea580c" icon={<FaUser />} label="Tickets" value={totalTickets} goal={ticketsGoal} />
        <StatCard color="#64748b" icon={<FaClipboardList />} label="QI" value={totalQI} />
        <StatCard color="#7c3aed" icon={<FaUser />} label="People" value={people.size} />
      </div>

      {/* Main Grid: Per-day and Per-person breakdowns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="bg-blue-50 dark:bg-blue-900/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-blue-700 dark:text-blue-400">Daily Breakdown</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Day</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">GM</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">AVS</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">TA</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">TV</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Tickets</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">QI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {perDay.map(row => (
                  <tr key={row.day} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{row.day}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{formatCurrency(row.gm)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{row.avs}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{row.ta}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{row.tv}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{row.tickets}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{row.qi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
          <div className="bg-green-50 dark:bg-green-900/30 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-green-700 dark:text-green-400">Per Person</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700/50">
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Person</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">GM</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">AVS</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">TA</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">TV</th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-600 dark:text-gray-300">Tickets</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {perPerson.map(row => (
                  <tr key={row.person} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{row.person}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{formatCurrency(row.gm)}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{row.avs}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{row.ta}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{row.tv}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{row.tickets}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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