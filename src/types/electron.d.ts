interface ElectronAPI {
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
}

declare global {
  interface Window {
    electron: ElectronAPI;
  }
}

export {}; 