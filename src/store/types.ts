import type { StateCreator } from 'zustand';
import type { Day } from '../types';

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

export type WeekDates = Record<Day, string> & { Sunday?: string };

export interface DisplaySettings {
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
}

export interface ThemeSettings {
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  animationSpeed: 'slow' | 'normal' | 'fast';
  accentColors: {
    avs: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
    insurance: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
    precalibrated: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
    repair: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
    summary: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
  };
}

export interface DataSettings {
  autoSave: boolean;
  autoSaveInterval: number;
  dataRetention: number;
  defaultValues: {
    serviceSold: number;
    repairTickets: number;
    precalibratedTVs: number;
    insuranceAgreements: number;
  };
}

export interface ReportSettingsConfig {
  defaultFormat: 'png' | 'pdf' | 'csv';
  defaultQuality: 'low' | 'medium' | 'high';
  defaultSize: 'small' | 'medium' | 'large';
  autoExport: boolean;
  autoExportOnSave: boolean;
  titles: {
    dayReport: string;
    weekReport: string;
  };
}

export interface NotificationSettings {
  enabled: boolean;
  sound: boolean;
  duration: number;
  goalsAchievement: boolean;
}

export interface BackupSettings {
  autoBackup: boolean;
  backupFrequency: number;
  retentionPeriod: number;
  encryptBackups: boolean;
}

export interface ReportSettings {
  display: DisplaySettings;
  theme: ThemeSettings;
  data: DataSettings;
  report: ReportSettingsConfig;
  notifications: NotificationSettings;
  backup: BackupSettings;
  showAllWeeks: boolean;
}

export interface UiSlice {
  selectedDay: Day;
  selectedWeek: string;
  availableWeeks: string[];
  weekDates: WeekDates;
  setSelectedDay: (day: Day) => void;
  setSelectedWeek: (week: string) => Promise<void>;
  setWeekDates: (dates: WeekDates) => Promise<void>;
  loadWeekDates: () => Promise<void>;
  loadAvailableWeeks: () => Promise<void>;
}

export interface DataSlice {
  avsAssignments: AVSAssignment[];
  insuranceAgreements: InsuranceAgreementSale[];
  precalibratedTVs: PrecalibratedTVCompletion[];
  repairTickets: RepairTicket[];
  qualityInspections: QualityInspection[];
  services: Service[];
  people: Person[];
  goals: Goal[];
  loadServices: () => Promise<void>;
  loadPeople: () => Promise<void>;
  loadGoals: () => Promise<void>;
  loadAllData: () => Promise<void>;
  setAVSAssignment: (assignment: AVSAssignment) => Promise<void>;
  editAVSAssignment: (index: number, assignment: AVSAssignment) => Promise<void>;
  setAVSAssignments: (assignments: AVSAssignment[]) => Promise<void>;
  setInsuranceAgreement: (sale: InsuranceAgreementSale) => Promise<void>;
  editInsuranceAgreement: (index: number, sale: InsuranceAgreementSale) => Promise<void>;
  setInsuranceAgreements: (agreements: InsuranceAgreementSale[]) => Promise<void>;
  setPrecalibratedTV: (completion: PrecalibratedTVCompletion) => Promise<void>;
  editPrecalibratedTV: (index: number, completion: PrecalibratedTVCompletion) => Promise<void>;
  setPrecalibratedTVs: (tvs: PrecalibratedTVCompletion[]) => Promise<void>;
  setRepairTicket: (ticket: RepairTicket) => Promise<void>;
  editRepairTicket: (index: number, ticket: RepairTicket) => Promise<void>;
  setRepairTickets: (tickets: RepairTicket[]) => Promise<void>;
  setQualityInspection: (day: Day, count: number) => Promise<void>;
}

export interface SettingsSlice {
  settings: ReportSettings;
  loadSettings: () => Promise<void>;
  updateSettings: (settings: Partial<ReportSettings>) => Promise<void>;
}

export interface BudgetSlice {
  budgetYears: Record<string, BudgetYear>;
  selectedBudgetYear: string;
  loadBudgetYears: () => Promise<void>;
  setBudgetYear: (yearKey: string, data: BudgetYear) => Promise<void>;
  setSelectedBudgetYear: (year: string) => Promise<void>;
  loadBudgetYearData: (yearKey: string) => Promise<void>;
  deleteBudgetYear: (yearKey: string) => Promise<void>;
}

export interface ExportSlice {
  exportData: () => Promise<void>;
  importData: (file: File) => Promise<void>;
  exportUserData: () => Promise<void>;
  importUserData: (file: File) => Promise<void>;
}

export type ReportState = UiSlice & DataSlice & SettingsSlice & BudgetSlice & ExportSlice;

export type ReportStateCreator<T> = StateCreator<ReportState, [], [], T>;
