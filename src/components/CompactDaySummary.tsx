import { Day } from '../types';
import useReportStore from '../store';
import { useDisplaySettings } from '../contexts/DisplaySettingsContext';
import { formatCurrency } from '../utils/format';
import { AVSAssignment, InsuranceAgreementSale, PrecalibratedTVCompletion, RepairTicket } from '../store';

interface DaySummaryProps {
  day: Day;
}

function AnimatedNumber({ value, className = "" }: { value: number, className?: string }) {
  return (
    <span className={`font-mono ${className}`}>
      {value.toLocaleString()}
    </span>
  );
}

export default function CompactDaySummary({ day }: DaySummaryProps) {
  const { avsAssignments, insuranceAgreements, precalibratedTVs, repairTickets, qualityInspections } = useReportStore();
  const { settings: displaySettings } = useDisplaySettings();

  // Calculate totals
  const totalAVS = avsAssignments
    .filter((a: AVSAssignment) => a.day === day)
    .reduce((sum: number, a: AVSAssignment) => sum + a.sold, 0);

  const totalInsurance = insuranceAgreements
    .filter((a: InsuranceAgreementSale) => a.day === day)
    .reduce((sum: number, a: InsuranceAgreementSale) => sum + a.sold, 0);

  const totalTVs = precalibratedTVs
    .filter((t: PrecalibratedTVCompletion) => t.day === day)
    .reduce((sum: number, t: PrecalibratedTVCompletion) => sum + t.completed, 0);

  const totalTickets = repairTickets
    .filter((t: RepairTicket) => t.day === day)
    .reduce((sum: number, t: RepairTicket) => sum + t.completed, 0);

  const totalGM = avsAssignments
    .filter((a: AVSAssignment) => a.day === day)
    .reduce((sum: number, a: AVSAssignment) => sum + a.gm, 0);

  const qiCount = qualityInspections.find(qi => qi.day === day)?.count || 0;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
      <div className="grid grid-cols-6 gap-4">
        {displaySettings.showSections.avs && (
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">AVS</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              <AnimatedNumber value={totalAVS} />
            </div>
          </div>
        )}
        {displaySettings.showSections.insurance && (
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Insurance</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              <AnimatedNumber value={totalInsurance} />
            </div>
          </div>
        )}
        {displaySettings.showSections.precalibrated && (
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">TVs</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              <AnimatedNumber value={totalTVs} />
            </div>
          </div>
        )}
        {displaySettings.showSections.repair && (
          <div className="text-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">Tickets</div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              <AnimatedNumber value={totalTickets} />
            </div>
          </div>
        )}
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">GM</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            <AnimatedNumber value={totalGM} className="text-elkjop-green" />
          </div>
        </div>
        <div className="text-center">
          <div className="text-sm text-gray-500 dark:text-gray-400">QI</div>
          <div className="text-lg font-semibold text-gray-900 dark:text-white">
            <AnimatedNumber value={qiCount} />
          </div>
        </div>
      </div>
    </div>
  );
} 