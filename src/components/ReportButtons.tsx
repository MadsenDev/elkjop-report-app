import { CalendarIcon, ChartBarIcon } from '@heroicons/react/24/outline';

interface ReportButtonsProps {
  onDayReport: () => void;
  onWeekReport: () => void;
}

export default function ReportButtons({ onDayReport, onWeekReport }: ReportButtonsProps) {
  return (
    <div className="flex items-center gap-4">
      <button
        onClick={onDayReport}
        className="flex items-center gap-2 px-4 py-2 bg-elkjop-green text-white rounded-lg hover:bg-elkjop-green/90 transition-colors"
      >
        <CalendarIcon className="h-5 w-5" />
        Day Report
      </button>
      <button
        onClick={onWeekReport}
        className="flex items-center gap-2 px-4 py-2 bg-elkjop-green text-white rounded-lg hover:bg-elkjop-green/90 transition-colors"
      >
        <ChartBarIcon className="h-5 w-5" />
        Week Report
      </button>
    </div>
  );
} 