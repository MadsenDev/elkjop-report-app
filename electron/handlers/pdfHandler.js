const puppeteer = require('puppeteer');
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
    // Parse year and week from selectedWeek
    const [year, week] = selectedWeek.split('-').map(Number);

    // Calculate totals for current week
    const currentTotals = {
      avs: avsAssignments.reduce((sum, a) => sum + (a.gm || 0), 0),
      insurance: insuranceAgreements.reduce((sum, a) => sum + (a.sold || 0), 0),
      precalibrated: precalibratedTVs.reduce((sum, a) => sum + (a.completed || 0), 0),
      repair: repairTickets.reduce((sum, a) => sum + (a.completed || 0), 0)
    };

    // Calculate totals for previous week
    const prevTotals = {
      avs: prevWeekData[0].reduce((sum, a) => sum + (a.gm || 0), 0),
      insurance: prevWeekData[1].reduce((sum, a) => sum + (a.sold || 0), 0),
      precalibrated: prevWeekData[2].reduce((sum, a) => sum + (a.completed || 0), 0),
      repair: prevWeekData[3].reduce((sum, a) => sum + (a.completed || 0), 0)
    };

    // Calculate top performers
    const topAVS = Object.entries(
      avsAssignments.reduce((acc, a) => {
        if (!acc[a.person]) {
          acc[a.person] = { gm: 0, sales: 0 };
        }
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

    // Get week dates
    const weekDates = getWeekDates(year, week);

    // Generate chart configuration
    const chartConfig = getChartConfig(currentTotals, prevTotals);

    // Create temporary HTML file
    const tempHtmlPath = path.join(__dirname, 'temp-report.html');
    const logoPath = `file://${path.join(__dirname, '..', '..', 'src', 'assets', 'elkjop_logo.png')}`;
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
      logoPath
    });

    fs.writeFileSync(tempHtmlPath, htmlContent);

    // Launch browser and generate PDF
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(`file://${tempHtmlPath}`);

    // Wait for chart to render
    await page.evaluate(() => {
      return new Promise((resolve) => {
        const checkChart = () => {
          const canvas = document.getElementById('comparisonChart');
          if (canvas && canvas.getContext('2d')) {
            resolve();
          } else {
            setTimeout(checkChart, 100);
          }
        };
        checkChart();
      });
    });

    // Generate PDF in user's Documents folder
    const documentsPath = path.join(os.homedir(), 'Documents');
    const pdfPath = path.join(documentsPath, `report-week-${selectedWeek}.pdf`);
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
      }
    });

    await browser.close();
    fs.unlinkSync(tempHtmlPath);

    return { success: true, path: pdfPath };
  } catch (error) {
    console.error('Error generating PDF:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  generatePDF
}; 