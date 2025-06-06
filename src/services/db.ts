import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { deleteDB } from 'idb';
import { Day } from '../types';

interface ElkjopDB extends DBSchema {
  people: {
    key: string;
    value: {
      code: string;
      firstName: string;
      lastName: string;
    }[];
  };
  services: {
    key: string;
    value: {
      id: string;
      price: number;
      cost: number;
    }[];
  };
  goals: {
    key: string;
    value: {
      section: string;
      goals: number[];
    }[];
  };
  weekDates: {
    key: string;  // Format: "YYYY/YYYY+1-WW"
    value: {
      [key in Day]: string;
    };
  };
  avsAssignments: {
    key: string;  // Format: "YYYY/YYYY+1-WW" (e.g., "2024/2025-01")
    value: {
      day: Day;
      person: string;
      serviceId: string;
      sold: number;
      price: number;
      gm: number;
    }[];
  };
  insuranceAgreements: {
    key: string;  // Format: "YYYY/YYYY+1-WW"
    value: {
      day: Day;
      person: string;
      sold: number;
    }[];
  };
  precalibratedTVs: {
    key: string;  // Format: "YYYY/YYYY+1-WW"
    value: {
      day: Day;
      person: string;
      completed: number;
    }[];
  };
  repairTickets: {
    key: string;  // Format: "YYYY/YYYY+1-WW"
    value: {
      day: Day;
      person: string;
      completed: number;
    }[];
  };
  qualityInspections: {
    key: string;  // Format: "YYYY/YYYY+1-WW"
    value: {
      day: Day;
      count: number;
    }[];
  };
  settings: {
    key: string;
    value: {
      display: {
        compactView: boolean;
        showSections: {
          avs: boolean;
          insurance: boolean;
          precalibrated: boolean;
          repair: boolean;
        };
        defaultDay: 'current' | 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday';
        numberFormat: {
          currencyDecimals: number;
          numberDecimals: number;
        };
      };
      theme: {
        fontSize: 'small' | 'medium' | 'large';
        animationSpeed: 'slow' | 'normal' | 'fast';
        accentColors: {
          avs: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
          insurance: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
          precalibrated: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
          repair: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
          summary: 'blue' | 'green' | 'purple' | 'orange' | 'indigo';
        };
      };
      data: {
        autoSave: boolean;
        autoSaveInterval: number;
        dataRetention: number;
        defaultValues: {
          serviceSold: number;
          repairTickets: number;
          precalibratedTVs: number;
          insuranceAgreements: number;
        };
      };
      report: {
        defaultFormat: 'png' | 'pdf' | 'csv';
        defaultQuality: 'low' | 'medium' | 'high';
        defaultSize: 'small' | 'medium' | 'large';
        autoExport: boolean;
        autoExportOnSave: boolean;
        titles: {
          dayReport: string;
          weekReport: string;
        };
      };
      notifications: {
        enabled: boolean;
        sound: boolean;
        duration: number;
        goalsAchievement: boolean;
      };
      backup: {
        autoBackup: boolean;
        backupFrequency: number;
        retentionPeriod: number;
        encryptBackups: boolean;
      };
      showAllWeeks: boolean;
    };
  };
  budgetYears: {
    key: string;  // Format: "YYYY/YYYY+1" (e.g., "2025/2026")
    value: {
      startDate: string;  // ISO date string for May 1st
      endDate: string;    // ISO date string for April 30th
      previousYearGM: {
        avs: number;
        ta: number;
      };
      goals: {
        avs: number;
        insurance: number;
        precalibrated: number;
        repair: number;
      };
    };
  };
}

class DatabaseService {
  private db: IDBPDatabase<ElkjopDB> | null = null;

