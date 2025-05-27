export interface ThemeSettings {
  fontSize: 'small' | 'medium' | 'large';
  animationSpeed: 'slow' | 'normal' | 'fast';
  accentColors: {
    [key: string]: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
  };
}

export interface Settings {
  theme: ThemeSettings;
  notifications: {
    enabled: boolean;
    sound: boolean;
    duration: number;
    goalsAchievement: boolean;
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';
    style: {
      theme: 'light' | 'dark' | 'system';
      animation: 'slide' | 'fade' | 'scale';
      showProgress: boolean;
    };
    behavior: {
      stack: boolean;
      maxVisible: number;
      pauseOnHover: boolean;
      closeOnClick: boolean;
      groupSimilar: boolean;
    };
  };
} 