interface ElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  getStoreValue: (key: string) => Promise<any>;
  setStoreValue: (key: string, value: any) => Promise<boolean>;
  clipboardWriteText: (text: string) => Promise<boolean>;
  clipboardReadText: () => Promise<string>;
  clipboardWriteImage: (imageData: string) => Promise<boolean>;
  clipboardReadImage: () => Promise<string | null>;
  generatePDF: (data: {
    selectedDay: string;
    selectedWeek: string;
    avsAssignments: any[];
    insuranceAgreements: any[];
    precalibratedTVs: any[];
    repairTickets: any[];
    goalsData: any[];
    prevWeekData: [any[], any[], any[], any[]];
  }) => Promise<{ success: boolean; path?: string; error?: string }>;
  getChangelog: () => Promise<string>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
} 