  async init() {
    this.db = await openDB<ElkjopDB>('elkjop-report-app', 5, {  // Increment version
      upgrade(db, oldVersion, newVersion) {
        // Create object stores
        if (!db.objectStoreNames.contains('people')) {
          db.createObjectStore('people');
        }
        if (!db.objectStoreNames.contains('services')) {
          db.createObjectStore('services');
        }
        if (!db.objectStoreNames.contains('goals')) {
          db.createObjectStore('goals');
        }
        if (!db.objectStoreNames.contains('weekDates')) {
          db.createObjectStore('weekDates');
        }
        if (!db.objectStoreNames.contains('avsAssignments')) {
          db.createObjectStore('avsAssignments');
        }
        if (!db.objectStoreNames.contains('insuranceAgreements')) {
          db.createObjectStore('insuranceAgreements');
        }
        if (!db.objectStoreNames.contains('precalibratedTVs')) {
          db.createObjectStore('precalibratedTVs');
        }
        if (!db.objectStoreNames.contains('repairTickets')) {
          db.createObjectStore('repairTickets');
        }
        if (!db.objectStoreNames.contains('qualityInspections')) {
          db.createObjectStore('qualityInspections');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings');
        }
        if (!db.objectStoreNames.contains('budgetYears')) {
          db.createObjectStore('budgetYears');
        }

        // Migrate data from old format to new format if upgrading from version 4
        if (oldVersion === 4) {
          const migrateData = async () => {
            const stores = [
              'weekDates',
              'avsAssignments',
              'insuranceAgreements',
              'precalibratedTVs',
              'repairTickets',
              'qualityInspections'
            ] as const;

            for (const store of stores) {
              const tx = db.transaction(store, 'readwrite');
              const keys = await tx.store.getAllKeys();
              
              // Clear old data
              await tx.store.clear();
              
              // Migrate each entry to new format
              for (const key of keys) {
                if (typeof key === 'string' && key.includes('-')) {
                  const [year, week] = key.split('-');
                  const budgetYear = parseInt(year);
                  const newKey = `${budgetYear}/${budgetYear + 1}-${week}`;
                  const value = await tx.store.get(key);
                  if (value) {
                    await tx.store.put(value, newKey);
                  }
                }
              }
            }
          };

          // Execute migration
          migrateData().catch(console.error);
        }
      },
    });
  }

  async deleteDatabase() {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    await deleteDB('elkjop-report-app');
    // Reinitialize the database after deletion
    await this.init();
  }

  async deleteUserData() {
    if (!this.db) await this.init();
    
    // Get the current data we want to preserve
    const [services, people, goals, settings] = await Promise.all([
      this.getServices(),
      this.getPeople(),
      this.getGoals(),
      this.getSettings()
    ]);

    // Delete the database
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    await deleteDB('elkjop-report-app');
    
    // Reinitialize and restore preserved data
    await this.init();
    await Promise.all([
      this.setServices(services || []),
      this.setPeople(people || []),
      this.setGoals(goals || []),
      this.setSettings(settings || { showAllWeeks: false })
    ]);
  }

  // People operations
  async getPeople() {
    if (!this.db) await this.init();
    return this.db!.get('people', 'list');
  }

  async setPeople(people: ElkjopDB['people']['value']) {
    if (!this.db) await this.init();
    await this.db!.put('people', people, 'list');
  }

  // Services operations
  async getServices() {
    if (!this.db) await this.init();
    return this.db!.get('services', 'list');
  }

  async setServices(services: ElkjopDB['services']['value']) {
    if (!this.db) await this.init();
    await this.db!.put('services', services, 'list');
  }

  // Goals operations
  async getGoals() {
    if (!this.db) await this.init();
    return this.db!.get('goals', 'list');
  }

  async setGoals(goals: ElkjopDB['goals']['value']) {
    if (!this.db) await this.init();
    await this.db!.put('goals', goals, 'list');
  }

