import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Day } from './types';
import { db } from './services/db';

export interface Service {
  id: string;
  price: number;
  cost: number;
}

export interface Person {
  code: string;
  firstName: string;
  lastName: string;
}

export interface Goal {
  section: string;
  goals: number[];
}

export interface AVSAssignment {
  day: Day;
  person: string;
  serviceId: string;
  sold: number;
  price: number;
  gm: number;
}

export interface SectionResult {
  day: Day;
  value: number;
  details?: string[];
}

export interface InsuranceAgreementSale {
  day: Day;
  person: string;
  sold: number;
}

export interface PrecalibratedTVCompletion {
  day: Day;
  person: string;
  completed: number;
}

export interface RepairTicket {
  day: Day;
  person: string;
  completed: number;
}

export interface QualityInspection {
  day: Day;
  count: number;
}

export interface BudgetYear {
  startDate: string;
  endDate: string;
  previousYearGM: {
    avs: number;
    ta: number;
  };
  goals: {
    avs: number;
    insurance: number;
    precalibrated: number;
    repair: number;
  };
}

export interface ReportState {
  selectedDay: Day;
  selectedWeek: string;  // Format: "YYYY-WW"
  setSelectedDay: (day: Day) => void;
  setSelectedWeek: (week: string) => void;
  avsAssignments: AVSAssignment[];
  setAVSAssignment: (assignment: AVSAssignment) => void;
  editAVSAssignment: (index: number, assignment: AVSAssignment) => void;
  services: Service[];
  people: Person[];
  goals: Goal[];
  weekDates: { [key in Day]: string };
  setWeekDates: (dates: { [key in Day]: string }) => void;
  loadServices: () => Promise<void>;
  loadPeople: () => Promise<void>;
  loadGoals: () => Promise<void>;
  loadWeekDates: () => Promise<void>;
  loadAllData: () => Promise<void>;
  availableWeeks: string[];
  loadAvailableWeeks: () => Promise<void>;
  insuranceAgreements: InsuranceAgreementSale[];
  setInsuranceAgreement: (sale: InsuranceAgreementSale) => void;
  editInsuranceAgreement: (index: number, sale: InsuranceAgreementSale) => void;
  precalibratedTVs: PrecalibratedTVCompletion[];
  setPrecalibratedTV: (completion: PrecalibratedTVCompletion) => void;
  editPrecalibratedTV: (index: number, completion: PrecalibratedTVCompletion) => void;
  repairTickets: RepairTicket[];
  setRepairTicket: (ticket: RepairTicket) => void;
  editRepairTicket: (index: number, ticket: RepairTicket) => void;
  qualityInspections: QualityInspection[];
  setQualityInspection: (day: Day, count: number) => void;
  settings: {
    display: {
      compactView: boolean;
      showSections: {
        avs: boolean;
        insurance: boolean;
        precalibrated: boolean;
        repair: boolean;
      };
      defaultDay: 'current' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
      numberFormat: {
        currencyDecimals: number;
        numberDecimals: number;
      };
    };
    theme: {
      fontSize: 'small' | 'medium' | 'large';
      animationSpeed: 'slow' | 'normal' | 'fast';
      accentColors: {
        avs: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
        insurance: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
        precalibrated: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
        repair: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
        summary: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
      };
    };
    data: {
      autoSave: boolean;
      autoSaveInterval: number;
      dataRetention: number;
      defaultValues: {
        serviceSold: number;
        repairTickets: number;
        precalibratedTVs: number;
        insuranceAgreements: number;
      };
    };
    report: {
      defaultFormat: 'png' | 'pdf' | 'csv';
      defaultQuality: 'low' | 'medium' | 'high';
      defaultSize: 'small' | 'medium' | 'large';
      autoExport: boolean;
      autoExportOnSave: boolean;
      titles: {
        dayReport: string;
        weekReport: string;
      };
    };
    notifications: {
      enabled: boolean;
      sound: boolean;
      duration: number;
      goalsAchievement: boolean;
    };
    backup: {
      autoBackup: boolean;
      backupFrequency: number;
      retentionPeriod: number;
      encryptBackups: boolean;
    };
    showAllWeeks: boolean;
  };
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<ReportState['settings']>) => Promise<void>;
  exportData: () => Promise<void>;
  importData: (file: File) => Promise<void>;
  exportUserData: () => Promise<void>;
  importUserData: (file: File) => Promise<void>;
  budgetYears: Record<string, BudgetYear>;
  currentBudgetYear: string;
  loadBudgetYears: () => Promise<void>;
  setBudgetYear: (yearKey: string, data: BudgetYear) => Promise<void>;
  selectedBudgetYear: string;
  setSelectedBudgetYear: (year: string) => Promise<void>;
  loadBudgetYearData: (yearKey: string) => Promise<void>;
  deleteBudgetYear: (yearKey: string) => Promise<void>;
  setPrecalibratedTVs: (tvs: PrecalibratedTVCompletion[]) => void;
  setAVSAssignments: (assignments: AVSAssignment[]) => void;
  setInsuranceAgreements: (agreements: InsuranceAgreementSale[]) => void;
  setRepairTickets: (tickets: RepairTicket[]) => void;
}

