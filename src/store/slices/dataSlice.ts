import { db } from '../../services/db';
import type { ReportStateCreator, DataSlice } from '../types';

export const createDataSlice: ReportStateCreator<DataSlice> = (set, get) => ({
  avsAssignments: [],
  insuranceAgreements: [],
  precalibratedTVs: [],
  repairTickets: [],
  qualityInspections: [],
  services: [],
  people: [],
  goals: [],
  loadServices: async () => {
    try {
      const data = await db.getServices();
      if (data) {
        set({ services: data });
        return;
      }

      const response = await fetch('./data/services.json');
      if (response.ok) {
        const services = await response.json();
        await db.setServices(services);
        set({ services });
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

      const response = await fetch('./data/people.json');
      if (response.ok) {
        const people = await response.json();
        await db.setPeople(people);
        set({ people });
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

      const response = await fetch('./data/goals.json');
      if (response.ok) {
        const goals = await response.json();
        await db.setGoals(goals);
        set({ goals });
      }
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  },
  loadAllData: async () => {
    const currentWeek = get().selectedWeek;
    if (!currentWeek) {
      return;
    }

    try {
      const [avsAssignments, insuranceAgreements, precalibratedTVs, repairTickets, qualityInspections] = await Promise.all([
        db.getAVSAssignments(currentWeek),
        db.getInsuranceAgreements(currentWeek),
        db.getPrecalibratedTVs(currentWeek),
        db.getRepairTickets(currentWeek),
        db.getQualityInspections(currentWeek),
      ]);

      set({
        avsAssignments: avsAssignments ?? [],
        insuranceAgreements: insuranceAgreements ?? [],
        precalibratedTVs: precalibratedTVs ?? [],
        repairTickets: repairTickets ?? [],
        qualityInspections: qualityInspections ?? [],
      });
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  },
  setAVSAssignment: async (assignment) => {
    const updated = [...get().avsAssignments, assignment];
    set({ avsAssignments: updated });
    await db.setAVSAssignments(updated, get().selectedWeek);
  },
  editAVSAssignment: async (index, assignment) => {
    const updated = get().avsAssignments.map((existing, i) => (i === index ? assignment : existing));
    set({ avsAssignments: updated });
    await db.setAVSAssignments(updated, get().selectedWeek);
  },
  setAVSAssignments: async (assignments) => {
    set({ avsAssignments: assignments });
    await db.setAVSAssignments(assignments, get().selectedWeek);
  },
  setInsuranceAgreement: async (sale) => {
    const updated = [...get().insuranceAgreements, sale];
    set({ insuranceAgreements: updated });
    await db.setInsuranceAgreements(updated, get().selectedWeek);
  },
  editInsuranceAgreement: async (index, sale) => {
    const updated = get().insuranceAgreements.map((existing, i) => (i === index ? sale : existing));
    set({ insuranceAgreements: updated });
    await db.setInsuranceAgreements(updated, get().selectedWeek);
  },
  setInsuranceAgreements: async (agreements) => {
    set({ insuranceAgreements: agreements });
    await db.setInsuranceAgreements(agreements, get().selectedWeek);
  },
  setPrecalibratedTV: async (completion) => {
    const updated = [...get().precalibratedTVs, completion];
    set({ precalibratedTVs: updated });
    await db.setPrecalibratedTVs(updated, get().selectedWeek);
  },
  editPrecalibratedTV: async (index, completion) => {
    const updated = get().precalibratedTVs.map((existing, i) => (i === index ? completion : existing));
    set({ precalibratedTVs: updated });
    await db.setPrecalibratedTVs(updated, get().selectedWeek);
  },
  setPrecalibratedTVs: async (tvs) => {
    set({ precalibratedTVs: tvs });
    await db.setPrecalibratedTVs(tvs, get().selectedWeek);
  },
  setRepairTicket: async (ticket) => {
    const updated = [...get().repairTickets, ticket];
    set({ repairTickets: updated });
    await db.setRepairTickets(updated, get().selectedWeek);
  },
  editRepairTicket: async (index, ticket) => {
    const updated = get().repairTickets.map((existing, i) => (i === index ? ticket : existing));
    set({ repairTickets: updated });
    await db.setRepairTickets(updated, get().selectedWeek);
  },
  setRepairTickets: async (tickets) => {
    set({ repairTickets: tickets });
    await db.setRepairTickets(tickets, get().selectedWeek);
  },
  setQualityInspection: async (day, count) => {
    const filtered = get().qualityInspections.filter((inspection) => inspection.day !== day);
    const updated = [...filtered, { day, count }];
    set({ qualityInspections: updated });
    await db.setQualityInspections(updated, get().selectedWeek);
  },
});
