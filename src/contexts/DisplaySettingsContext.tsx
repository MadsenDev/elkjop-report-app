import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import useReportStore from '../store';

interface DisplaySettings {
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

interface DisplaySettingsContextType {
  settings: DisplaySettings;
  updateSettings: (settings: Partial<DisplaySettings>) => void;
}

const DisplaySettingsContext = createContext<DisplaySettingsContextType | undefined>(undefined);

export function DisplaySettingsProvider({ children }: { children: ReactNode }) {
  const storeSettings = useReportStore(state => state.settings);
  const updateStoreSettings = useReportStore(state => state.updateSettings);

  const [settings, setSettings] = useState<DisplaySettings>(() => {
    return storeSettings?.display || {
      compactView: false,
      showSections: {
        avs: true,
        insurance: true,
        precalibrated: true,
        repair: true
      },
      defaultDay: 'current',
      numberFormat: {
        currencyDecimals: 2,
        numberDecimals: 0
      }
    };
  });

  const updateSettings = useCallback((newSettings: Partial<DisplaySettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      updateStoreSettings({ display: updated });
      return updated;
    });
  }, [updateStoreSettings]);

  return (
    <DisplaySettingsContext.Provider value={{ settings, updateSettings }}>
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