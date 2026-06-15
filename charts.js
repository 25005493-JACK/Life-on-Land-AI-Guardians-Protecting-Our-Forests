/**
 * South American Deforestation Dashboard - Charts Module
 * Configures the Dual-Axis Relational Chart correlating forest cover to clearance rates.
 */

// Custom plugin to draw vertical scrub-guide line on the chart
const activeYearLinePlugin = {
  id: 'activeYearLine',
  afterDraw: (chart) => {
    const activeYear = chart.config.options.plugins.activeYearLine?.year;
    if (!activeYear) return;

    const ctx = chart.ctx;
    const xAxis = chart.scales.x;
    const yLeft = chart.scales.y;
    const yRight = chart.scales.y1;
    
    const index = chart.data.labels.indexOf(activeYear.toString());
    if (index !== -1) {
      const x = xAxis.getPixelForValue(index);
      
      ctx.save();
      // Draw vertical guide line
      ctx.beginPath();
      ctx.moveTo(x, yLeft.top);
      ctx.lineTo(x, yLeft.bottom);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.setLineDash([5, 5]);
      ctx.stroke();

      // Draw intersections
      // 1. Forest Cover (Left dataset)
      const metaLeft = chart.getDatasetMeta(0);
      const yL = metaLeft.data[index].y;
      ctx.beginPath();
      ctx.arc(x, yL, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#10b981';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();

      // 2. Deforestation Rate (Right dataset)
      const metaRight = chart.getDatasetMeta(1);
      const yR = metaRight.data[index].y;
      ctx.beginPath();
      ctx.arc(x, yR, 5, 0, 2 * Math.PI);
      ctx.fillStyle = '#ef4444';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.fill();
      ctx.stroke();

      ctx.restore();
    }
  }
};

// Register custom vertical guide line plugin
Chart.register(activeYearLinePlugin);

const ForestCharts = {
  chart: null,

  /**
   * Initializes the dual-axis chart
   */
  init: function(country, currentYear) {
    const ctx = document.getElementById('relational-chart').getContext('2d');
    const years = Object.keys(DEFORESTATION_DATA.countries[country].stats);
    
    // Forest Cover (in 1000 km²)
    const coverData = years.map(y => DEFORESTATION_DATA.countries[country].stats[y][0]);
    // Deforestation Loss Rate (in km²)
    const lossData = years.map(y => DEFORESTATION_DATA.countries[country].stats[y][1]);

    this.chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: years,
        datasets: [
          {
            label: 'Remaining Forest (km²)',
            data: coverData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: false,
            borderWidth: 2.5,
            tension: 0.3,
            pointRadius: 0,
            yAxisID: 'y'
          },
          {
            label: 'Annual Deforestation Rate (km²/year)',
            data: lossData,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.05)',
            fill: true,
            borderWidth: 2,
            tension: 0.35,
            pointRadius: 0,
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              color: '#f8fafc',
              font: { family: 'Inter', size: 10 },
              boxWidth: 12
            }
          },
          tooltip: {
            mode: 'index',
            intersect: false,
            backgroundColor: 'rgba(10, 15, 30, 0.85)',
            titleColor: '#fff',
            titleFont: { family: 'Outfit', weight: 'bold' },
            bodyFont: { family: 'Inter' },
            borderColor: 'rgba(255,255,255,0.08)',
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                if (context.datasetIndex === 0) {
                  return ` Forest Cover: ${context.parsed.y.toLocaleString()} km²`;
                } else {
                  return ` Loss Rate: ${context.parsed.y.toLocaleString()} km²/yr`;
                }
              }
            }
          },
          activeYearLine: {
            year: currentYear
          }
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: '#94a3b8',
              font: { size: 9, family: 'Inter' }
            }
          },
          // Left Y-Axis: Forest Cover
          y: {
            position: 'left',
            grid: {
              color: 'rgba(255, 255, 255, 0.05)',
              drawTicks: false
            },
            ticks: {
              color: '#10b981',
              font: { size: 9, family: 'Inter' },
              callback: function(value) {
                return (value / 1000000).toFixed(2) + 'M';
              }
            },
            title: {
              display: true,
              text: 'Forest Cover (km²)',
              color: '#10b981',
              font: { size: 9.5, family: 'Inter', weight: 'bold' }
            }
          },
          // Right Y-Axis: Annual Loss Rate
          y1: {
            position: 'right',
            grid: { drawOnChartArea: false }, // avoid double gridlines
            ticks: {
              color: '#ef4444',
              font: { size: 9, family: 'Inter' },
              callback: function(value) {
                return (value / 1000) + 'k';
              }
            },
            title: {
              display: true,
              text: 'Loss Rate (km²/year)',
              color: '#ef4444',
              font: { size: 9.5, family: 'Inter', weight: 'bold' }
            }
          }
        }
      }
    });
  },

  /**
   * Refreshes chart views
   */
  update: function(country, year) {
    if (!this.chart) return;

    const statsObj = DEFORESTATION_DATA.countries[country].stats;
    const years = Object.keys(statsObj);
    const coverData = years.map(y => statsObj[y][0]);
    const lossData = years.map(y => statsObj[y][1]);

    this.chart.data.labels = years;
    this.chart.data.datasets[0].data = coverData;
    this.chart.data.datasets[1].data = lossData;
    
    this.chart.options.plugins.activeYearLine.year = year;
    this.chart.update('none');
  }
};
