import { RefObject } from 'react';
import { Day } from '../types';
import DayReportCard from './DayReportCard';
import WeekReportCard from './WeekReportCard';

interface HiddenReportsProps {
  dayReportRef: RefObject<HTMLDivElement | null>;
  weekReportRef: RefObject<HTMLDivElement | null>;
  selectedDay: Day;
}

export default function HiddenReports({ dayReportRef, weekReportRef, selectedDay }: HiddenReportsProps) {
  return (
    <div style={{ position: 'absolute', left: '-9999px', top: 0 }}>
      <div className="max-w-lg" style={{margin: '0 auto'}}>
        <div ref={dayReportRef}>
          <DayReportCard day={selectedDay} />
        </div>
      </div>
      <div className="max-w-7xl" style={{margin: '0 auto'}}>
        <div ref={weekReportRef}>
          <WeekReportCard />
        </div>
      </div>
    </div>
  );
} 