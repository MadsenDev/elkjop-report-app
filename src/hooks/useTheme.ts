import { useEffect } from 'react';
import { useSettings } from '../contexts/SettingsContext';

export const useTheme = () => {
  const { settings } = useSettings();
  const { theme } = settings;

  useEffect(() => {
    // Apply font size
    document.documentElement.style.setProperty('--font-size-base', {
      small: '14px',
      medium: '16px',
      large: '18px'
    }[theme.fontSize]);

    // Apply animation speed
    document.documentElement.style.setProperty('--animation-speed', {
      slow: '0.5s',
      normal: '0.3s',
      fast: '0.15s'
    }[theme.animationSpeed]);

    // Apply accent colors
    Object.entries(theme.accentColors).forEach(([section, color]) => {
      const colorMap = {
        blue: '#3B82F6',
        green: '#10B981',
        purple: '#8B5CF6',
        orange: '#F97316',
        indigo: '#6366F1'
      };
      document.documentElement.style.setProperty(`--color-${section}`, colorMap[color]);
    });
  }, [theme]);

  return theme;
}; 