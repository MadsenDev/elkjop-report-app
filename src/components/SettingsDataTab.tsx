import React from 'react';
import Input from './ui/Input';
import Label from './ui/Label';
import Button from './ui/Button';

interface DataSettingsProps {
  settings: any;
  updateSettings: (settings: Partial<any>) => void;
  onExportConfig: () => Promise<void>;
  onImportConfig: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onExportUserData: () => Promise<void>;
  onImportUserData: (event: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  onResetUserData: () => void;
  onResetAllData: () => void;
}

export default function SettingsDataTab({
  settings,
  updateSettings,
  onExportConfig,
  onImportConfig,
  onExportUserData,
  onImportUserData,
  onResetUserData,
  onResetAllData
}: DataSettingsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Data Management</h2>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-6">
          {/* Configuration Data Export/Import */}
          <div className="space-y-4">
            <Label>Configuration Data</Label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Export or import configuration data (services, people, goals)
            </p>
            <div className="flex gap-4">
              <Button
                onClick={onExportConfig}
                color="blue"
                variant="outline"
                className="flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export Configuration
              </Button>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportConfig}
                  className="hidden"
                  id="import-config"
                />
                <Button
                  onClick={() => document.getElementById('import-config')?.click()}
                  color="blue"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Import Configuration
                </Button>
              </div>
            </div>
          </div>

          {/* User Data Export/Import */}
          <div className="space-y-4 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Label>User Data</Label>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Export or import weekly records (sales, repairs, insurance agreements, etc.)
            </p>
            <div className="flex gap-4">
              <Button
                onClick={onExportUserData}
                color="blue"
                variant="outline"
                className="flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Export User Data
              </Button>
              <div>
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportUserData}
                  className="hidden"
                  id="import-user-data"
                />
                <Button
                  onClick={() => document.getElementById('import-user-data')?.click()}
                  color="blue"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Import User Data
                </Button>
              </div>
              <Button
                onClick={onResetUserData}
                variant="danger"
                className="flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Reset User Data
              </Button>
            </div>
          </div>

          {/* Auto-save Settings */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Auto-save</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Automatically save changes periodically</p>
            </div>
            <input
              type="checkbox"
              checked={settings.data.autoSave}
              onChange={(e) => updateSettings({ data: { ...settings.data, autoSave: e.target.checked } })}
              className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
            />
          </div>

          {settings.data.autoSave && (
            <div className="space-y-2">
              <Label>Auto-save Interval (minutes)</Label>
              <Input
                type="number"
                min="1"
                max="60"
                value={settings.data.autoSaveInterval}
                onChange={(e) => updateSettings({ data: { ...settings.data, autoSaveInterval: parseInt(e.target.value) } })}
                className="bg-gray-50 dark:bg-gray-900"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Data Retention (days)</Label>
            <Input
              type="number"
              min="1"
              max="365"
              value={settings.data.dataRetention}
              onChange={(e) => updateSettings({ data: { ...settings.data, dataRetention: parseInt(e.target.value) } })}
              className="bg-gray-50 dark:bg-gray-900"
            />
          </div>

          {/* Default Values */}
          <div className="space-y-4">
            <Label>Default Values</Label>
            <div className="grid grid-cols-2 gap-4">
              {Object.entries(settings.data.defaultValues).map(([key, value]) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    value={value as number}
                    onChange={(e) => updateSettings({
                      data: {
                        ...settings.data,
                        defaultValues: {
                          ...settings.data.defaultValues,
                          [key]: parseInt(e.target.value)
                        }
                      }
                    })}
                    className="bg-gray-50 dark:bg-gray-900"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Danger Zone */}
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <div className="space-y-4">
              <Label>Danger Zone</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">These actions cannot be undone</p>
              <Button
                variant="outline"
                color="red"
                onClick={onResetAllData}
              >
                Reset All Data
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 