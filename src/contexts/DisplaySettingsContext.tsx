import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

const defaultSettings: DisplaySettings = {
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

interface DisplaySettingsContextType {
  settings: DisplaySettings;
  updateSettings: (settings: Partial<DisplaySettings>) => void;
  formatNumber: (value: number, isCurrency?: boolean) => string;
}

const DisplaySettingsContext = createContext<DisplaySettingsContextType | undefined>(undefined);

export function DisplaySettingsProvider({ children }: { children: ReactNode }) {
  const storeSettings = useReportStore(state => state.settings.display);
  const updateStoreSettings = useReportStore(state => state.updateSettings);

  const [settings, setSettings] = useState<DisplaySettings>(() => {
    // Initialize with store settings if available, otherwise use defaults
    return storeSettings || defaultSettings;
  });

  // Only update local state from store settings on mount
  useEffect(() => {
    if (storeSettings) {
      setSettings(storeSettings);
    }
  }, []); // Empty dependency array means this only runs on mount

  const updateSettings = async (newSettings: Partial<DisplaySettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    await updateStoreSettings({ display: updatedSettings });
  };

  const formatNumber = (value: number, isCurrency = false) => {
    const decimals = isCurrency ? settings.numberFormat.currencyDecimals : settings.numberFormat.numberDecimals;
    const formatted = value.toFixed(decimals);
    return isCurrency ? `kr ${formatted}` : formatted;
  };

  return (
    <DisplaySettingsContext.Provider value={{ settings, updateSettings, formatNumber }}>
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