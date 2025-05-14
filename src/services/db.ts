import { openDB, DBSchema, IDBPDatabase } from 'idb';

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
      name: string;
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
}

class DatabaseService {
  private db: IDBPDatabase<ElkjopDB> | null = null;

  async init() {
    this.db = await openDB<ElkjopDB>('elkjop-report-app', 1, {
      upgrade(db) {
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
      },
    });
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

  // Export/Import operations
  async exportData() {
    const [people, services, goals] = await Promise.all([
      this.getPeople(),
      this.getServices(),
      this.getGoals(),
    ]);

    return {
      people,
      services,
      goals,
    };
  }

  async importData(data: {
    people: ElkjopDB['people']['value'];
    services: ElkjopDB['services']['value'];
    goals: ElkjopDB['goals']['value'];
  }) {
    await Promise.all([
      this.setPeople(data.people),
      this.setServices(data.services),
      this.setGoals(data.goals),
    ]);
  }
}

export const db = new DatabaseService(); 