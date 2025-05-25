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
}

// Add initialization function
const initializeIndexedDB = async () => {
  try {
    console.log('Initializing IndexedDB with JSON data...');
    
    // Load services
    const servicesResponse = await fetch('./data/services.json');
    if (servicesResponse.ok) {
      const servicesData = await servicesResponse.json();
      await db.setServices(servicesData);
      console.log('Services data initialized in IndexedDB');
    }

    // Load people
    const peopleResponse = await fetch('./data/people.json');
    if (peopleResponse.ok) {
      const peopleData = await peopleResponse.json();
      await db.setPeople(peopleData);
      console.log('People data initialized in IndexedDB');
    }

    // Load goals
    const goalsResponse = await fetch('./data/goals.json');
    if (goalsResponse.ok) {
      const goalsData = await goalsResponse.json();
      await db.setGoals(goalsData);
      console.log('Goals data initialized in IndexedDB');
    }

    console.log('IndexedDB initialization complete');
  } catch (error) {
    console.error('Failed to initialize IndexedDB:', error);
  }
};

const useReportStore = create<ReportState>()(
    persist(
      (set, get) => ({
        selectedDay: 'Monday',
      selectedWeek: '',  // Will be set to current week on load
        setSelectedDay: (day) => set({ selectedDay: day }),
      setSelectedWeek: async (week) => {
        set({ selectedWeek: week });
        // Reload all data for the selected week
        await get().loadAllData();
      },
      avsAssignments: [],
      setAVSAssignment: async (assignment) => {
        const newAssignments = [...get().avsAssignments, assignment];
        set({ avsAssignments: newAssignments });
        await db.setAVSAssignments(newAssignments);
      },
      editAVSAssignment: async (index, assignment) => {
        const newAssignments = get().avsAssignments.map((a, i) => i === index ? assignment : a);
        set({ avsAssignments: newAssignments });
        await db.setAVSAssignments(newAssignments);
      },
        services: [],
        people: [],
      goals: [],
      weekDates: {
        Monday: '',
        Tuesday: '',
        Wednesday: '',
        Thursday: '',
        Friday: '',
        Saturday: '',
        Sunday: ''
      },
      setWeekDates: async (dates) => {
        set({ weekDates: dates });
        await db.setWeekDates(dates);
      },
        loadServices: async () => {
        try {
          console.log('Loading services data...');
          const data = await db.getServices();
          if (data) {
            console.log('Loaded services from IndexedDB:', data);
            set({ services: data });
            return;
          }
          await initializeIndexedDB();
          const newData = await db.getServices();
          if (newData) {
            console.log('Loaded services after initialization:', newData);
            set({ services: newData });
          }
        } catch (error) {
          console.error('Failed to load services:', error);
        }
        },
        loadPeople: async () => {
        try {
          console.log('Loading people data...');
          const data = await db.getPeople();
          if (data) {
            console.log('Loaded people from IndexedDB:', data);
            set({ people: data });
            return;
          }
          await initializeIndexedDB();
          const newData = await db.getPeople();
          if (newData) {
            console.log('Loaded people after initialization:', newData);
            set({ people: newData });
          }
        } catch (error) {
          console.error('Failed to load people:', error);
        }
        },
        loadGoals: async () => {
        try {
          console.log('Loading goals data...');
          const data = await db.getGoals();
          if (data) {
            console.log('Loaded goals from IndexedDB:', data);
            set({ goals: data });
            return;
          }
          await initializeIndexedDB();
          const newData = await db.getGoals();
          if (newData) {
            console.log('Loaded goals after initialization:', newData);
            set({ goals: newData });
          }
        } catch (error) {
          console.error('Failed to load goals:', error);
        }
      },
      loadWeekDates: async () => {
        try {
          console.log('Loading week dates...');
          const data = await db.getWeekDates();
          if (data) {
            console.log('Loaded week dates from IndexedDB:', data);
            set({ weekDates: data });
          }
        } catch (error) {
          console.error('Failed to load week dates:', error);
        }
      },
      loadAllData: async () => {
        try {
          console.log('Loading all data for week:', get().selectedWeek);
          const [
            avsAssignments,
            insuranceAgreements,
            precalibratedTVs,
            repairTickets,
            qualityInspections
          ] = await Promise.all([
            db.getAVSAssignments(get().selectedWeek),
            db.getInsuranceAgreements(get().selectedWeek),
            db.getPrecalibratedTVs(get().selectedWeek),
            db.getRepairTickets(get().selectedWeek),
            db.getQualityInspections(get().selectedWeek)
          ]);

          set({
            avsAssignments: avsAssignments || [],
            insuranceAgreements: insuranceAgreements || [],
            precalibratedTVs: precalibratedTVs || [],
            repairTickets: repairTickets || [],
            qualityInspections: qualityInspections || []
          });
        } catch (error) {
          console.error('Failed to load all data:', error);
        }
      },
      insuranceAgreements: [],
      setInsuranceAgreement: async (sale) => {
        const newAgreements = [...get().insuranceAgreements, sale];
        set({ insuranceAgreements: newAgreements });
        await db.setInsuranceAgreements(newAgreements);
      },
      editInsuranceAgreement: async (index, sale) => {
        const newAgreements = get().insuranceAgreements.map((s, i) => i === index ? sale : s);
        set({ insuranceAgreements: newAgreements });
        await db.setInsuranceAgreements(newAgreements);
      },
      precalibratedTVs: [],
      setPrecalibratedTV: async (completion) => {
        const newTVs = [...get().precalibratedTVs, completion];
        set({ precalibratedTVs: newTVs });
        await db.setPrecalibratedTVs(newTVs);
      },
      editPrecalibratedTV: async (index, completion) => {
        const newTVs = get().precalibratedTVs.map((p, i) => i === index ? completion : p);
        set({ precalibratedTVs: newTVs });
        await db.setPrecalibratedTVs(newTVs);
      },
      repairTickets: [],
      setRepairTicket: async (ticket) => {
        const newTickets = [...get().repairTickets, ticket];
        set({ repairTickets: newTickets });
        await db.setRepairTickets(newTickets);
      },
      editRepairTicket: async (index, ticket) => {
        const newTickets = get().repairTickets.map((t, i) => i === index ? ticket : t);
        set({ repairTickets: newTickets });
        await db.setRepairTickets(newTickets);
      },
      qualityInspections: [],
      setQualityInspection: async (day, count) => {
        const filtered = get().qualityInspections.filter(qi => qi.day !== day);
        const newInspections = [...filtered, { day, count }];
        set({ qualityInspections: newInspections });
        await db.setQualityInspections(newInspections, get().selectedWeek);
      },
      availableWeeks: [],
      loadAvailableWeeks: async () => {
        try {
          const weeks = await db.getAvailableWeeks();
          set({ availableWeeks: weeks });
          // If no week is selected, select the most recent one
          if (!get().selectedWeek && weeks.length > 0) {
            set({ selectedWeek: weeks[0] });
            // Initialize data for the current week if it doesn't exist
            const currentWeek = weeks[0];
            await Promise.all([
              db.setWeekDates({
                Monday: '',
                Tuesday: '',
                Wednesday: '',
                Thursday: '',
                Friday: '',
                Saturday: ''
              }, currentWeek),
              db.setAVSAssignments([], currentWeek),
              db.setInsuranceAgreements([], currentWeek),
              db.setPrecalibratedTVs([], currentWeek),
              db.setRepairTickets([], currentWeek),
              db.setQualityInspections([], currentWeek)
            ]);
          }
        } catch (error) {
          console.error('Failed to load available weeks:', error);
        }
      },
      settings: {
        display: {
          compactView: false,
          showSections: {
            avs: true,
            insurance: true,
            precalibrated: true,
            repair: true
          },
          defaultDay: 'current' as const,
          numberFormat: {
            currencyDecimals: 2,
            numberDecimals: 0
          }
        },
        theme: {
          fontSize: 'medium' as const,
          animationSpeed: 'normal' as const,
          accentColors: {
            avs: 'blue' as const,
            insurance: 'green' as const,
            precalibrated: 'purple' as const,
            repair: 'orange' as const,
            summary: 'indigo' as const
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
          defaultFormat: 'png' as const,
          defaultQuality: 'high' as const,
          defaultSize: 'medium' as const,
          autoExport: false,
          autoExportOnSave: false
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
      },
      loadSettings: async () => {
        try {
          const settings = await db.getSettings();
          set({ settings });
        } catch (error) {
          console.error('Failed to load settings:', error);
        }
      },
      updateSettings: async (newSettings) => {
        try {
          const currentSettings = get().settings;
          const updatedSettings = { ...currentSettings, ...newSettings };
          await db.setSettings(updatedSettings);
          set({ settings: updatedSettings });
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
      }),
      {
        name: 'elkjop-report-store',
      partialize: (state) => ({
        selectedDay: state.selectedDay,
        selectedWeek: state.selectedWeek,
        weekDates: state.weekDates,
        settings: state.settings
      }),
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

export const loadAllData = async () => {
  const store = useReportStore.getState();
  return store.loadAllData();
};

export const loadAvailableWeeks = async () => {
  const store = useReportStore.getState();
  return store.loadAvailableWeeks();
};

export const loadSettings = async () => {
  const store = useReportStore.getState();
  return store.loadSettings();
};

export default useReportStore;