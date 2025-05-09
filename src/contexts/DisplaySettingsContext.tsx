import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

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
  updateSettings: (newSettings: Partial<DisplaySettings>) => void;
  formatNumber: (value: number, isCurrency?: boolean) => string;
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

const DisplaySettingsContext = createContext<DisplaySettingsContextType | undefined>(undefined);

export function DisplaySettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<DisplaySettings>(() => {
    const saved = localStorage.getItem('displaySettings');
    return saved ? JSON.parse(saved) : defaultSettings;
  });

  useEffect(() => {
    localStorage.setItem('displaySettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<DisplaySettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
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