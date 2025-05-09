import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Day } from './types';
import servicesData from '../public/services.json';

export interface Service {
  id: string;
  name: string;
  price: number;
  cost: number;
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
      services: servicesData,
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
        services: state.services,
        qualityInspections: state.qualityInspections,
      }),
    }
  )
);

export default useReportStore; 