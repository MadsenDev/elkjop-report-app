import React from 'react';
import Input from './ui/Input';
import Label from './ui/Label';

interface NotificationsSettingsProps {
  settings: any;
  updateSettings: (settings: Partial<any>) => void;
}

export default function SettingsNotificationsTab({ settings, updateSettings }: NotificationsSettingsProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Notification Settings</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enable Notifications</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Show notifications for important events</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.enabled}
              onChange={e => updateSettings({ notifications: { ...settings.notifications, enabled: e.target.checked } })}
              className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Sound</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Play a sound for notifications</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.sound}
              onChange={e => updateSettings({ notifications: { ...settings.notifications, sound: e.target.checked } })}
              className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
            />
          </div>

          <div className="space-y-2">
            <Label>Duration (ms)</Label>
            <Input
              type="number"
              min={1000}
              max={10000}
              value={settings.notifications.duration}
              onChange={e => updateSettings({ notifications: { ...settings.notifications, duration: parseInt(e.target.value) } })}
              className="bg-gray-50 dark:bg-gray-900"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Goal Achievement Notifications</Label>
              <p className="text-sm text-gray-500 dark:text-gray-400">Notify when goals are achieved</p>
            </div>
            <input
              type="checkbox"
              checked={settings.notifications.goalsAchievement}
              onChange={e => updateSettings({ notifications: { ...settings.notifications, goalsAchievement: e.target.checked } })}
              className="rounded border-gray-300 text-elkjop-green focus:ring-elkjop-green"
            />
          </div>
        </div>
      </div>
    </div>
  );
} 