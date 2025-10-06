import { db } from '../../services/db';
import type { ReportStateCreator, UiSlice, WeekDates } from '../types';

const emptyWeekDates: WeekDates = {
  Monday: '',
  Tuesday: '',
  Wednesday: '',
  Thursday: '',
  Friday: '',
  Saturday: '',
  Sunday: '',
};

export const createUiSlice: ReportStateCreator<UiSlice> = (set, get) => ({
  selectedDay: 'Monday',
  selectedWeek: '',
  availableWeeks: [],
  weekDates: emptyWeekDates,
  setSelectedDay: (day) => set({ selectedDay: day }),
  setSelectedWeek: async (week) => {
    if (!week) {
      set({ selectedWeek: '' });
      return;
    }

    if (week.includes('/')) {
      set({ selectedWeek: week });
    } else {
      const [year, weekNum] = week.split('-');
      const budgetYear = Number.parseInt(year, 10);
      const formattedWeek = `${budgetYear}/${budgetYear + 1}-${weekNum}`;
      set({ selectedWeek: formattedWeek });
    }

    await get().loadAllData();
  },
  setWeekDates: async (dates) => {
    set({ weekDates: dates });
    await db.setWeekDates(dates, get().selectedWeek);
  },
  loadWeekDates: async () => {
    try {
      const data = await db.getWeekDates();
      if (data) {
        set({ weekDates: { ...emptyWeekDates, ...data } });
      }
    } catch (error) {
      console.error('Failed to load week dates:', error);
    }
  },
  loadAvailableWeeks: async () => {
    try {
      const weeks = await db.getAvailableWeeks();
      set({ availableWeeks: weeks });

      if (!get().selectedWeek && weeks.length > 0) {
        const currentWeek = weeks[weeks.length - 1];
        set({ selectedWeek: currentWeek });
        await get().loadAllData();
      }
    } catch (error) {
      console.error('Failed to load available weeks:', error);
    }
  },
});
