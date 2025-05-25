import { CalendarIcon, ChartBarIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import { pdf } from '@react-pdf/renderer';
import PDFReport from './PDFReport';
import useReportStore from '../store';
import { useState } from 'react';
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
  const goalsData = useReportStore((state) => state.goals);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePDFClick = async () => {
    setIsGenerating(true);
    setError(null);
    
    try {
      console.log('Starting PDF generation with data:', {
        selectedDay,
        avsAssignments,
        insuranceAgreements,
        precalibratedTVs,
        repairTickets,
        goalsData
      });

      const pdfDoc = (
        <PDFReport
          selectedDay={selectedDay}
          avsAssignments={avsAssignments}
          insuranceAgreements={insuranceAgreements}
          precalibratedTVs={precalibratedTVs}
          repairTickets={repairTickets}
          goalsData={goalsData}
        />
      );

      console.log('Created PDF document component');

      const blob = await pdf(pdfDoc).toBlob();
      console.log('Generated PDF blob:', blob);

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      const filename = `weekly_report_${selectedDay.toLowerCase()}.pdf`;
      link.setAttribute('download', filename);
      console.log('Downloading PDF as:', filename);
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      console.log('PDF download initiated successfully');
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