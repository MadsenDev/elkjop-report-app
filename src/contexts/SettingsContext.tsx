import { createContext, useContext, ReactNode } from 'react';
import useReportStore, { ReportState } from '../store';

interface SettingsContextType {
  settings: ReportState['settings'];
  updateSettings: ReportState['updateSettings'];
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const settings = useReportStore(state => state.settings);
  const updateSettings = useReportStore(state => state.updateSettings);

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
} 