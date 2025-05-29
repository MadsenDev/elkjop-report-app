import { CalendarIcon, ChartBarIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import useReportStore from '../store';
import { useState } from 'react';
import { Day } from '../types';
import { db } from '../services/db';

interface ReportButtonsProps {
  onDayReport: () => void;
  onWeekReport: () => void;
  selectedDay: Day;
}

interface StoreState {
  avsAssignments: any[];
  insuranceAgreements: any[];
  precalibratedTVs: any[];
  repairTickets: any[];
  goals: any[];
  selectedWeek: string;
}

export default function ReportButtons({ onDayReport, onWeekReport, selectedDay }: ReportButtonsProps) {
  const avsAssignments = useReportStore((state: StoreState) => state.avsAssignments);
  const insuranceAgreements = useReportStore((state: StoreState) => state.insuranceAgreements);
  const precalibratedTVs = useReportStore((state: StoreState) => state.precalibratedTVs);
  const repairTickets = useReportStore((state: StoreState) => state.repairTickets);
  const goalsData = useReportStore((state: StoreState) => state.goals);
  const selectedWeek = useReportStore((state: StoreState) => state.selectedWeek);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePDFClick = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      // Calculate previous week
      const [year, weekNumber] = selectedWeek.split('-').map(Number);
      const getPreviousWeek = (year: number, week: number) => {
        if (week === 1) {
          return { year: year - 1, week: 52 };
        }
        return { year, week: week - 1 };
      };
      
      const prevWeek = getPreviousWeek(year, weekNumber);
      const prevWeekKey = `${prevWeek.year}-${String(prevWeek.week).padStart(2, '0')}`;
      
      // Fetch previous week's data
      const [prevAVS, prevInsurance, prevPrecalibrated, prevRepair] = await Promise.all([
        db.getAVSAssignments(prevWeekKey),
        db.getInsuranceAgreements(prevWeekKey),
        db.getPrecalibratedTVs(prevWeekKey),
        db.getRepairTickets(prevWeekKey)
      ]);

      const result = await window.electron.generatePDF({
        selectedDay,
        selectedWeek,
        avsAssignments,
        insuranceAgreements,
        precalibratedTVs,
        repairTickets,
        goalsData,
        prevWeekData: [prevAVS || [], prevInsurance || [], prevPrecalibrated || [], prevRepair || []]
      });

      if (!result.success) {
        throw new Error(result.error || 'Failed to generate PDF');
      }

      // Show success message or open the PDF
      console.log('PDF generated successfully at:', result.path);
    } catch (error) {
      console.error('Error generating PDF:', error);
      setError(error instanceof Error ? error.message : 'Failed to generate PDF');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onDayReport}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-elkjop-green rounded-lg hover:bg-elkjop-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-elkjop-green dark:focus:ring-offset-gray-800"
      >
        <CalendarIcon className="h-5 w-5" />
        Day Report
      </button>
      <button
        onClick={onWeekReport}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-elkjop-green rounded-lg hover:bg-elkjop-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-elkjop-green dark:focus:ring-offset-gray-800"
      >
        <ChartBarIcon className="h-5 w-5" />
        Week Report
      </button>
      <button
        onClick={handlePDFClick}
        disabled={isGenerating}
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-elkjop-green rounded-lg hover:bg-elkjop-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-elkjop-green dark:focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <DocumentArrowDownIcon className="h-5 w-5" />
        {isGenerating ? 'Generating PDF...' : 'Export PDF'}
      </button>
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
} 