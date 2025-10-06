import { db } from '../../services/db';
import type { BudgetSlice, ReportStateCreator } from '../types';

export const createBudgetSlice: ReportStateCreator<BudgetSlice> = (set, get) => ({
  budgetYears: {},
  selectedBudgetYear: '',
  loadBudgetYears: async () => {
    try {
      const years = await db.getAllBudgetYears();
      set({ budgetYears: years });
    } catch (error) {
      console.error('Failed to load budget years:', error);
    }
  },
  setBudgetYear: async (yearKey, data) => {
    try {
      await db.setBudgetYear(yearKey, data);
      set((state) => ({
        budgetYears: {
          ...state.budgetYears,
          [yearKey]: data,
        },
      }));
    } catch (error) {
      console.error('Failed to set budget year:', error);
      throw error;
    }
  },
  setSelectedBudgetYear: async (year) => {
    set({ selectedBudgetYear: year });
    await get().loadBudgetYearData(year);
  },
  loadBudgetYearData: async (yearKey) => {
    try {
      const data = await db.getBudgetYearData(yearKey);
      const firstWeekKey = Object.keys(data.weekDates)[0];
      const weekDates = firstWeekKey ? data.weekDates[firstWeekKey] : {
        Monday: '',
        Tuesday: '',
        Wednesday: '',
        Thursday: '',
        Friday: '',
        Saturday: '',
      };

      set({
        avsAssignments: data.avsAssignments,
        insuranceAgreements: data.insuranceAgreements,
        precalibratedTVs: data.precalibratedTVs,
        repairTickets: data.repairTickets,
        qualityInspections: data.qualityInspections,
        weekDates,
      });
    } catch (error) {
      console.error('Failed to load budget year data:', error);
    }
  },
  deleteBudgetYear: async (yearKey) => {
    try {
      await db.deleteBudgetYear(yearKey);
      set((state) => {
        const { [yearKey]: _deleted, ...remaining } = state.budgetYears;
        return { budgetYears: remaining };
      });

      const state = get();
      if (state.selectedBudgetYear === yearKey) {
        const remainingYears = Object.keys(state.budgetYears).filter((key) => key !== yearKey);
        if (remainingYears.length > 0) {
          await state.setSelectedBudgetYear(remainingYears[0]);
        } else {
          set({ selectedBudgetYear: '' });
        }
      }
    } catch (error) {
      console.error('Failed to delete budget year:', error);
      throw error;
    }
  },
});
