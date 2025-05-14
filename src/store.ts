import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Day } from './types';
import { db } from './services/db';

export interface Service {
  id: string;
  name: string;
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
  setSelectedDay: (day: Day) => void;
  avsAssignments: AVSAssignment[];
  setAVSAssignment: (assignment: AVSAssignment) => void;
  editAVSAssignment: (index: number, assignment: AVSAssignment) => void;
  services: Service[];
  people: Person[];
  goals: Goal[];
  loadServices: () => Promise<void>;
  loadPeople: () => Promise<void>;
  loadGoals: () => Promise<void>;
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
    (set) => ({
      selectedDay: 'Monday',
      setSelectedDay: (day) => set({ selectedDay: day }),
      avsAssignments: [],
      setAVSAssignment: (assignment) => set((state) => ({
        avsAssignments: [...state.avsAssignments, assignment]
      })),
      editAVSAssignment: (index, assignment) => set((state) => ({
        avsAssignments: state.avsAssignments.map((a, i) => i === index ? assignment : a)
      })),
      services: [],
      people: [],
      goals: [],
      loadServices: async () => {
        try {
          console.log('Loading services data...');
          // Try to load from IndexedDB first
          const data = await db.getServices();
          if (data) {
            console.log('Loaded services from IndexedDB:', data);
            set({ services: data });
            return;
          }

          // If no data in IndexedDB, initialize it
          await initializeIndexedDB();
          // Try loading again
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
          // Try to load from IndexedDB first
          const data = await db.getPeople();
          if (data) {
            console.log('Loaded people from IndexedDB:', data);
            set({ people: data });
            return;
          }

          // If no data in IndexedDB, initialize it
          await initializeIndexedDB();
          // Try loading again
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
          // Try to load from IndexedDB first
          const data = await db.getGoals();
          if (data) {
            console.log('Loaded goals from IndexedDB:', data);
            set({ goals: data });
            return;
          }

          // If no data in IndexedDB, initialize it
          await initializeIndexedDB();
          // Try loading again
          const newData = await db.getGoals();
          if (newData) {
            console.log('Loaded goals after initialization:', newData);
            set({ goals: newData });
          }
        } catch (error) {
          console.error('Failed to load goals:', error);
        }
      },
      insuranceAgreements: [],
      setInsuranceAgreement: (sale) => set((state) => ({
        insuranceAgreements: [...state.insuranceAgreements, sale]
      })),
      editInsuranceAgreement: (index, sale) => set((state) => ({
        insuranceAgreements: state.insuranceAgreements.map((s, i) => i === index ? sale : s)
      })),
      precalibratedTVs: [],
      setPrecalibratedTV: (completion) => set((state) => ({
        precalibratedTVs: [...state.precalibratedTVs, completion]
      })),
      editPrecalibratedTV: (index, completion) => set((state) => ({
        precalibratedTVs: state.precalibratedTVs.map((p, i) => i === index ? completion : p)
      })),
      repairTickets: [],
      setRepairTicket: (ticket) => set((state) => ({
        repairTickets: [...state.repairTickets, ticket]
      })),
      editRepairTicket: (index, ticket) => set((state) => ({
        repairTickets: state.repairTickets.map((t, i) => i === index ? ticket : t)
      })),
      qualityInspections: [],
      setQualityInspection: (day, count) => set((state) => {
        const filtered = state.qualityInspections.filter(qi => qi.day !== day);
        return { qualityInspections: [...filtered, { day, count }] };
      }),
    }),
    {
      name: 'elkjop-report-store',
      partialize: (state) => ({
        selectedDay: state.selectedDay,
        avsAssignments: state.avsAssignments,
        insuranceAgreements: state.insuranceAgreements,
        precalibratedTVs: state.precalibratedTVs,
        repairTickets: state.repairTickets,
        qualityInspections: state.qualityInspections,
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

export default useReportStore; 