  // Helper function to get current week key
  private getCurrentWeekKey(): string {
    const now = new Date();
    
    // Get the budget year (starts May 1st)
    const getBudgetYear = (date: Date) => {
      const month = date.getMonth() + 1; // getMonth() returns 0-11
      const year = date.getFullYear();
      return month < 5 ? year - 1 : year;
    };

    // Get the week number within the budget year
    const getWeekNumber = (date: Date) => {
      const budgetYear = getBudgetYear(date);
      const budgetYearStart = new Date(budgetYear, 4, 1); // May 1st (month is 0-based)
      
      // If the date is before May 1st, use the previous year's budget
      const startDate = date < budgetYearStart ? new Date(budgetYear - 1, 4, 1) : budgetYearStart;
      
      // Calculate days since budget year start
      const daysSinceStart = Math.floor((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      
      // Calculate week number (1-based)
      return Math.floor(daysSinceStart / 7) + 1;
    };

    const budgetYear = getBudgetYear(now);
    const weekNumber = getWeekNumber(now);
    return `${budgetYear}/${budgetYear + 1}-${weekNumber.toString().padStart(2, '0')}`;
  }

  // Helper function to get current budget year key
  private getCurrentBudgetYearKey(): string {
    const now = new Date();
    const month = now.getMonth() + 1; // getMonth() returns 0-11
    const year = now.getFullYear();
    const budgetYear = month < 5 ? year - 1 : year;
    return `${budgetYear}/${budgetYear + 1}`;
  }

  // Helper function to get week key with budget year
  private getWeekKeyWithBudgetYear(weekKey: string): string {
    const [year, week] = weekKey.split('-');
    const budgetYear = parseInt(year);
    return `${budgetYear}/${budgetYear + 1}-${week}`;
  }

  // Modified methods to use budget year in keys
  async getWeekDates(weekKey?: string) {
    if (!this.db) await this.init();
    const key = weekKey ? this.getWeekKeyWithBudgetYear(weekKey) : this.getCurrentWeekKey();
    return this.db!.get('weekDates', key);
  }

  async setWeekDates(dates: ElkjopDB['weekDates']['value'], weekKey?: string) {
    if (!this.db) await this.init();
    const key = weekKey ? this.getWeekKeyWithBudgetYear(weekKey) : this.getCurrentWeekKey();
    await this.db!.put('weekDates', dates, key);
  }

  // AVS Assignments operations
  async getAVSAssignments(weekKey?: string) {
    if (!this.db) await this.init();
    const key = weekKey ? this.getWeekKeyWithBudgetYear(weekKey) : this.getCurrentWeekKey();
    return this.db!.get('avsAssignments', key);
  }

  async setAVSAssignments(assignments: ElkjopDB['avsAssignments']['value'], weekKey?: string) {
    if (!this.db) await this.init();
    const key = weekKey ? this.getWeekKeyWithBudgetYear(weekKey) : this.getCurrentWeekKey();
    await this.db!.put('avsAssignments', assignments, key);
  }

  // Insurance Agreements operations
  async getInsuranceAgreements(weekKey?: string) {
    if (!this.db) await this.init();
    const key = weekKey ? this.getWeekKeyWithBudgetYear(weekKey) : this.getCurrentWeekKey();
    return this.db!.get('insuranceAgreements', key);
  }

  async setInsuranceAgreements(agreements: ElkjopDB['insuranceAgreements']['value'], weekKey?: string) {
    if (!this.db) await this.init();
    const key = weekKey ? this.getWeekKeyWithBudgetYear(weekKey) : this.getCurrentWeekKey();
    await this.db!.put('insuranceAgreements', agreements, key);
  }

  // Precalibrated TVs operations
  async getPrecalibratedTVs(weekKey?: string) {
    if (!this.db) await this.init();
    const key = weekKey ? this.getWeekKeyWithBudgetYear(weekKey) : this.getCurrentWeekKey();
    return this.db!.get('precalibratedTVs', key);
  }

  async setPrecalibratedTVs(tvs: ElkjopDB['precalibratedTVs']['value'], weekKey?: string) {
    if (!this.db) await this.init();
    const key = weekKey ? this.getWeekKeyWithBudgetYear(weekKey) : this.getCurrentWeekKey();
    await this.db!.put('precalibratedTVs', tvs, key);
  }

  // Repair Tickets operations
  async getRepairTickets(weekKey?: string) {
    if (!this.db) await this.init();
    const key = weekKey ? this.getWeekKeyWithBudgetYear(weekKey) : this.getCurrentWeekKey();
    return this.db!.get('repairTickets', key);
  }

  async setRepairTickets(tickets: ElkjopDB['repairTickets']['value'], weekKey?: string) {
    if (!this.db) await this.init();
    const key = weekKey ? this.getWeekKeyWithBudgetYear(weekKey) : this.getCurrentWeekKey();
    await this.db!.put('repairTickets', tickets, key);
  }

  // Quality Inspections operations
  async getQualityInspections(weekKey?: string) {
    if (!this.db) await this.init();
    const key = weekKey ? this.getWeekKeyWithBudgetYear(weekKey) : this.getCurrentWeekKey();
    return this.db!.get('qualityInspections', key);
  }

  async setQualityInspections(inspections: ElkjopDB['qualityInspections']['value'], weekKey?: string) {
    if (!this.db) await this.init();
    const key = weekKey ? this.getWeekKeyWithBudgetYear(weekKey) : this.getCurrentWeekKey();
    await this.db!.put('qualityInspections', inspections, key);
  }

  // Settings operations
  async getSettings() {
    if (!this.db) await this.init();
    const settings = await this.db!.get('settings', 'app');
    return settings || {
      display: {
        compactView: false,
        showSections: {
          avs: true,
          insurance: true,
          precalibrated: true,
          repair: true
        },
        defaultDay: 'current',
        numberFormat: {
          currencyDecimals: 2,
          numberDecimals: 0
        }
      },
      theme: {
        fontSize: 'medium',
        animationSpeed: 'normal',
        accentColors: {
          avs: 'blue',
          insurance: 'green',
          precalibrated: 'purple',
          repair: 'orange',
          summary: 'indigo'
        }
      },
      data: {
        autoSave: true,
        autoSaveInterval: 5,
        dataRetention: 30,
        defaultValues: {
          serviceSold: 1,
          repairTickets: 1,
          precalibratedTVs: 1,
          insuranceAgreements: 1
        }
      },
      report: {
        defaultFormat: 'png',
        defaultQuality: 'high',
        defaultSize: 'medium',
        autoExport: false,
        autoExportOnSave: false,
        titles: {
          dayReport: 'ASO Daily Report {day}',
          weekReport: 'ASO Weekly Report {week}'
        }
      },
      notifications: {
        enabled: true,
        sound: true,
        duration: 3000,
        goalsAchievement: true
      },
      backup: {
        autoBackup: true,
        backupFrequency: 24,
        retentionPeriod: 30,
        encryptBackups: true
      },
      showAllWeeks: false
    };
  }

  async setSettings(settings: ElkjopDB['settings']['value']) {
    if (!this.db) await this.init();
    await this.db!.put('settings', settings, 'app');
  }

  // Export/Import operations
  async exportData() {
    const [
      people,
      services,
      goals,
      settings
    ] = await Promise.all([
      this.getPeople(),
      this.getServices(),
      this.getGoals(),
      this.getSettings()
    ]);

    return {
      people,
      services,
      goals,
      settings
    };
  }

  async importData(data: {
    people: ElkjopDB['people']['value'];
    services: ElkjopDB['services']['value'];
    goals: ElkjopDB['goals']['value'];
    settings?: ElkjopDB['settings']['value'];
  }) {
    await Promise.all([
      this.setPeople(data.people),
      this.setServices(data.services),
      this.setGoals(data.goals),
      data.settings ? this.setSettings(data.settings) : Promise.resolve()
    ]);
  }

  // New methods for user data export/import
  async exportUserData() {
    const weeks = await this.getAvailableWeeks();
    const userData: Record<string, {
      weekDates: ElkjopDB['weekDates']['value'];
      avsAssignments: ElkjopDB['avsAssignments']['value'];
      insuranceAgreements: ElkjopDB['insuranceAgreements']['value'];
      precalibratedTVs: ElkjopDB['precalibratedTVs']['value'];
      repairTickets: ElkjopDB['repairTickets']['value'];
      qualityInspections: ElkjopDB['qualityInspections']['value'];
    }> = {};

    // Get data for each week
    for (const week of weeks) {
      const [
        weekDates,
        avsAssignments,
        insuranceAgreements,
        precalibratedTVs,
        repairTickets,
        qualityInspections
      ] = await Promise.all([
        this.getWeekDates(week),
        this.getAVSAssignments(week),
        this.getInsuranceAgreements(week),
        this.getPrecalibratedTVs(week),
        this.getRepairTickets(week),
        this.getQualityInspections(week)
      ]);

      // Only include weeks that have data
      if (weekDates || avsAssignments?.length || insuranceAgreements?.length || 
          precalibratedTVs?.length || repairTickets?.length || qualityInspections?.length) {
        userData[week] = {
          weekDates: weekDates || {
            Monday: '',
            Tuesday: '',
            Wednesday: '',
            Thursday: '',
            Friday: '',
            Saturday: ''
          },
          avsAssignments: avsAssignments || [],
          insuranceAgreements: insuranceAgreements || [],
          precalibratedTVs: precalibratedTVs || [],
          repairTickets: repairTickets || [],
          qualityInspections: qualityInspections || []
        };
      }
    }

    return userData;
  }

  // Helper function to convert regular calendar week to budget year week
  private convertToBudgetYearWeek(regularWeek: number, year: number): { budgetYear: number; budgetWeek: number } {
    // Get the date for the first day of the regular week
    const jan1 = new Date(year, 0, 1);
    const firstWeekStart = new Date(jan1);
    firstWeekStart.setDate(jan1.getDate() + (regularWeek - 1) * 7);
    
    // Calculate budget year
    const month = firstWeekStart.getMonth() + 1; // getMonth() returns 0-11
    const budgetYear = month < 5 ? year - 1 : year;
    
    // Calculate budget year start date (May 1st)
    const budgetYearStart = new Date(budgetYear, 4, 1); // May 1st (month is 0-based)
    
    // If the date is before May 1st, use the previous year's budget
    const startDate = firstWeekStart < budgetYearStart ? new Date(budgetYear - 1, 4, 1) : budgetYearStart;
    
    // Calculate days since budget year start
    const daysSinceStart = Math.floor((firstWeekStart.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // Calculate budget week number (1-based)
    const budgetWeek = Math.floor(daysSinceStart / 7) + 1;
    
    return { budgetYear, budgetWeek };
  }

  // Helper function to convert old week key to new format
  private convertWeekKey(oldKey: string): string {
    const [year, week] = oldKey.split('-');
    const yearNum = parseInt(year);
    const weekNum = parseInt(week);
    
    const { budgetYear, budgetWeek } = this.convertToBudgetYearWeek(weekNum, yearNum);
    return `${budgetYear}/${budgetYear + 1}-${budgetWeek.toString().padStart(2, '0')}`;
  }

  async importUserData(data: Record<string, {
    weekDates: ElkjopDB['weekDates']['value'];
    avsAssignments: ElkjopDB['avsAssignments']['value'];
    insuranceAgreements: ElkjopDB['insuranceAgreements']['value'];
    precalibratedTVs: ElkjopDB['precalibratedTVs']['value'];
    repairTickets: ElkjopDB['repairTickets']['value'];
    qualityInspections: ElkjopDB['qualityInspections']['value'];
  }>) {
    // Import data for each week
    for (const [week, weekData] of Object.entries(data)) {
      // Convert old week key format to new format if needed
      const newWeekKey = week.includes('/') ? week : this.convertWeekKey(week);
      
      await Promise.all([
        this.setWeekDates(weekData.weekDates, newWeekKey),
        this.setAVSAssignments(weekData.avsAssignments, newWeekKey),
        this.setInsuranceAgreements(weekData.insuranceAgreements, newWeekKey),
        this.setPrecalibratedTVs(weekData.precalibratedTVs, newWeekKey),
        this.setRepairTickets(weekData.repairTickets, newWeekKey),
        this.setQualityInspections(weekData.qualityInspections, newWeekKey)
      ]);
    }
  }

  // New method to get all available weeks
  async getAvailableWeeks(): Promise<string[]> {
    if (!this.db) await this.init();
    const weeks = new Set<string>();
    
    // Get all keys from each store
    const stores = [
      'weekDates',
      'avsAssignments',
      'insuranceAgreements',
      'precalibratedTVs',
      'repairTickets',
      'qualityInspections'
    ] as const;
    
    for (const store of stores) {
      const keys = await this.db!.getAllKeys(store);
      keys.forEach(key => {
        if (key !== 'list' && key !== 'current') {
          weeks.add(key);
        }
      });
    }
    
    // If no weeks found, create current week
    if (weeks.size === 0) {
      const currentWeek = this.getCurrentWeekKey();
      weeks.add(currentWeek);
    }
    
    return Array.from(weeks).sort().reverse(); // Most recent weeks first
  }

  // Budget Year operations
  async getBudgetYear(yearKey: string) {
    if (!this.db) await this.init();
    return this.db!.get('budgetYears', yearKey);
  }

  async setBudgetYear(yearKey: string, data: ElkjopDB['budgetYears']['value']) {
    if (!this.db) await this.init();
    await this.db!.put('budgetYears', data, yearKey);
  }

  async getAllBudgetYears() {
    if (!this.db) await this.init();
    const keys = await this.db!.getAllKeys('budgetYears');
    const years: Record<string, ElkjopDB['budgetYears']['value']> = {};
    
    for (const key of keys) {
      const value = await this.db!.get('budgetYears', key);
      if (value) {
        years[key] = value;
      }
    }
    
    return years;
  }

  // New method to get data for a specific budget year
  async getBudgetYearData(budgetYearKey: string) {
    if (!this.db) await this.init();
    const allKeys = await this.db!.getAllKeys('avsAssignments');
    const yearKeys = allKeys.filter(key => key.startsWith(budgetYearKey));
    
    const data = {
      avsAssignments: [] as ElkjopDB['avsAssignments']['value'],
      insuranceAgreements: [] as ElkjopDB['insuranceAgreements']['value'],
      precalibratedTVs: [] as ElkjopDB['precalibratedTVs']['value'],
      repairTickets: [] as ElkjopDB['repairTickets']['value'],
      qualityInspections: [] as ElkjopDB['qualityInspections']['value'],
      weekDates: {} as Record<string, ElkjopDB['weekDates']['value']>
    };

    for (const key of yearKeys) {
      const [avs, insurance, tvs, repairs, inspections, dates] = await Promise.all([
        this.db!.get('avsAssignments', key),
        this.db!.get('insuranceAgreements', key),
        this.db!.get('precalibratedTVs', key),
        this.db!.get('repairTickets', key),
        this.db!.get('qualityInspections', key),
        this.db!.get('weekDates', key)
      ]);

      if (avs) data.avsAssignments.push(...avs);
      if (insurance) data.insuranceAgreements.push(...insurance);
      if (tvs) data.precalibratedTVs.push(...tvs);
      if (repairs) data.repairTickets.push(...repairs);
      if (inspections) data.qualityInspections.push(...inspections);
      if (dates) data.weekDates[key] = dates;
    }

    return data;
  }

  async deleteBudgetYear(yearKey: string) {
    if (!this.db) await this.init();
    
    // Get all keys that start with this budget year
    const stores = [
      'weekDates',
      'avsAssignments',
      'insuranceAgreements',
      'precalibratedTVs',
      'repairTickets',
      'qualityInspections'
    ] as const;

    // Delete all data associated with this budget year
    for (const store of stores) {
      const keys = await this.db!.getAllKeys(store);
      const yearKeys = keys.filter(key => key.startsWith(yearKey));
      
      for (const key of yearKeys) {
        await this.db!.delete(store, key);
      }
    }

    // Delete the budget year itself
    await this.db!.delete('budgetYears', yearKey);
  }
}

export const db = new DatabaseService(); 