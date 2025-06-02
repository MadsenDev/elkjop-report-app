import React from 'react';
import Input from './ui/Input';
import Label from './ui/Label';

interface ReportSettingsProps {
  settings: any;
  updateSettings: (settings: Partial<any>) => void;
}

export default function SettingsReportTab({ settings, updateSettings }: ReportSettingsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Report Settings</h2>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-6">
          {/* Title Settings */}
          <div className="space-y-4">
            <Label>Report Titles</Label>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Day Report Title</Label>
                <Input
                  type="text"
                  value={settings.report.titles.dayReport}
                  onChange={(e) => updateSettings({
                    report: {
                      ...settings.report,
                      titles: {
                        ...settings.report.titles,
                        dayReport: e.target.value
                      }
                    }
                  })}
                  placeholder="Use {day} for the day name"
                  className="bg-gray-50 dark:bg-gray-900"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">Available variables: {'{day}'}</p>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Week Report Title</Label>
                <Input
                  type="text"
                  value={settings.report.titles.weekReport}
                  onChange={(e) => updateSettings({
                    report: {
                      ...settings.report,
                      titles: {
                        ...settings.report.titles,
                        weekReport: e.target.value
                      }
                    }
                  })}
                  placeholder="Use {week} for the week number"
                  className="bg-gray-50 dark:bg-gray-900"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">Available variables: {'{week}'}</p>
              </div>
            </div>
          </div>

          {/* Export Format */}
          <div className="space-y-4">
            <Label>Default Export Format</Label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={settings.report.defaultFormat === 'png'}
                  onChange={() => updateSettings({
                    report: {
                      ...settings.report,
                      defaultFormat: 'png'
                    }
                  })}
                  className="mr-2"
                />
                PNG
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={settings.report.defaultFormat === 'pdf'}
                  onChange={() => updateSettings({
                    report: {
                      ...settings.report,
                      defaultFormat: 'pdf'
                    }
                  })}
                  className="mr-2"
                />
                PDF
              </label>
            </div>
          </div>

          {/* Quality Settings */}
          <div className="space-y-4">
            <Label>Default Quality</Label>
            <select
              value={settings.report.defaultQuality}
              onChange={(e) => updateSettings({
                report: {
                  ...settings.report,
                  defaultQuality: e.target.value
                }
              })}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          {/* Size Settings */}
          <div className="space-y-4">
            <Label>Default Size</Label>
            <select
              value={settings.report.defaultSize}
              onChange={(e) => updateSettings({
                report: {
                  ...settings.report,
                  defaultSize: e.target.value
                }
              })}
              className="w-full rounded-lg border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700"
            >
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>

          {/* Auto-export Settings */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Auto-export</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Automatically export reports periodically</p>
            </div>
            <input
              type="checkbox"
              checked={settings.report.autoExport}
              onChange={(e) => updateSettings({
                report: {
                  ...settings.report,
                  autoExport: e.target.checked
                }
              })}
              className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Auto-export on Save</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Export report when saving changes</p>
            </div>
            <input
              type="checkbox"
              checked={settings.report.autoExportOnSave}
              onChange={(e) => updateSettings({
                report: {
                  ...settings.report,
                  autoExportOnSave: e.target.checked
                }
              })}
              className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 