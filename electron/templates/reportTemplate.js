const getReportTemplate = ({
  weekNumber,
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
}) => {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8">
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
          body { 
            font-family: 'Segoe UI', sans-serif;
            margin: 0;
            padding: 20px;
            font-size: 12px;
          }
          .header { 
            text-align: center; 
            margin-bottom: 15px;
            border-bottom: 2px solid #75BC26;
            padding-bottom: 10px;
          }
          .section { 
            margin-bottom: 15px;
            background: #f8fafc;
            padding: 12px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          .grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
            margin-bottom: 15px;
          }
          .metric {
            background: white;
            padding: 12px;
            border-radius: 6px;
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
            border-top: 3px solid #75BC26;
          }
          .metric-value {
            font-size: 20px;
            font-weight: bold;
            color: #75BC26;
          }
          .metric-label {
            color: #041752;
            font-size: 12px;
            margin-bottom: 4px;
            font-weight: 500;
          }
          .metric-goal {
            color: #64748b;
            font-size: 11px;
          }
          .top-performer {
            font-size: 11px;
            color: #475569;
            margin-top: 4px;
          }
          .top-performer strong {
            color: #75BC26;
          }
          table { 
            width: 100%; 
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 11px;
          }
          th, td { 
            border: 1px solid #e2e8f0; 
            padding: 8px; 
            text-align: left;
          }
          th { 
            background-color: #75BC26;
            color: white;
            font-weight: 500;
          }
          tr:nth-child(even) {
            background-color: #f1f5f9;
          }
          h1 {
            color: #041752;
            margin: 0;
            font-size: 24px;
          }
          h2 {
            color: #041752;
            margin: 0 0 10px 0;
            font-size: 16px;
          }
          .summary {
            font-size: 11px;
            color: #475569;
            margin-top: 4px;
          }
          .progress-bar {
            background-color: #e2e8f0;
            height: 6px;
            border-radius: 3px;
            margin-top: 4px;
          }
          .progress-bar-fill {
            background-color: #75BC26;
            height: 100%;
            border-radius: 3px;
          }
          .week-info {
            color: #041752;
            font-size: 14px;
            margin-top: 5px;
          }
          .chart-container {
            margin-top: 20px;
            height: 200px;
          }
          .comparison {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-top: 4px;
            font-size: 11px;
          }
          .comparison.positive {
            color: #059669;
          }
          .comparison.negative {
            color: #dc2626;
          }
          .comparison-value {
            font-weight: 500;
          }
          .logo-bottom-right {
            position: fixed;
            right: 30px;
            bottom: 20px;
            width: 180px;
            opacity: 0.95;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>ASO Weekly Performance Report</h1>
          <div class="week-info">
            Week ${weekNumber} (${weekDates.monday} - ${weekDates.sunday})
          </div>
        </div>
        
        <div class="grid">
          <div class="metric">
            <div class="metric-label">Gross Margin</div>
            <div class="metric-value">${currentTotals.avs}</div>
            <div class="metric-goal">Goal: ${goalsData.find(g => g.section === 'AVS')?.goals[5] || 0}</div>
            <div class="comparison ${currentTotals.avs >= prevTotals.avs ? 'positive' : 'negative'}">
              vs Previous Week: <span class="comparison-value">${((currentTotals.avs - prevTotals.avs) / (prevTotals.avs || 1) * 100).toFixed(1)}%</span>
            </div>
            ${topAVS ? `<div class="top-performer">Top Performer: <strong>${topAVS[0]}</strong> (${topAVS[1].gm} GM, ${topAVS[1].sales} sales)</div>` : ''}
          </div>
          <div class="metric">
            <div class="metric-label">Insurance Agreements</div>
            <div class="metric-value">${currentTotals.insurance}</div>
            <div class="metric-goal">Goal: ${goalsData.find(g => g.section === 'Insurance Agreements')?.goals[5] || 0}</div>
            <div class="comparison ${currentTotals.insurance >= prevTotals.insurance ? 'positive' : 'negative'}">
              vs Previous Week: <span class="comparison-value">${((currentTotals.insurance - prevTotals.insurance) / (prevTotals.insurance || 1) * 100).toFixed(1)}%</span>
            </div>
            ${topInsurance ? `<div class="top-performer">Top Performer: <strong>${topInsurance[0]}</strong> (${topInsurance[1]} sales)</div>` : ''}
          </div>
          <div class="metric">
            <div class="metric-label">Precalibrated TVs</div>
            <div class="metric-value">${currentTotals.precalibrated}</div>
            <div class="metric-goal">Goal: ${goalsData.find(g => g.section === 'Precalibrated TVs')?.goals[5] || 0}</div>
            <div class="comparison ${currentTotals.precalibrated >= prevTotals.precalibrated ? 'positive' : 'negative'}">
              vs Previous Week: <span class="comparison-value">${((currentTotals.precalibrated - prevTotals.precalibrated) / (prevTotals.precalibrated || 1) * 100).toFixed(1)}%</span>
            </div>
            ${topPrecalibrated ? `<div class="top-performer">Top Performer: <strong>${topPrecalibrated[0]}</strong> (${topPrecalibrated[1]} completed)</div>` : ''}
          </div>
          <div class="metric">
            <div class="metric-label">Repair Tickets Created</div>
            <div class="metric-value">${currentTotals.repair}</div>
            <div class="metric-goal">Goal: ${goalsData.find(g => g.section === 'RepairTickets')?.goals[5] || 0}</div>
            <div class="comparison ${currentTotals.repair >= prevTotals.repair ? 'positive' : 'negative'}">
              vs Previous Week: <span class="comparison-value">${((currentTotals.repair - prevTotals.repair) / (prevTotals.repair || 1) * 100).toFixed(1)}%</span>
            </div>
            ${topRepair ? `<div class="top-performer">Top Performer: <strong>${topRepair[0]}</strong> (${topRepair[1]} created)</div>` : ''}
          </div>
        </div>
        
        <div class="section">
          <h2>Performance Summary</h2>
          <table>
            <tr>
              <th>Category</th>
              <th>Current Week</th>
              <th>Previous Week</th>
              <th>Change</th>
              <th>Goal</th>
              <th>Progress</th>
              <th>Top Performer</th>
            </tr>
            <tr>
              <td>Gross Margin</td>
              <td>${currentTotals.avs}</td>
              <td>${prevTotals.avs}</td>
              <td class="${currentTotals.avs >= prevTotals.avs ? 'positive' : 'negative'}">
                ${((currentTotals.avs - prevTotals.avs) / (prevTotals.avs || 1) * 100).toFixed(1)}%
              </td>
              <td>${goalsData.find(g => g.section === 'AVS')?.goals[5] || 0}</td>
              <td>
                ${((currentTotals.avs / (goalsData.find(g => g.section === 'AVS')?.goals[5] || 1)) * 100).toFixed(1)}%
                <div class="progress-bar">
                  <div class="progress-bar-fill" style="width: ${Math.min(((currentTotals.avs / (goalsData.find(g => g.section === 'AVS')?.goals[5] || 1)) * 100), 100)}%"></div>
                </div>
              </td>
              <td>${topAVS ? `${topAVS[0]} (${topAVS[1].gm} GM)` : 'N/A'}</td>
            </tr>
            <tr>
              <td>Insurance Agreements</td>
              <td>${currentTotals.insurance}</td>
              <td>${prevTotals.insurance}</td>
              <td class="${currentTotals.insurance >= prevTotals.insurance ? 'positive' : 'negative'}">
                ${((currentTotals.insurance - prevTotals.insurance) / (prevTotals.insurance || 1) * 100).toFixed(1)}%
              </td>
              <td>${goalsData.find(g => g.section === 'Insurance Agreements')?.goals[5] || 0}</td>
              <td>
                ${((currentTotals.insurance / (goalsData.find(g => g.section === 'Insurance Agreements')?.goals[5] || 1)) * 100).toFixed(1)}%
                <div class="progress-bar">
                  <div class="progress-bar-fill" style="width: ${Math.min(((currentTotals.insurance / (goalsData.find(g => g.section === 'Insurance Agreements')?.goals[5] || 1)) * 100), 100)}%"></div>
                </div>
              </td>
              <td>${topInsurance ? `${topInsurance[0]} (${topInsurance[1]} sales)` : 'N/A'}</td>
            </tr>
            <tr>
              <td>Precalibrated TVs</td>
              <td>${currentTotals.precalibrated}</td>
              <td>${prevTotals.precalibrated}</td>
              <td class="${currentTotals.precalibrated >= prevTotals.precalibrated ? 'positive' : 'negative'}">
                ${((currentTotals.precalibrated - prevTotals.precalibrated) / (prevTotals.precalibrated || 1) * 100).toFixed(1)}%
              </td>
              <td>${goalsData.find(g => g.section === 'Precalibrated TVs')?.goals[5] || 0}</td>
              <td>
                ${((currentTotals.precalibrated / (goalsData.find(g => g.section === 'Precalibrated TVs')?.goals[5] || 1)) * 100).toFixed(1)}%
                <div class="progress-bar">
                  <div class="progress-bar-fill" style="width: ${Math.min(((currentTotals.precalibrated / (goalsData.find(g => g.section === 'Precalibrated TVs')?.goals[5] || 1)) * 100), 100)}%"></div>
                </div>
              </td>
              <td>${topPrecalibrated ? `${topPrecalibrated[0]} (${topPrecalibrated[1]} completed)` : 'N/A'}</td>
            </tr>
            <tr>
              <td>Repair Tickets</td>
              <td>${currentTotals.repair}</td>
              <td>${prevTotals.repair}</td>
              <td class="${currentTotals.repair >= prevTotals.repair ? 'positive' : 'negative'}">
                ${((currentTotals.repair - prevTotals.repair) / (prevTotals.repair || 1) * 100).toFixed(1)}%
              </td>
              <td>${goalsData.find(g => g.section === 'RepairTickets')?.goals[5] || 0}</td>
              <td>
                ${((currentTotals.repair / (goalsData.find(g => g.section === 'RepairTickets')?.goals[5] || 1)) * 100).toFixed(1)}%
                <div class="progress-bar">
                  <div class="progress-bar-fill" style="width: ${Math.min(((currentTotals.repair / (goalsData.find(g => g.section === 'RepairTickets')?.goals[5] || 1)) * 100), 100)}%"></div>
                </div>
              </td>
              <td>${topRepair ? `${topRepair[0]} (${topRepair[1]} created)` : 'N/A'}</td>
            </tr>
          </table>
        </div>

        <div class="section">
          <h2>Week-over-Week Comparison</h2>
          <div class="chart-container">
            <canvas id="comparisonChart"></canvas>
          </div>
        </div>

        <script>
          const ctx = document.getElementById('comparisonChart').getContext('2d');
          new Chart(ctx, ${JSON.stringify(chartConfig)});
        </script>
        <img src="${logoPath}" class="logo-bottom-right" alt="Elkjøp logo" />
      </body>
    </html>
  `;
};

module.exports = {
  getReportTemplate
}; 