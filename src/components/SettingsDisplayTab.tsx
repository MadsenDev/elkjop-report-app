import React from 'react';
import Input from './ui/Input';
import Label from './ui/Label';

interface DisplaySettingsProps {
  settings: any;
  updateSettings: (settings: Partial<any>) => void;
}

export default function SettingsDisplayTab({ settings, updateSettings }: DisplaySettingsProps) {
  if (!settings) return null;
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Display Settings</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-6">
          {/* Week Display Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Week Display</h3>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Show All Weeks</Label>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Display all weeks of the current year, even if they don't contain data
                </p>
              </div>
              <input
                type="checkbox"
                checked={settings.showAllWeeks}
                onChange={e => updateSettings({ showAllWeeks: e.target.checked })}
                className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
              />
            </div>
          </div>

          {/* Display Settings */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Compact View</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Use a more compact layout for data display</p>
            </div>
            <input
              type="checkbox"
              checked={settings.display.compactView}
              onChange={e => updateSettings({ display: { ...settings.display, compactView: e.target.checked } })}
              className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
            />
          </div>

          <div className="space-y-4">
            <Label>Visible Sections</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(settings.display.showSections).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <input
                    type="checkbox"
                    checked={value as boolean}
                    onChange={e => updateSettings({ display: { ...settings.display, showSections: { ...settings.display.showSections, [key]: e.target.checked } } })}
                    className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Label>Default Day</Label>
            <select
              value={settings.display.defaultDay}
              onChange={e => updateSettings({ display: { ...settings.display, defaultDay: e.target.value } })}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <option value="current">Current Day</option>
              <option value="monday">Monday</option>
              <option value="tuesday">Tuesday</option>
              <option value="wednesday">Wednesday</option>
              <option value="thursday">Thursday</option>
              <option value="friday">Friday</option>
              <option value="saturday">Saturday</option>
            </select>
          </div>

          <div className="space-y-4">
            <Label>Number Format</Label>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Currency Decimals
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="4"
                  value={settings.display.numberFormat.currencyDecimals}
                  onChange={e => updateSettings({ display: { ...settings.display, numberFormat: { ...settings.display.numberFormat, currencyDecimals: parseInt(e.target.value) } } })}
                  className="bg-gray-50 dark:bg-gray-900"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Number Decimals
                </Label>
                <Input
                  type="number"
                  min="0"
                  max="4"
                  value={settings.display.numberFormat.numberDecimals}
                  onChange={e => updateSettings({ display: { ...settings.display, numberFormat: { ...settings.display.numberFormat, numberDecimals: parseInt(e.target.value) } } })}
                  className="bg-gray-50 dark:bg-gray-900"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 