// electron/handlers/pdfHandler.js
const { BrowserWindow, app } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { getReportTemplate } = require('../templates/reportTemplate');
const { getWeekDates } = require('../utils/dateUtils');
const { getChartConfig } = require('../utils/chartUtils');
const { db } = require('../database/db');

const generatePDF = async ({
  selectedDay,
  selectedWeek,
  avsAssignments,
  insuranceAgreements,
  precalibratedTVs,
  repairTickets,
  goalsData,
  prevWeekData,
  budgetYearData,
  budgetYearSettings
}) => {
  try {
    console.log('Starting PDF generation...');
    // Parse the week number correctly from the budget year format (YYYY/YYYY+1-WW)
    const [yearPart, week] = selectedWeek.split('-');
    const [startYear] = yearPart.split('/');
    const year = parseInt(startYear);
    const weekNum = parseInt(week);

    console.log('Using budget year data:', { budgetYearData, budgetYearSettings });

    const currentTotals = {
      avs: avsAssignments.reduce((sum, a) => sum + (a.gm || 0), 0),
      insurance: insuranceAgreements.reduce((sum, a) => sum + (a.sold || 0), 0),
      precalibrated: precalibratedTVs.reduce((sum, a) => sum + (a.completed || 0), 0),
      repair: repairTickets.reduce((sum, a) => sum + (a.completed || 0), 0)
    };

    const prevTotals = {
      avs: prevWeekData[0].reduce((sum, a) => sum + (a.gm || 0), 0),
      insurance: prevWeekData[1].reduce((sum, a) => sum + (a.sold || 0), 0),
      precalibrated: prevWeekData[2].reduce((sum, a) => sum + (a.completed || 0), 0),
      repair: prevWeekData[3].reduce((sum, a) => sum + (a.completed || 0), 0)
    };

    // Calculate budget year progress
    const yearToDateGM = budgetYearData.avsAssignments.reduce((sum, a) => sum + (a.gm || 0), 0);
    const yearToDateTAValue = budgetYearData.insuranceAgreements.reduce((sum, a) => sum + (a.sold || 0), 0) * 115; // Multiply TA count by 115
    
    // Calculate target based on previous year's GM and TA values
    const previousYearGM = budgetYearSettings?.previousYearGM?.avs || 0;
    const previousYearTA = budgetYearSettings?.previousYearGM?.ta || 0;
    const yearTarget = (previousYearGM + previousYearTA) * 1.05; // Add 5% increase to the sum
    
    const yearProgress = (yearToDateGM / yearTarget) * 100;
    const expectedProgress = (weekNum / 52) * 100;
    const progressDifference = yearProgress - expectedProgress;

    const budgetYearProgress = {
      yearToDateGM,
      yearToDateTAValue,
      yearTarget,
      yearProgress,
      weekNum,
      expectedProgress,
      progressDifference
    };

    console.log('Budget year progress:', budgetYearProgress);

    const topAVS = Object.entries(
      avsAssignments.reduce((acc, a) => {
        if (!acc[a.person]) acc[a.person] = { gm: 0, sales: 0 };
        acc[a.person].gm += a.gm || 0;
        acc[a.person].sales += 1;
        return acc;
      }, {})
    ).sort((a, b) => b[1].gm - a[1].gm)[0];

    const topInsurance = Object.entries(
      insuranceAgreements.reduce((acc, a) => {
        acc[a.person] = (acc[a.person] || 0) + (a.sold || 0);
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0];

    const topPrecalibrated = Object.entries(
      precalibratedTVs.reduce((acc, a) => {
        acc[a.person] = (acc[a.person] || 0) + (a.completed || 0);
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0];

    const topRepair = Object.entries(
      repairTickets.reduce((acc, a) => {
        acc[a.person] = (acc[a.person] || 0) + (a.completed || 0);
        return acc;
      }, {})
    ).sort((a, b) => b[1] - a[1])[0];

    const weekDates = getWeekDates(year, week);
    const chartConfig = getChartConfig(currentTotals, prevTotals);

    // Get the correct path to the logo file in both dev and prod
    const logoFilePath = app.isPackaged
      ? path.join(process.resourcesPath, 'assets', 'elkjop_logo.png')
      : path.join(__dirname, '..', '..', 'src', 'assets', 'elkjop_logo.png');

    let logoBase64 = '';
    try {
      const logoBuffer = fs.readFileSync(logoFilePath);
      logoBase64 = logoBuffer.toString('base64');
    } catch (e) {
      console.error('Failed to load logo for PDF:', e);
      logoBase64 = '';
    }

    const htmlContent = getReportTemplate({
      weekNumber: selectedWeek,
      weekDates,
      currentTotals,
      prevTotals,
      goalsData,
      topAVS,
      topInsurance,
      topPrecalibrated,
      topRepair,
      chartConfig,
      logoBase64,
      budgetYearProgress
    });

    console.log('Generated HTML content, creating window...');

    // Create a hidden BrowserWindow
    const win = new BrowserWindow({
      show: false,
      webPreferences: {
        offscreen: true,
        sandbox: false,
        contextIsolation: true,
        nodeIntegration: false
      }
    });

    // Load the HTML content
    await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(htmlContent));

    console.log('Waiting for Chart.js to render...');

    // Wait for Chart.js to render (wait for canvas)
    await win.webContents.executeJavaScript(`
      new Promise(resolve => {
        const check = () => {
          const canvas = document.getElementById('comparisonChart');
          if (canvas && canvas.getContext('2d')) resolve();
          else setTimeout(check, 100);
        };
        check();
      });
    `);

    console.log('Generating PDF...');

    // Print to PDF
    const documentsPath = path.join(os.homedir(), 'Documents');
    const safeWeekKey = selectedWeek.replace('/', '-');
    const pdfPath = path.join(documentsPath, `report-week-${safeWeekKey}.pdf`);
    const pdfBuffer = await win.webContents.printToPDF({
      printBackground: true,
      marginsType: 1,
      pageSize: 'A4',
      landscape: false
    });
    fs.writeFileSync(pdfPath, pdfBuffer);
    win.destroy();

    console.log('PDF generation completed successfully');
    return { success: true, path: pdfPath };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { 
      success: false, 
      error: error && error.message ? error.message : String(error),
      stack: error && error.stack ? error.stack : undefined,
      name: error && error.name ? error.name : undefined
    };
  }
};

module.exports = {
  generatePDF
};