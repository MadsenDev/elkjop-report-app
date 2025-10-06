import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createUiSlice } from './slices/uiSlice';
import { createDataSlice } from './slices/dataSlice';
import { createSettingsSlice } from './slices/settingsSlice';
import { createBudgetSlice } from './slices/budgetSlice';
import { createExportSlice } from './slices/exportSlice';
import type { ReportState } from './types';

const useReportStore = create<ReportState>()(
  persist(
    (...args) => ({
      ...createUiSlice(...args),
      ...createDataSlice(...args),
      ...createSettingsSlice(...args),
      ...createBudgetSlice(...args),
      ...createExportSlice(...args),
    }),
    {
      name: 'elkjop-report-store',
      partialize: (state) => ({
        selectedDay: state.selectedDay,
        selectedWeek: state.selectedWeek,
        selectedBudgetYear: state.selectedBudgetYear,
        weekDates: state.weekDates,
        settings: state.settings,
        budgetYears: state.budgetYears,
      }),
      onRehydrateStorage: () => async (state) => {
        if (!state) {
          return;
        }

        try {
          await state.loadSettings();
          await Promise.all([
            state.loadServices(),
            state.loadPeople(),
            state.loadGoals(),
            state.loadWeekDates(),
            state.loadAvailableWeeks(),
            state.loadBudgetYears(),
          ]);

          if (!state.selectedBudgetYear) {
            const now = new Date();
            const year = now.getMonth() + 1 < 5 ? now.getFullYear() - 1 : now.getFullYear();
            const yearKey = `${year}/${year + 1}`;
            await state.setSelectedBudgetYear(yearKey);
          }
        } catch (error) {
          console.error('Failed to initialize store:', error);
        }
      },
    }
  )
);

export const loadServices = async () => useReportStore.getState().loadServices();
export const loadPeople = async () => useReportStore.getState().loadPeople();
export const loadGoals = async () => useReportStore.getState().loadGoals();
export const loadWeekDates = async () => useReportStore.getState().loadWeekDates();
export const loadAvailableWeeks = async () => useReportStore.getState().loadAvailableWeeks();
export const loadAllData = async () => useReportStore.getState().loadAllData();
export const loadSettings = async () => useReportStore.getState().loadSettings();

export * from './types';
export { getDefaultSettings } from './defaults';
export default useReportStore;