// Create the store
const useReportStore = create<ReportState>()(
  persist(
    (set, get) => ({
      selectedDay: 'Monday' as Day,
      selectedWeek: '',  // Will be set to current week on load
      setSelectedDay: (day: Day) => set({ selectedDay: day }),
      setSelectedWeek: async (week: string) => {
        // If the week is already in the correct format (YYYY/YYYY+1-WW), use it directly
        if (week.includes('/')) {
          set({ selectedWeek: week });
        } else {
          // Convert week key format from "YYYY-WW" to "YYYY/YYYY+1-WW"
          const [year, weekNum] = week.split('-');
          const budgetYear = parseInt(year);
          const formattedWeek = `${budgetYear}/${budgetYear + 1}-${weekNum}`;
          set({ selectedWeek: formattedWeek });
        }
        // Reload all data for the selected week
        await get().loadAllData();
      },
      avsAssignments: [] as AVSAssignment[],
      insuranceAgreements: [] as InsuranceAgreementSale[],
      precalibratedTVs: [] as PrecalibratedTVCompletion[],
      repairTickets: [] as RepairTicket[],
      qualityInspections: [] as QualityInspection[],
      services: [] as Service[],
      people: [] as Person[],
      goals: [] as Goal[],
      weekDates: {
        Monday: '',
        Tuesday: '',
        Wednesday: '',
        Thursday: '',
        Friday: '',
        Saturday: '',
        Sunday: ''
      },
      availableWeeks: [] as string[],
      settings: getDefaultSettings(),
      budgetYears: {},
      currentBudgetYear: '',
      selectedBudgetYear: '',
      setAVSAssignment: async (assignment: AVSAssignment) => {
        const newAssignments = [...get().avsAssignments, assignment];
        set({ avsAssignments: newAssignments });
        await db.setAVSAssignments(newAssignments, get().selectedWeek);
      },
      editAVSAssignment: async (index: number, assignment: AVSAssignment) => {
        const newAssignments = get().avsAssignments.map((a, i) => i === index ? assignment : a);
        set({ avsAssignments: newAssignments });
        await db.setAVSAssignments(newAssignments, get().selectedWeek);
      },
      setWeekDates: async (dates: { [key in Day]: string }) => {
        set({ weekDates: dates });
        await db.setWeekDates(dates, get().selectedWeek);
      },
      loadServices: async () => {
        try {
          const data = await db.getServices();
          if (data) {
            set({ services: data });
            return;
          }
          // Load from JSON if not in IndexedDB
          const servicesResponse = await fetch('./data/services.json');
          if (servicesResponse.ok) {
            const servicesData = await servicesResponse.json();
            await db.setServices(servicesData);
            set({ services: servicesData });
          }
        } catch (error) {
          console.error('Failed to load services:', error);
        }
      },
      loadPeople: async () => {
        try {
          const data = await db.getPeople();
          if (data) {
            set({ people: data });
            return;
          }
          // Load from JSON if not in IndexedDB
          const peopleResponse = await fetch('./data/people.json');
          if (peopleResponse.ok) {
            const peopleData = await peopleResponse.json();
            await db.setPeople(peopleData);
            set({ people: peopleData });
          }
        } catch (error) {
          console.error('Failed to load people:', error);
        }
      },
      loadGoals: async () => {
        try {
          const data = await db.getGoals();
          if (data) {
            set({ goals: data });
            return;
          }
          // Load from JSON if not in IndexedDB
          const goalsResponse = await fetch('./data/goals.json');
          if (goalsResponse.ok) {
            const goalsData = await goalsResponse.json();
            await db.setGoals(goalsData);
            set({ goals: goalsData });
          }
        } catch (error) {
          console.error('Failed to load goals:', error);
        }
      },
      loadWeekDates: async () => {
        try {
          const data = await db.getWeekDates();
          if (data) {
            set({ weekDates: data });
          }
        } catch (error) {
          console.error('Failed to load week dates:', error);
        }
      },
      loadAllData: async () => {
        const currentWeek = get().selectedWeek;
        if (!currentWeek) return;

        try {
          const [
            avsAssignments,
            insuranceAgreements,
            precalibratedTVs,
            repairTickets,
            qualityInspections
          ] = await Promise.all([
            db.getAVSAssignments(currentWeek),
            db.getInsuranceAgreements(currentWeek),
            db.getPrecalibratedTVs(currentWeek),
            db.getRepairTickets(currentWeek),
            db.getQualityInspections(currentWeek)
          ]);

          set({
            avsAssignments: avsAssignments || [],
            insuranceAgreements: insuranceAgreements || [],
            precalibratedTVs: precalibratedTVs || [],
            repairTickets: repairTickets || [],
            qualityInspections: qualityInspections || []
          });
        } catch (error) {
          console.error('Failed to load data:', error);
        }
      },
      loadAvailableWeeks: async () => {
        try {
          const weeks = await db.getAvailableWeeks();
          set({ availableWeeks: weeks });

          // If no week is selected, select the most recent week
          if (!get().selectedWeek && weeks.length > 0) {
            const currentWeek = weeks[weeks.length - 1];
            set({ selectedWeek: currentWeek });
            await get().loadAllData();
          }
        } catch (error) {
          console.error('Failed to load available weeks:', error);
        }
      },
      loadSettings: async () => {
        try {
          const loaded = await db.getSettings();
          const defaultSettings = getDefaultSettings();
          
          // If no settings exist, initialize with defaults
          if (!loaded) {
            await db.setSettings(defaultSettings);
            set({ settings: defaultSettings });
            return;
          }
          
          // Deep merge loaded settings with defaults
          const merged = deepMergeSettings(defaultSettings, loaded);
          
          // Always save the merged version to ensure consistency
          await db.setSettings(merged);
          
          // Update the store with merged settings
          set({ settings: merged });
        } catch (error) {
          console.error('Failed to load settings:', error);
          // If loading fails, use default settings
          const defaultSettings = getDefaultSettings();
          await db.setSettings(defaultSettings);
          set({ settings: defaultSettings });
        }
      },
      setInsuranceAgreement: async (sale: InsuranceAgreementSale) => {
        const newAgreements = [...get().insuranceAgreements, sale];
        set({ insuranceAgreements: newAgreements });
        await db.setInsuranceAgreements(newAgreements, get().selectedWeek);
      },
      editInsuranceAgreement: async (index: number, sale: InsuranceAgreementSale) => {
        const newAgreements = get().insuranceAgreements.map((s, i) => i === index ? sale : s);
        set({ insuranceAgreements: newAgreements });
        await db.setInsuranceAgreements(newAgreements, get().selectedWeek);
      },
      setPrecalibratedTV: async (completion: PrecalibratedTVCompletion) => {
        const newTVs = [...get().precalibratedTVs, completion];
        set({ precalibratedTVs: newTVs });
        await db.setPrecalibratedTVs(newTVs, get().selectedWeek);
      },
      editPrecalibratedTV: async (index: number, completion: PrecalibratedTVCompletion) => {
        const newTVs = get().precalibratedTVs.map((p, i) => i === index ? completion : p);
        set({ precalibratedTVs: newTVs });
        await db.setPrecalibratedTVs(newTVs, get().selectedWeek);
      },
      setRepairTicket: async (ticket: RepairTicket) => {
        const newTickets = [...get().repairTickets, ticket];
        set({ repairTickets: newTickets });
        await db.setRepairTickets(newTickets, get().selectedWeek);
      },
      editRepairTicket: async (index: number, ticket: RepairTicket) => {
        const newTickets = get().repairTickets.map((t, i) => i === index ? ticket : t);
        set({ repairTickets: newTickets });
        await db.setRepairTickets(newTickets, get().selectedWeek);
      },
      setQualityInspection: async (day: Day, count: number) => {
        const filtered = get().qualityInspections.filter(qi => qi.day !== day);
        const newInspections = [...filtered, { day, count }];
        set({ qualityInspections: newInspections });
        await db.setQualityInspections(newInspections, get().selectedWeek);
      },
      updateSettings: async (newSettings: Partial<ReportState['settings']>) => {
        try {
          const currentSettings = get().settings;
          const defaultSettings = getDefaultSettings();
          
          // Deep merge: default <- current <- new
          const merged = deepMergeSettings(defaultSettings, deepMergeSettings(currentSettings, newSettings));
          
          // Only save if there are actual changes
          if (JSON.stringify(merged) !== JSON.stringify(currentSettings)) {
            await db.setSettings(merged);
            set({ settings: merged });
          }
        } catch (error) {
          console.error('Failed to update settings:', error);
        }
      },
      exportData: async () => {
        const data = await db.exportData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'elkjop-report-config.json';
        a.click();
        URL.revokeObjectURL(url);
      },
      importData: async (file: File) => {
        const text = await file.text();
        const data = JSON.parse(text);
        await db.importData(data);
        await get().loadAllData();
      },
      exportUserData: async () => {
        const data = await db.exportUserData();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'elkjop-report-user-data.json';
        a.click();
        URL.revokeObjectURL(url);
      },
      importUserData: async (file: File) => {
        const text = await file.text();
        const data = JSON.parse(text);
        await db.importUserData(data);
        await get().loadAllData();
      },
      loadBudgetYears: async () => {
        try {
          const years = await db.getAllBudgetYears();
          set({ budgetYears: years });
        } catch (error) {
          console.error('Failed to load budget years:', error);
        }
      },
      setBudgetYear: async (yearKey: string, data: BudgetYear) => {
        try {
          await db.setBudgetYear(yearKey, data);
          set(state => ({
            budgetYears: {
              ...state.budgetYears,
              [yearKey]: data
            }
          }));
        } catch (error) {
          console.error('Failed to set budget year:', error);
          throw error;
        }
      },
      setSelectedBudgetYear: async (year: string) => {
        set({ selectedBudgetYear: year });
        await get().loadBudgetYearData(year);
      },
      loadBudgetYearData: async (yearKey: string) => {
        try {
          const data = await db.getBudgetYearData(yearKey);
          // Get the first week's dates or use default empty dates
          const firstWeekKey = Object.keys(data.weekDates)[0];
          const weekDates = firstWeekKey ? data.weekDates[firstWeekKey] : {
            Monday: '',
            Tuesday: '',
            Wednesday: '',
            Thursday: '',
            Friday: '',
            Saturday: ''
          };
          
          set({
            avsAssignments: data.avsAssignments,
            insuranceAgreements: data.insuranceAgreements,
            precalibratedTVs: data.precalibratedTVs,
            repairTickets: data.repairTickets,
            qualityInspections: data.qualityInspections,
            weekDates
          });
        } catch (error) {
          console.error('Failed to load budget year data:', error);
        }
      },
      deleteBudgetYear: async (yearKey: string) => {
        try {
          await db.deleteBudgetYear(yearKey);
          set(state => {
            const { [yearKey]: _, ...remainingYears } = state.budgetYears;
            return { budgetYears: remainingYears };
          });
          
          // If the deleted year was selected, select another year if available
          const state = get();
          if (state.selectedBudgetYear === yearKey) {
            const remainingYears = Object.keys(state.budgetYears).filter(key => key !== yearKey);
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
      setPrecalibratedTVs: async (tvs: PrecalibratedTVCompletion[]) => {
        set({ precalibratedTVs: tvs });
        await db.setPrecalibratedTVs(tvs, get().selectedWeek);
      },
      setAVSAssignments: async (assignments: AVSAssignment[]) => {
        set({ avsAssignments: assignments });
        await db.setAVSAssignments(assignments, get().selectedWeek);
      },
      setInsuranceAgreements: async (agreements: InsuranceAgreementSale[]) => {
        set({ insuranceAgreements: agreements });
        await db.setInsuranceAgreements(agreements, get().selectedWeek);
      },
      setRepairTickets: async (tickets: RepairTicket[]) => {
        set({ repairTickets: tickets });
        await db.setRepairTickets(tickets, get().selectedWeek);
      },
    }),
    {
      name: 'elkjop-report-store',
      partialize: (state) => ({
        selectedDay: state.selectedDay,
        selectedWeek: state.selectedWeek,
        selectedBudgetYear: state.selectedBudgetYear,
        weekDates: state.weekDates,
        settings: state.settings,
        budgetYears: state.budgetYears
      }),
      onRehydrateStorage: () => async (state) => {
        if (state) {
          try {
            // Initialize settings first
            await state.loadSettings();
            
            // Then initialize other data
            await Promise.all([
              state.loadServices(),
              state.loadPeople(),
              state.loadGoals(),
              state.loadWeekDates(),
              state.loadAvailableWeeks(),
              state.loadBudgetYears()
            ]);

            // Set initial budget year if not set
            if (!state.selectedBudgetYear) {
              const currentYear = new Date().getFullYear();
              const month = new Date().getMonth() + 1;
              const budgetYear = month < 5 ? currentYear - 1 : currentYear;
              const yearKey = `${budgetYear}/${budgetYear + 1}`;
              await state.setSelectedBudgetYear(yearKey);
            }
          } catch (error) {
            console.error('Failed to initialize store:', error);
          }
        }
      }
    }
  )
);

// Export the load functions
export const loadServices = async () => {
  const store = useReportStore.getState();
  return store.loadServices();
};

export const loadPeople = async () => {
  const store = useReportStore.getState();
  return store.loadPeople();
};

export const loadGoals = async () => {
  const store = useReportStore.getState();
  return store.loadGoals();
};

export const loadWeekDates = async () => {
  const store = useReportStore.getState();
  return store.loadWeekDates();
};

export const loadAvailableWeeks = async () => {
  const store = useReportStore.getState();
  return store.loadAvailableWeeks();
};

export const loadAllData = async () => {
  const store = useReportStore.getState();
  return store.loadAllData();
};

export const loadSettings = async () => {
  const store = useReportStore.getState();
  return store.loadSettings();
};

export default useReportStore;

// Deep merge settings helper
function deepMergeSettings<T extends Record<string, any>>(target: T, source: Partial<T>): T {
  const output = { ...target } as T;
  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      const sourceValue = source[key as keyof typeof source];
      const targetValue = target[key as keyof T];
      
      if (sourceValue !== undefined) {
        if (isObject(sourceValue) && isObject(targetValue)) {
          output[key as keyof T] = deepMergeSettings(targetValue, sourceValue);
        } else {
          Object.assign(output, { [key]: sourceValue });
        }
      }
    });
  }
  return output;
}

