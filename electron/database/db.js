const fs = require('fs');
const path = require('path');
const os = require('os');

class MainProcessDB {
  constructor() {
    this.dataDir = this.ensureDataDir();
  }

  ensureDataDir() {
    const dataDir = path.join(os.homedir(), '.elkjop-report-app');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    return dataDir;
  }

  getDataPath(key) {
    return path.join(this.dataDir, `${key}.json`);
  }

  async getBudgetYearData(budgetYearKey) {
    try {
      const dataPath = this.getDataPath(`budget-year-${budgetYearKey}`);
      if (!fs.existsSync(dataPath)) {
        return {
          avsAssignments: [],
          insuranceAgreements: [],
          precalibratedTVs: [],
          repairTickets: [],
          weekDates: {}
        };
      }
      const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      return data;
    } catch (error) {
      console.error('Error reading budget year data:', error);
      return {
        avsAssignments: [],
        insuranceAgreements: [],
        precalibratedTVs: [],
        repairTickets: [],
        weekDates: {}
      };
    }
  }

  async getBudgetYear(budgetYearKey) {
    try {
      const dataPath = this.getDataPath(`budget-year-settings-${budgetYearKey}`);
      if (!fs.existsSync(dataPath)) {
        return null;
      }
      return JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
    } catch (error) {
      console.error('Error reading budget year settings:', error);
      return null;
    }
  }
}

const db = new MainProcessDB();

module.exports = { db }; 