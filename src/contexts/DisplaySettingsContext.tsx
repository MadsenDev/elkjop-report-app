import { createContext, useContext, useMemo, useCallback, ReactNode } from 'react';
import useReportStore, { DisplaySettings, getDefaultSettings } from '../store';

interface DisplaySettingsContextType {
  settings: DisplaySettings;
  updateSettings: (settings: Partial<DisplaySettings>) => Promise<void>;
}

const DisplaySettingsContext = createContext<DisplaySettingsContextType | undefined>(undefined);
const defaultDisplaySettings = getDefaultSettings().display;

export function DisplaySettingsProvider({ children }: { children: ReactNode }) {
  const displaySettings = useReportStore((state) => state.settings.display);
  const updateStoreSettings = useReportStore((state) => state.updateSettings);

  const updateSettings = useCallback(
    (settings: Partial<DisplaySettings>) => updateStoreSettings({ display: settings }),
    [updateStoreSettings],
  );

  const value = useMemo(
    () => ({
      settings: displaySettings ?? defaultDisplaySettings,
      updateSettings,
    }),
    [displaySettings, updateSettings],
  );

  return (
    <DisplaySettingsContext.Provider value={value}>
      {children}
    </DisplaySettingsContext.Provider>
  );
}

export function useDisplaySettings() {
  const context = useContext(DisplaySettingsContext);
  if (context === undefined) {
    throw new Error('useDisplaySettings must be used within a DisplaySettingsProvider');
  }
  return context;
}
