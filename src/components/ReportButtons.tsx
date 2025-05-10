import { CalendarIcon, ChartBarIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { PDFDownloadLink, pdf } from '@react-pdf/renderer';
import PDFReport from './PDFReport';
import useReportStore from '../store';
import { useState, useEffect } from 'react';
import { Day } from '../types';

interface ReportButtonsProps {
  onDayReport: () => void;
  onWeekReport: () => void;
  selectedDay: Day;
}

export default function ReportButtons({ onDayReport, onWeekReport, selectedDay }: ReportButtonsProps) {
  const avsAssignments = useReportStore((state) => state.avsAssignments);
  const insuranceAgreements = useReportStore((state) => state.insuranceAgreements);
  const precalibratedTVs = useReportStore((state) => state.precalibratedTVs);
  const repairTickets = useReportStore((state) => state.repairTickets);
  const qualityInspections = useReportStore((state) => state.qualityInspections);
  const [goalsData, setGoalsData] = useState<any[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/goals.json');
        if (!res.ok) throw new Error('Failed to fetch goals');
        setGoalsData(await res.json());
      } catch (e) {
        console.error('Could not load goals:', e);
      }
    }
    fetchData();
  }, []);

  const handlePDFClick = async () => {
    setIsGenerating(true);
    try {
      const blob = await pdf(
        <PDFReport
          selectedDay={selectedDay}
          avsAssignments={avsAssignments}
          insuranceAgreements={insuranceAgreements}
          precalibratedTVs={precalibratedTVs}
          repairTickets={repairTickets}
          qualityInspections={qualityInspections}
          goalsData={goalsData}
        />
      ).toBlob();
      
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `weekly_report_${selectedDay.toLowerCase()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error generating PDF:', error);
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
        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-elkjop-green rounded-lg hover:bg-elkjop-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-elkjop-green dark:focus:ring-offset-gray-800"
      >
        <DocumentArrowDownIcon className="h-5 w-5" />
        {isGenerating ? 'Generating PDF...' : 'Export PDF'}
      </button>
    </div>
  );
} 