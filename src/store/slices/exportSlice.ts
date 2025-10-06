import { db } from '../../services/db';
import type { ReportStateCreator, ExportSlice } from '../types';

function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export const createExportSlice: ReportStateCreator<ExportSlice> = (set, get) => ({
  exportData: async () => {
    const data = await db.exportData();
    downloadJson('elkjop-report-config.json', data);
  },
  importData: async (file) => {
    const text = await file.text();
    const data = JSON.parse(text);
    await db.importData(data);

    await Promise.all([
      get().loadPeople(),
      get().loadServices(),
      get().loadGoals(),
      get().loadSettings(),
      get().loadBudgetYears(),
    ]);

    await get().loadAllData();
  },
  exportUserData: async () => {
    const data = await db.exportUserData();
    downloadJson('elkjop-report-user-data.json', data);
  },
  importUserData: async (file) => {
    const text = await file.text();
    const data = JSON.parse(text);
    await db.importUserData(data);
    await get().loadAllData();
  },
});
