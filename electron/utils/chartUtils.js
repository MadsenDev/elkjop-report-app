const getChartConfig = (currentTotals, prevTotals) => {
  return {
    type: 'bar',
    data: {
      labels: ['Gross Margin', 'Insurance Agreements', 'Precalibrated TVs', 'Repair Tickets'],
      datasets: [
        {
          label: 'Current Week (AVS)',
          data: [currentTotals.avs, null, null, null],
          backgroundColor: '#75BC26',
          borderColor: '#75BC26',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: 'Previous Week (AVS)',
          data: [prevTotals.avs, null, null, null],
          backgroundColor: '#041752',
          borderColor: '#041752',
          borderWidth: 1,
          yAxisID: 'y'
        },
        {
          label: 'Current Week (Count)',
          data: [null, currentTotals.insurance, currentTotals.precalibrated, currentTotals.repair],
          backgroundColor: '#75BC26',
          borderColor: '#75BC26',
          borderWidth: 1,
          yAxisID: 'y1'
        },
        {
          label: 'Previous Week (Count)',
          data: [null, prevTotals.insurance, prevTotals.precalibrated, prevTotals.repair],
          backgroundColor: '#041752',
          borderColor: '#041752',
          borderWidth: 1,
          yAxisID: 'y1'
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          type: 'linear',
          display: true,
          position: 'left',
          title: {
            display: true,
            text: 'Gross Margin (NOK)'
          },
          beginAtZero: true
        },
        y1: {
          type: 'linear',
          display: true,
          position: 'right',
          title: {
            display: true,
            text: 'Count'
          },
          beginAtZero: true,
          grid: {
            drawOnChartArea: false
          }
        }
      },
      plugins: {
        legend: {
          position: 'top'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              const label = context.dataset.label || '';
              const value = context.raw;
              if (value === null) return null;
              if (context.dataIndex === 0) {
                return label + ': ' + new Intl.NumberFormat('no-NO', { style: 'currency', currency: 'NOK' }).format(value);
              }
              return label + ': ' + value + ' units';
            }
          }
        }
      }
    }
  };
};

module.exports = {
  getChartConfig
}; 