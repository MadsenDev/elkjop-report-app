import React from 'react';
import Label from './ui/Label';

interface ThemeSettingsProps {
  settings: any;
  updateSettings: (settings: Partial<any>) => void;
}

export default function SettingsThemeTab({ settings, updateSettings }: ThemeSettingsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Theme Settings</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-6">
          {/* Font Size Settings */}
          <div className="space-y-4">
            <Label>Font Size</Label>
            <div className="grid grid-cols-3 gap-4">
              {['small', 'medium', 'large'].map((size) => (
                <button
                  key={size}
                  onClick={() => updateSettings({ theme: { ...settings.theme, fontSize: size } })}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    settings.theme.fontSize === size
                      ? 'border-elkjop-green bg-elkjop-green/5 text-elkjop-green'
                      : 'border-gray-200 dark:border-gray-700 hover:border-elkjop-green/50'
                  }`}
                >
                  <div className="text-center">
                    <div className={`font-medium mb-2 ${
                      size === 'small' ? 'text-sm' :
                      size === 'medium' ? 'text-base' :
                      'text-lg'
                    }`}>
                      {size.charAt(0).toUpperCase() + size.slice(1)}
                    </div>
                    <div className={`text-gray-500 dark:text-gray-400 ${
                      size === 'small' ? 'text-xs' :
                      size === 'medium' ? 'text-sm' :
                      'text-base'
                    }`}>
                      Sample Text
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Animation Speed Settings */}
          <div className="space-y-4">
            <Label>Animation Speed</Label>
            <div className="grid grid-cols-3 gap-4">
              {['slow', 'normal', 'fast'].map((speed) => (
                <button
                  key={speed}
                  onClick={() => updateSettings({ theme: { ...settings.theme, animationSpeed: speed } })}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    settings.theme.animationSpeed === speed
                      ? 'border-elkjop-green bg-elkjop-green/5 text-elkjop-green'
                      : 'border-gray-200 dark:border-gray-700 hover:border-elkjop-green/50'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-medium mb-2">
                      {speed.charAt(0).toUpperCase() + speed.slice(1)}
                    </div>
                    <div className="text-gray-500 dark:text-gray-400 text-sm">
                      {speed === 'slow' ? '0.5s' : speed === 'normal' ? '0.3s' : '0.15s'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Accent Colors */}
          <div className="space-y-4">
            <Label>Accent Colors</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(settings.theme.accentColors).map(([section, color]) => (
                <div key={section} className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {section.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <div className="grid grid-cols-5 gap-2">
                    {['blue', 'green', 'purple', 'orange', 'indigo'].map((c) => (
                      <button
                        key={c}
                        onClick={() => updateSettings({
                          theme: {
                            ...settings.theme,
                            accentColors: {
                              ...settings.theme.accentColors,
                              [section]: c
                            }
                          }
                        })}
                        className={`w-full aspect-square rounded-lg border-2 transition-all duration-200 ${
                          color === c
                            ? 'border-elkjop-green scale-110'
                            : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                        }`}
                        style={{
                          backgroundColor: {
                            blue: '#3B82F6',
                            green: '#10B981',
                            purple: '#8B5CF6',
                            orange: '#F97316',
                            indigo: '#6366F1'
                          }[c]
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 