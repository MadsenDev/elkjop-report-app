import { useCallback, useState } from 'react';
import useReportStore from '../store';
import { db } from '../services/db';
import type { WeekDates } from '../store';

const emptyWeekDates: WeekDates = {
  Monday: '',
  Tuesday: '',
  Wednesday: '',
  Thursday: '',
  Friday: '',
  Saturday: '',
};

export function useWeekReset() {
  const [isResetting, setIsResetting] = useState(false);

  const resetWeek = useCallback(async () => {
    const selectedWeek = useReportStore.getState().selectedWeek;
    if (!selectedWeek) {
      return false;
    }

    setIsResetting(true);

    try {
      await Promise.all([
        db.setAVSAssignments([], selectedWeek),
        db.setInsuranceAgreements([], selectedWeek),
        db.setPrecalibratedTVs([], selectedWeek),
        db.setRepairTickets([], selectedWeek),
        db.setQualityInspections([], selectedWeek),
        db.setWeekDates(emptyWeekDates, selectedWeek),
      ]);

      useReportStore.setState({
        avsAssignments: [],
        insuranceAgreements: [],
        precalibratedTVs: [],
        repairTickets: [],
        qualityInspections: [],
        weekDates: emptyWeekDates,
      });

      await new Promise((resolve) => setTimeout(resolve, 3000));
      setIsResetting(false);
      return true;
    } catch (error) {
      setIsResetting(false);
      throw error;
    }
  }, []);

  return { isResetting, resetWeek };
}
