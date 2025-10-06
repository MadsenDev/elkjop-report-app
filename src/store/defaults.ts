import type { ReportSettings } from './types';

type AnyRecord = Record<string, unknown>;

function isObject(value: unknown): value is AnyRecord {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

export function deepMergeSettings<T extends AnyRecord>(target: T, source: Partial<T>): T {
  const output = { ...target } as T;

  if (!isObject(source)) {
    return output;
  }

  Object.keys(source).forEach((key) => {
    const sourceValue = source[key as keyof T];
    const targetValue = target[key as keyof T];

    if (sourceValue === undefined) {
      return;
    }

    if (isObject(sourceValue) && isObject(targetValue)) {
      output[key as keyof T] = deepMergeSettings(targetValue as AnyRecord, sourceValue as AnyRecord) as T[keyof T];
    } else {
      output[key as keyof T] = sourceValue as T[keyof T];
    }
  });

  return output;
}

export function getDefaultSettings(): ReportSettings {
  return {
    display: {
      compactView: false,
      showSections: {
        avs: true,
        insurance: true,
        precalibrated: true,
        repair: true,
      },
      defaultDay: 'current',
      numberFormat: {
        currencyDecimals: 2,
        numberDecimals: 0,
      },
    },
    theme: {
      darkMode: false,
      fontSize: 'medium',
      animationSpeed: 'normal',
      accentColors: {
        avs: 'blue',
        insurance: 'green',
        precalibrated: 'purple',
        repair: 'orange',
        summary: 'indigo',
      },
    },
    data: {
      autoSave: true,
      autoSaveInterval: 5,
      dataRetention: 30,
      defaultValues: {
        serviceSold: 1,
        repairTickets: 1,
        precalibratedTVs: 1,
        insuranceAgreements: 1,
      },
    },
    report: {
      defaultFormat: 'png',
      defaultQuality: 'high',
      defaultSize: 'medium',
      autoExport: false,
      autoExportOnSave: false,
      titles: {
        dayReport: 'ASO Daily Report {day}',
        weekReport: 'ASO Weekly Report {week}',
      },
    },
    notifications: {
      enabled: true,
      sound: true,
      duration: 3000,
      goalsAchievement: true,
    },
    backup: {
      autoBackup: true,
      backupFrequency: 24,
      retentionPeriod: 30,
      encryptBackups: true,
    },
    showAllWeeks: false,
  };
}
