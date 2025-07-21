/**
 * XRPL Liquidity Provider Bot - Report Generator
 * Copyright (c) 2024-2025 - MIT License
 * 
 * Live Validation Arena - HTML Report Generator
 * 
 * Generates interactive HTML reports with Chart.js visualizations.
 */

const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

/**
 * Generate HTML report from test results
 * @param {Array} results - Test results
 * @param {string} outputFile - Output file path
 * @param {Object} options - Report options
 * @returns {Promise<boolean>} - Whether generation was successful
 */
async function generateHtmlReport(results, outputFile, options = {}) {
  try {
    const title = options.title || 'XRPL Liquidity Provider Bot - Test Report';
    const stressTest = options.stressTest || false;
    
    // Create HTML content
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels"></script>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      padding: 20px;
      background-color: #f8f9fa;
    }
    .card {
      margin-bottom: 20px;
      border-radius: 10px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .card-header {
      background-color: #343a40;
      color: white;
      border-radius: 10px 10px 0 0 !important;
      padding: 15px;
    }
    .chart-container {
      position: relative;
      height: 300px;
      margin: 20px 0;
    }
    .summary-item {
      padding: 10px;
      border-radius: 5px;
      margin-bottom: 10px;
      background-color: #e9ecef;
    }
    .eco-bonus {
      background-color: #d4edda;
      color: #155724;
    }
    .volatility-warning {
      background-color: #f8d7da;
      color: #721c24;
    }
    .rebalance-info {
      background-color: #d1ecf1;
      color: #0c5460;
    }
    .badge-eco {
      background-color: #28a745;
      color: white;
    }
    .badge-stable {
      background-color: #17a2b8;
      color: white;
    }
    .badge-volatile {
      background-color: #dc3545;
      color: white;
    }
    .badge-standard {
      background-color: #6c757d;
      color: white;
    }
    .print-button {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 100;
    }
    @media print {
      .print-button {
        display: none;
      }
      .card {
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container-fluid">
    <div class="row mb-4">
      <div class="col-12">
        <h1 class="display-4 text-center">${title}</h1>
        <p class="lead text-center">Generated on ${new Date().toLocaleString()}</p>
        <div class="d-flex justify-content-center">
          <span class="badge ${stressTest ? 'badge-volatile' : 'badge-standard'} p-2 mx-1">
            ${stressTest ? 'Stress Test Mode' : 'Standard Mode'}
          </span>
          <span class="badge badge-info p-2 mx-1">${results.length} Scenarios</span>
        </div>
      </div>
    </div>

    <div class="row mb-4">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h2 class="mb-0">Summary</h2>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6">
                <div class="chart-container">
                  <canvas id="summaryChart"></canvas>
                </div>
              </div>
              <div class="col-md-6">
                <div class="chart-container">
                  <canvas id="ecoChart"></canvas>
                </div>
              </div>
            </div>
            <div class="row mt-3">
              <div class="col-12">
                <h4>Key Findings</h4>
                <div id="keyFindings"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row" id="scenarioCards">
      ${results.map((result, index) => `
        <div class="col-12 mb-4">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h3 class="mb-0">${result.scenario}</h3>
              <span class="badge ${result.shouldRebalance ? 'badge-volatile' : 'badge-standard'} p-2">
                ${result.shouldRebalance ? 'Rebalance Required' : 'Stable Allocation'}
              </span>
            </div>
            <div class="card-body">
              <p class="lead">${result.description}</p>
              
              <div class="row">
                <div class="col-md-6">
                  <div class="chart-container">
                    <canvas id="allocationChart${index}"></canvas>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="chart-container">
                    <canvas id="monteCarloChart${index}"></canvas>
                  </div>
                </div>
              </div>
              
              <div class="row mt-3">
                <div class="col-md-6">
                  <h4>Eco Bonuses</h4>
                  <div class="chart-container">
                    <canvas id="ecoBonusChart${index}"></canvas>
                  </div>
                </div>
                <div class="col-md-6">
                  <h4>Federation Insights</h4>
                  <div class="chart-container">
                    <canvas id="federationChart${index}"></canvas>
                  </div>
                </div>
              </div>
              
              ${result.shouldRebalance ? `
                <div class="row mt-3">
                  <div class="col-12">
                    <h4>Rebalance Details</h4>
                    <div class="chart-container">
                      <canvas id="rebalanceChart${index}"></canvas>
                    </div>
                  </div>
                </div>
              ` : ''}
              
              <div class="row mt-3">
                <div class="col-12">
                  <h4>Volatility Changes</h4>
                  <div class="chart-container">
                    <canvas id="volatilityChart${index}"></canvas>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  </div>
  
  <button class="btn btn-primary print-button" onclick="window.print()">
    <i class="bi bi-printer"></i> Print/Export Report
  </button>

  <script>
    // Chart.js configuration
    Chart.defaults.font.family = "'Segoe UI', 'Helvetica Neue', 'Helvetica', 'Arial', sans-serif";
    Chart.defaults.color = '#343a40';
    Chart.defaults.plugins.tooltip.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    Chart.defaults.plugins.legend.position = 'top';
    
    // Test results data
    const results = ${JSON.stringify(results)};
    
    // Color schemes
    const poolColors = {
      'XRP_RLUSD': '#2563eb',
      'XRP_SOLAR': '#16a34a',
      'RLUSD_GOLD': '#ca8a04',
      'XRP_ETH': '#9333ea',
      'XRP_CARBON': '#15803d'
    };
    
    // Helper function to get color for a pool
    function getPoolColor(poolId) {
      return poolColors[poolId] || '#6b7280';
    }
    
    // Helper function to format currency
    function formatCurrency(value) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    
    // Helper function to format percentage
    function formatPercent(value) {
      return new Intl.NumberFormat('en-US', {
        style: 'percent',
        minimumFractionDigits: 1,
        maximumFractionDigits: 1
      }).format(value / 100);
    }
    
    // Generate summary chart
    function generateSummaryChart() {
      const ctx = document.getElementById('summaryChart').getContext('2d');
      
      // Calculate average APY per scenario
      const labels = results.map(r => r.scenario);
      const data = results.map(r => r.optimizationResult.expectedApy);
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Expected APY (%)',
            data: data,
            backgroundColor: '#2563eb',
            borderColor: '#1e40af',
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Expected APY by Scenario'
            },
            datalabels: {
              formatter: (value) => value.toFixed(1) + '%',
              color: '#fff',
              font: {
                weight: 'bold'
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'APY (%)'
              }
            }
          }
        }
      });
    }
    
    // Generate eco bonus chart
    function generateEcoChart() {
      const ctx = document.getElementById('ecoChart').getContext('2d');
      
      // Get all unique pool IDs
      const allPoolIds = new Set();
      results.forEach(result => {
        Object.keys(result.ecoBonuses).forEach(poolId => {
          allPoolIds.add(poolId);
        });
      });
      
      // Calculate average eco bonus per pool
      const poolIds = Array.from(allPoolIds);
      const ecoBonuses = poolIds.map(poolId => {
        const bonuses = results
          .map(r => r.ecoBonuses[poolId] || 0)
          .filter(bonus => bonus > 0);
        
        return bonuses.length > 0 
          ? bonuses.reduce((sum, bonus) => sum + bonus, 0) / bonuses.length * 100
          : 0;
      });
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: poolIds,
          datasets: [{
            label: 'Eco Bonus (%)',
            data: ecoBonuses,
            backgroundColor: poolIds.map(id => getPoolColor(id)),
            borderColor: poolIds.map(id => {
              const color = getPoolColor(id);
              return color.replace('rgb', 'rgba').replace(')', ', 0.8)');
            }),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Eco Bonus by Pool'
            },
            datalabels: {
              formatter: (value) => value.toFixed(1) + '%',
              color: '#fff',
              font: {
                weight: 'bold'
              },
              display: (context) => context.dataset.data[context.dataIndex] > 0
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Bonus (%)'
              }
            }
          }
        }
      });
    }
    
    // Generate key findings
    function generateKeyFindings() {
      const keyFindingsElement = document.getElementById('keyFindings');
      
      // Calculate average APY
      const avgApy = results.reduce((sum, r) => sum + r.optimizationResult.expectedApy, 0) / results.length;
      
      // Find highest APY scenario
      const highestApyResult = results.reduce((max, r) => 
        r.optimizationResult.expectedApy > max.optimizationResult.expectedApy ? r : max, results[0]);
      
      // Find most volatile scenario
      const mostVolatileResult = results.reduce((max, r) => {
        const maxVolChange = Math.max(...Object.values(r.volatilityChanges).map(v => v || 0));
        const prevMaxVolChange = Math.max(...Object.values(max.volatilityChanges).map(v => v || 0));
        return maxVolChange > prevMaxVolChange ? r : max;
      }, results[0]);
      
      // Count rebalance scenarios
      const rebalanceCount = results.filter(r => r.shouldRebalance).length;
      
      // Find highest eco bonus
      let highestEcoBonus = 0;
      let highestEcoBonusPool = '';
      
      results.forEach(result => {
        Object.entries(result.ecoBonuses).forEach(([poolId, bonus]) => {
          if (bonus > highestEcoBonus) {
            highestEcoBonus = bonus;
            highestEcoBonusPool = poolId;
          }
        });
      });
      
      // Generate HTML
      keyFindingsElement.innerHTML = `
        <div class="row">
          <div class="col-md-6">
            <div class="summary-item">
              <strong>Average Expected APY:</strong> ${avgApy.toFixed(2)}%
            </div>
            <div class="summary-item">
              <strong>Highest APY Scenario:</strong> ${highestApyResult.scenario} (${highestApyResult.optimizationResult.expectedApy.toFixed(2)}%)
            </div>
            <div class="summary-item ${rebalanceCount > 0 ? 'rebalance-info' : ''}">
              <strong>Rebalance Required:</strong> ${rebalanceCount} of ${results.length} scenarios
            </div>
          </div>
          <div class="col-md-6">
            <div class="summary-item volatility-warning">
              <strong>Most Volatile Scenario:</strong> ${mostVolatileResult.scenario}
            </div>
            <div class="summary-item eco-bonus">
              <strong>Highest Eco Bonus:</strong> ${highestEcoBonusPool} (${(highestEcoBonus * 100).toFixed(2)}%)
            </div>
            <div class="summary-item">
              <strong>Test Mode:</strong> ${stressTest ? 'Stress Test' : 'Standard Test'}
            </div>
          </div>
        </div>
      `;
    }
    
    // Generate allocation chart for a scenario
    function generateAllocationChart(result, index) {
      const ctx = document.getElementById(\`allocationChart\${index}\`).getContext('2d');
      
      const poolIds = Object.keys(result.optimizationResult.allocations);
      const allocations = Object.values(result.optimizationResult.allocations);
      const totalCapital = result.totalCapital;
      
      new Chart(ctx, {
        type: 'pie',
        data: {
          labels: poolIds,
          datasets: [{
            data: allocations,
            backgroundColor: poolIds.map(id => getPoolColor(id)),
            borderColor: '#ffffff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Capital Allocation'
            },
            tooltip: {
              callbacks: {
                label: function(context) {
                  const value = context.raw;
                  const percentage = (value / totalCapital * 100).toFixed(1) + '%';
                  return \`\${context.label}: \${formatCurrency(value)} (\${percentage})\`;
                }
              }
            },
            datalabels: {
              formatter: (value, ctx) => {
                const percentage = (value / totalCapital * 100).toFixed(1) + '%';
                return percentage;
              },
              color: '#fff',
              font: {
                weight: 'bold'
              }
            }
          }
        }
      });
    }
    
    // Generate Monte Carlo chart for a scenario
    function generateMonteCarloChart(result, index) {
      const ctx = document.getElementById(\`monteCarloChart\${index}\`).getContext('2d');
      
      const poolIds = Object.keys(result.monteCarloResults);
      const meanYields = poolIds.map(id => result.monteCarloResults[id].meanYield);
      const lowerBounds = poolIds.map(id => result.monteCarloResults[id].confidenceInterval[0]);
      const upperBounds = poolIds.map(id => result.monteCarloResults[id].confidenceInterval[1]);
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: poolIds,
          datasets: [{
            label: 'Mean Yield (%)',
            data: meanYields,
            backgroundColor: poolIds.map(id => getPoolColor(id)),
            borderColor: poolIds.map(id => {
              const color = getPoolColor(id);
              return color.replace('rgb', 'rgba').replace(')', ', 0.8)');
            }),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: 'Monte Carlo Yield Simulation'
            },
            tooltip: {
              callbacks: {
                afterLabel: function(context) {
                  const index = context.dataIndex;
                  return [
                    \`95% CI: [\${lowerBounds[index].toFixed(1)}%, \${upperBounds[index].toFixed(1)}%]\`,
                    \`Worst Case: \${result.monteCarloResults[poolIds[index]].worstCase.toFixed(1)}%\`,
                    \`Best Case: \${result.monteCarloResults[poolIds[index]].bestCase.toFixed(1)}%\`
                  ];
                }
              }
            },
            datalabels: {
              formatter: (value) => value.toFixed(1) + '%',
              color: '#fff',
              font: {
                weight: 'bold'
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Yield (%)'
              }
            }
          }
        }
      });
    }
    
    // Generate eco bonus chart for a scenario
    function generateEcoBonusChart(result, index) {
      const ctx = document.getElementById(\`ecoBonusChart\${index}\`).getContext('2d');
      
      const poolIds = Object.keys(result.ecoBonuses);
      const bonuses = poolIds.map(id => result.ecoBonuses[id] * 100); // Convert to percentage
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: poolIds,
          datasets: [{
            label: 'Eco Bonus (%)',
            data: bonuses,
            backgroundColor: poolIds.map(id => getPoolColor(id)),
            borderColor: poolIds.map(id => {
              const color = getPoolColor(id);
              return color.replace('rgb', 'rgba').replace(')', ', 0.8)');
            }),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              formatter: (value) => value.toFixed(1) + '%',
              color: '#fff',
              font: {
                weight: 'bold'
              },
              display: (context) => context.dataset.data[context.dataIndex] > 0
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Bonus (%)'
              }
            }
          }
        }
      });
    }
    
    // Generate federation chart for a scenario
    function generateFederationChart(result, index) {
      const ctx = document.getElementById(\`federationChart\${index}\`).getContext('2d');
      
      const poolIds = Object.keys(result.federatedInsights);
      const avgApys = poolIds.map(id => result.federatedInsights[id].averageApy);
      const peerCounts = poolIds.map(id => result.federatedInsights[id].peerCount);
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: poolIds,
          datasets: [
            {
              label: 'Federation Avg APY (%)',
              data: avgApys,
              backgroundColor: poolIds.map(id => getPoolColor(id)),
              borderColor: poolIds.map(id => {
                const color = getPoolColor(id);
                return color.replace('rgb', 'rgba').replace(')', ', 0.8)');
              }),
              borderWidth: 1,
              yAxisID: 'y'
            },
            {
              label: 'Peer Count',
              data: peerCounts,
              backgroundColor: 'rgba(75, 192, 192, 0.5)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 1,
              type: 'line',
              yAxisID: 'y1'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              formatter: (value, context) => {
                if (context.dataset.yAxisID === 'y') {
                  return value.toFixed(1) + '%';
                }
                return value;
              },
              color: '#fff',
              font: {
                weight: 'bold'
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              position: 'left',
              title: {
                display: true,
                text: 'APY (%)'
              }
            },
            y1: {
              beginAtZero: true,
              position: 'right',
              grid: {
                drawOnChartArea: false
              },
              title: {
                display: true,
                text: 'Peer Count'
              },
              max: 10
            }
          }
        }
      });
    }
    
    // Generate volatility chart for a scenario
    function generateVolatilityChart(result, index) {
      const ctx = document.getElementById(\`volatilityChart\${index}\`).getContext('2d');
      
      const poolIds = Object.keys(result.volatilityChanges);
      const changes = poolIds.map(id => result.volatilityChanges[id] || 0);
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: poolIds,
          datasets: [{
            label: 'Volatility Change',
            data: changes,
            backgroundColor: poolIds.map(id => getPoolColor(id)),
            borderColor: poolIds.map(id => {
              const color = getPoolColor(id);
              return color.replace('rgb', 'rgba').replace(')', ', 0.8)');
            }),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            datalabels: {
              formatter: (value) => value.toFixed(2),
              color: '#fff',
              font: {
                weight: 'bold'
              },
              display: (context) => context.dataset.data[context.dataIndex] > 0
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Volatility Change'
              }
            }
          }
        }
      });
    }
    
    // Generate rebalance chart for a scenario
    function generateRebalanceChart(result, index) {
      if (!result.shouldRebalance || !result.rebalanceResult) {
        return;
      }
      
      const ctx = document.getElementById(\`rebalanceChart\${index}\`).getContext('2d');
      
      const poolIds = Object.keys(result.rebalanceResult.changes);
      const changes = poolIds.map(id => result.rebalanceResult.changes[id]);
      
      new Chart(ctx, {
        type: 'bar',
        data: {
          labels: poolIds,
          datasets: [{
            label: 'Allocation Change',
            data: changes,
            backgroundColor: changes.map(change => change >= 0 ? '#16a34a' : '#dc2626'),
            borderColor: changes.map(change => change >= 0 ? '#15803d' : '#b91c1c'),
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            title: {
              display: true,
              text: \`Rebalance (New APY: \${result.rebalanceResult.expectedApy.toFixed(2)}%)\`
            },
            datalabels: {
              formatter: (value) => formatCurrency(value),
              color: '#fff',
              font: {
                weight: 'bold'
              }
            }
          },
          scales: {
            y: {
              title: {
                display: true,
                text: 'Change Amount'
              }
            }
          }
        }
      });
    }
    
    // Initialize all charts
    window.addEventListener('load', function() {
      // Register Chart.js plugins
      Chart.register(ChartDataLabels);
      
      // Generate summary charts
      generateSummaryChart();
      generateEcoChart();
      generateKeyFindings();
      
      // Generate scenario charts
      results.forEach((result, index) => {
        generateAllocationChart(result, index);
        generateMonteCarloChart(result, index);
        generateEcoBonusChart(result, index);
        generateFederationChart(result, index);
        generateVolatilityChart(result, index);
        
        if (result.shouldRebalance && result.rebalanceResult) {
          generateRebalanceChart(result, index);
        }
      });
    });
  </script>
</body>
</html>
    `;
    
    // Write HTML to file
    fs.writeFileSync(outputFile, html);
    
    logger.info(`Generated HTML report: ${outputFile}`);
    return true;
  } catch (error) {
    logger.error(`Failed to generate HTML report: ${error.message}`);
    return false;
  }
}

module.exports = {
  generateHtmlReport
};
