export interface ElectronAPI {
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  on: (channel: string, callback: (...args: any[]) => void) => () => void;
  
  // Store operations
  getStoreValue: (key: string) => Promise<any>;
  setStoreValue: (key: string, value: any) => Promise<boolean>;
  
  // Clipboard operations
  writeText: (text: string) => Promise<boolean>;
  readText: () => Promise<string>;
  writeImage: (imageData: string) => Promise<boolean>;
  readImage: () => Promise<string | null>;
  clipboardWriteText: (text: string) => Promise<boolean>;
  clipboardReadText: () => Promise<string>;
  clipboardWriteImage: (imageData: string) => Promise<boolean>;
  clipboardReadImage: () => Promise<string | null>;
  
  // PDF generation
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
  
  // Changelog
  getChangelog: () => Promise<string>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {}; 