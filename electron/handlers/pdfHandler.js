// electron/handlers/pdfHandler.js
const { BrowserWindow, app } = require('electron');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { getReportTemplate } = require('../templates/reportTemplate');
const { getWeekDates } = require('../utils/dateUtils');
const { getChartConfig } = require('../utils/chartUtils');

const generatePDF = async ({
  selectedDay,
  selectedWeek,
  avsAssignments,
  insuranceAgreements,
  precalibratedTVs,
  repairTickets,
  goalsData,
  prevWeekData
}) => {
  try {
    const [year, week] = selectedWeek.split('-').map(Number);

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

    // Embed logo as data URL
    const logoFilePath = path.join(__dirname, '..', '..', 'src', 'assets', 'elkjop_logo.png');
    let logoDataUrl = '';
    try {
      const logoBuffer = fs.readFileSync(logoFilePath);
      const logoBase64 = logoBuffer.toString('base64');
      logoDataUrl = `data:image/png;base64,${logoBase64}`;
    } catch (e) {
      console.error('Failed to load logo for PDF:', e);
      logoDataUrl = '';
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
      logoPath: logoDataUrl
    });

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

    // Print to PDF
    const documentsPath = path.join(os.homedir(), 'Documents');
    const pdfPath = path.join(documentsPath, `report-week-${selectedWeek}.pdf`);
    const pdfBuffer = await win.webContents.printToPDF({
      printBackground: true,
      marginsType: 1,
      pageSize: 'A4',
      landscape: false
    });
    fs.writeFileSync(pdfPath, pdfBuffer);
    win.destroy();
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