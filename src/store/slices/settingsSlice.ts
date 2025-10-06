import { db } from '../../services/db';
import { deepMergeSettings, getDefaultSettings } from '../defaults';
import type { ReportStateCreator, SettingsSlice } from '../types';

export const createSettingsSlice: ReportStateCreator<SettingsSlice> = (set, get) => ({
  settings: getDefaultSettings(),
  loadSettings: async () => {
    try {
      const loaded = await db.getSettings();
      const defaults = getDefaultSettings();

      if (!loaded) {
        await db.setSettings(defaults);
        set({ settings: defaults });
        return;
      }

      const merged = deepMergeSettings(defaults, loaded);
      await db.setSettings(merged);
      set({ settings: merged });
    } catch (error) {
      console.error('Failed to load settings:', error);
      const defaults = getDefaultSettings();
      await db.setSettings(defaults);
      set({ settings: defaults });
    }
  },
  updateSettings: async (newSettings) => {
    try {
      const current = get().settings;
      const defaults = getDefaultSettings();
      const mergedCurrent = deepMergeSettings(defaults, current);
      const merged = deepMergeSettings(mergedCurrent, newSettings);

      if (JSON.stringify(merged) !== JSON.stringify(current)) {
        await db.setSettings(merged);
        set({ settings: merged });
      }
    } catch (error) {
      console.error('Failed to update settings:', error);
    }
  },
});
