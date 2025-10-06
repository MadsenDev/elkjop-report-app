import { describe, expect, it } from 'vitest';
import { deepMergeSettings, getDefaultSettings } from '../defaults';
import type { ReportSettings } from '../types';

describe('settings defaults', () => {
  it('merges nested settings without dropping defaults', () => {
    const defaults = getDefaultSettings();
    const overrides: Partial<ReportSettings> = {
      display: {
        compactView: true,
        numberFormat: {
          currencyDecimals: 1,
        },
      },
      theme: {
        accentColors: {
          summary: 'orange',
        },
      },
    };

    const merged = deepMergeSettings(defaults, overrides);

    expect(merged.display.compactView).toBe(true);
    expect(merged.display.numberFormat.currencyDecimals).toBe(1);
    expect(merged.display.numberFormat.numberDecimals).toBe(0);
    expect(merged.theme.accentColors.summary).toBe('orange');
    expect(merged.theme.fontSize).toBe('medium');
  });

  it('preserves boolean flags when updating partial sections', () => {
    const defaults = getDefaultSettings();
    const overrides: Partial<ReportSettings> = {
      notifications: {
        enabled: false,
      },
    };

    const merged = deepMergeSettings(defaults, overrides);

    expect(merged.notifications.enabled).toBe(false);
    expect(merged.notifications.goalsAchievement).toBe(true);
  });
});