// Helper to check if value is an object
function isObject(item: any): item is Record<string, any> {
  return item && typeof item === 'object' && !Array.isArray(item);
}

// Returns the full default settings object
function getDefaultSettings() {
  return {
    display: {
      compactView: false,
      showSections: {
        avs: true,
        insurance: true,
        precalibrated: true,
        repair: true
      },
      defaultDay: 'current' as 'current' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday',
      numberFormat: {
        currencyDecimals: 2,
        numberDecimals: 0
      }
    },
    theme: {
      fontSize: 'medium' as 'small' | 'medium' | 'large',
      animationSpeed: 'normal' as 'slow' | 'normal' | 'fast',
      accentColors: {
        avs: 'blue' as 'blue' | 'green' | 'purple' | 'orange' | 'indigo',
        insurance: 'green' as 'blue' | 'green' | 'purple' | 'orange' | 'indigo',
        precalibrated: 'purple' as 'blue' | 'green' | 'purple' | 'orange' | 'indigo',
        repair: 'orange' as 'blue' | 'green' | 'purple' | 'orange' | 'indigo',
        summary: 'indigo' as 'blue' | 'green' | 'purple' | 'orange' | 'indigo'
      }
    },
    data: {
      autoSave: true,
      autoSaveInterval: 5,
      dataRetention: 30,
      defaultValues: {
        serviceSold: 1,
        repairTickets: 1,
        precalibratedTVs: 1,
        insuranceAgreements: 1
      }
    },
    report: {
      defaultFormat: 'png' as 'png' | 'pdf' | 'csv',
      defaultQuality: 'high' as 'low' | 'medium' | 'high',
      defaultSize: 'medium' as 'small' | 'medium' | 'large',
      autoExport: false,
      autoExportOnSave: false,
      titles: {
        dayReport: 'ASO Daily Report {day}',
        weekReport: 'ASO Weekly Report {week}'
      }
    },
    notifications: {
      enabled: true,
      sound: true,
      duration: 3000,
      goalsAchievement: true
    },
    backup: {
      autoBackup: true,
      backupFrequency: 24,
      retentionPeriod: 30,
      encryptBackups: true
    },
    showAllWeeks: false
  };
}