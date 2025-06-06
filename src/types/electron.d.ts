interface ElectronAPI {
  // Window control methods
  minimize: () => void;
  maximize: () => void;
  close: () => void;
  
  // Event listeners
  on: (channel: string, callback: (...args: any[]) => void) => () => void;
  
  // Clipboard methods
  writeText: (text: string) => Promise<boolean>;
  readText: () => Promise<string>;
  writeImage: (imageData: string) => Promise<boolean>;
  readImage: () => Promise<string | null>;
  
  // Store operations
  getStoreValue: (key: string) => Promise<any>;
  setStoreValue: (key: string, value: any) => Promise<boolean>;
  
  // PDF generation
  generatePDF: (data: any) => Promise<{ success: boolean; path?: string; error?: string }>;
  
  // Changelog
  getChangelog: () => Promise<string>;
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {}; 