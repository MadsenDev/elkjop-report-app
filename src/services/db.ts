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
    key: string;  // Format: "YYYY-WW" (e.g., "2024-01" for first week of 2024)
    value: {
      [key in Day]: string;
    };
  };
  avsAssignments: {
    key: string;  // Format: "YYYY-WW" (e.g., "2024-01")
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
    key: string;  // Format: "YYYY-WW"
    value: {
      day: Day;
      person: string;
      sold: number;
    }[];
  };
  precalibratedTVs: {
    key: string;  // Format: "YYYY-WW"
    value: {
      day: Day;
      person: string;
      completed: number;
    }[];
  };
  repairTickets: {
    key: string;  // Format: "YYYY-WW"
    value: {
      day: Day;
      person: string;
      completed: number;
    }[];
  };
  qualityInspections: {
    key: string;  // Format: "YYYY-WW"
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
}

class DatabaseService {
  private db: IDBPDatabase<ElkjopDB> | null = null;

  async init() {
    this.db = await openDB<ElkjopDB>('elkjop-report-app', 4, {  // Increment version
      upgrade(db, oldVersion, newVersion) {
        console.log(`Upgrading database from version ${oldVersion} to ${newVersion}`);
        
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
    const getWeekNumber = (date: Date) => {
      const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
      const dayNum = d.getUTCDay() || 7;
      d.setUTCDate(d.getUTCDate() + 4 - dayNum);
      const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
      return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
    };
    const weekNumber = getWeekNumber(now);
    return `${now.getFullYear()}-${weekNumber.toString().padStart(2, '0')}`;
  }

  // Modified methods to use week keys
  async getWeekDates(weekKey?: string) {
    if (!this.db) await this.init();
    return this.db!.get('weekDates', weekKey || this.getCurrentWeekKey());
  }

  async setWeekDates(dates: ElkjopDB['weekDates']['value'], weekKey?: string) {
    if (!this.db) await this.init();
    await this.db!.put('weekDates', dates, weekKey || this.getCurrentWeekKey());
  }

  // AVS Assignments operations
  async getAVSAssignments(weekKey?: string) {
    if (!this.db) await this.init();
    return this.db!.get('avsAssignments', weekKey || this.getCurrentWeekKey());
  }

  async setAVSAssignments(assignments: ElkjopDB['avsAssignments']['value'], weekKey?: string) {
    if (!this.db) await this.init();
    await this.db!.put('avsAssignments', assignments, weekKey || this.getCurrentWeekKey());
  }

  // Insurance Agreements operations
  async getInsuranceAgreements(weekKey?: string) {
    if (!this.db) await this.init();
    return this.db!.get('insuranceAgreements', weekKey || this.getCurrentWeekKey());
  }

  async setInsuranceAgreements(agreements: ElkjopDB['insuranceAgreements']['value'], weekKey?: string) {
    if (!this.db) await this.init();
    await this.db!.put('insuranceAgreements', agreements, weekKey || this.getCurrentWeekKey());
  }

  // Precalibrated TVs operations
  async getPrecalibratedTVs(weekKey?: string) {
    if (!this.db) await this.init();
    return this.db!.get('precalibratedTVs', weekKey || this.getCurrentWeekKey());
  }

  async setPrecalibratedTVs(tvs: ElkjopDB['precalibratedTVs']['value'], weekKey?: string) {
    if (!this.db) await this.init();
    await this.db!.put('precalibratedTVs', tvs, weekKey || this.getCurrentWeekKey());
  }

  // Repair Tickets operations
  async getRepairTickets(weekKey?: string) {
    if (!this.db) await this.init();
    return this.db!.get('repairTickets', weekKey || this.getCurrentWeekKey());
  }

  async setRepairTickets(tickets: ElkjopDB['repairTickets']['value'], weekKey?: string) {
    if (!this.db) await this.init();
    await this.db!.put('repairTickets', tickets, weekKey || this.getCurrentWeekKey());
  }

  // Quality Inspections operations
  async getQualityInspections(weekKey?: string) {
    if (!this.db) await this.init();
    return this.db!.get('qualityInspections', weekKey || this.getCurrentWeekKey());
  }

  async setQualityInspections(inspections: ElkjopDB['qualityInspections']['value'], weekKey?: string) {
    if (!this.db) await this.init();
    await this.db!.put('qualityInspections', inspections, weekKey || this.getCurrentWeekKey());
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
          dayReport: '{day}',
          weekReport: 'Week {week}'
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
      await Promise.all([
        this.setWeekDates(weekData.weekDates, week),
        this.setAVSAssignments(weekData.avsAssignments, week),
        this.setInsuranceAgreements(weekData.insuranceAgreements, week),
        this.setPrecalibratedTVs(weekData.precalibratedTVs, week),
        this.setRepairTickets(weekData.repairTickets, week),
        this.setQualityInspections(weekData.qualityInspections, week)
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
}

export const db = new DatabaseService(); 