import React from 'react';
import Input from './ui/Input';
import Label from './ui/Label';

interface BackupSettingsProps {
  settings: any;
  updateSettings: (settings: Partial<any>) => void;
}

export default function SettingsBackupTab({ settings, updateSettings }: BackupSettingsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Backup Settings</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Auto-backup</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Automatically backup your data at regular intervals</p>
            </div>
            <input
              type="checkbox"
              checked={settings.backup.autoBackup}
              onChange={e => updateSettings({ backup: { ...settings.backup, autoBackup: e.target.checked } })}
              className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
            />
          </div>

          <div className="space-y-2">
            <Label>Backup Frequency (hours)</Label>
            <Input
              type="number"
              min={1}
              max={168}
              value={settings.backup.backupFrequency}
              onChange={e => updateSettings({ backup: { ...settings.backup, backupFrequency: parseInt(e.target.value) } })}
              className="bg-gray-50 dark:bg-gray-900"
            />
          </div>

          <div className="space-y-2">
            <Label>Retention Period (days)</Label>
            <Input
              type="number"
              min={1}
              max={365}
              value={settings.backup.retentionPeriod}
              onChange={e => updateSettings({ backup: { ...settings.backup, retentionPeriod: parseInt(e.target.value) } })}
              className="bg-gray-50 dark:bg-gray-900"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Encrypt Backups</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Encrypt backup files for extra security</p>
            </div>
            <input
              type="checkbox"
              checked={settings.backup.encryptBackups}
              onChange={e => updateSettings({ backup: { ...settings.backup, encryptBackups: e.target.checked } })}
              className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 