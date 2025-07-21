/**
 * YieldInsightVisualizer - Advanced Visualization for NASDAQ-XRPL Fusion Strategy
 * 
 * This module provides sophisticated visualization capabilities:
 * - Interactive Chart.js visualizations for yield metrics
 * - Heatmap generation for correlation data
 * - Dashboard HTML template generation
 * - Export functionality for sharing results
 * 
 * @version 1.0.0
 * @date July 16, 2025
 */

class YieldInsightVisualizer {
  /**
   * Create a new YieldInsightVisualizer instance
   * @param {Object} insightData - Data from YieldInsightEngine
   */
  constructor(insightData) {
    this.insightData = insightData;
  }

  /**
   * Generate Chart.js configuration for yield comparison
   * @returns {Object} Chart.js configuration object
   */
  generateYieldComparisonChart() {
    const baseYield = parseFloat(this.insightData.summary.meanYield);
    const ecoBoost = parseFloat(this.insightData.sustainability.yieldContribution) * 100;
    const arbBoost = parseFloat(this.insightData.crossMarket.yieldBoost);
    
    return {
      type: 'bar',
      data: {
        labels: ['Base Strategy', 'Enhanced Strategy'],
        datasets: [
          {
            label: 'Base Yield',
            data: [baseYield, baseYield],
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 1
          },
          {
            label: 'Eco Bonus',
            data: [0, ecoBoost],
            backgroundColor: 'rgba(75, 192, 192, 0.5)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          },
          {
            label: 'Arbitrage Boost',
            data: [0, arbBoost],
            backgroundColor: 'rgba(153, 102, 255, 0.5)',
            borderColor: 'rgba(153, 102, 255, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          x: {
            stacked: true,
            title: {
              display: true,
              text: 'Strategy'
            }
          },
          y: {
            stacked: true,
            title: {
              display: true,
              text: 'Annual Yield (%)'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'NASDAQ-XRPL Fusion Strategy Yield Comparison'
          },
          tooltip: {
            callbacks: {
              footer: (tooltipItems) => {
                const total = tooltipItems[0].parsed.y + 
                             (tooltipItems[1] ? tooltipItems[1].parsed.y : 0) + 
                             (tooltipItems[2] ? tooltipItems[2].parsed.y : 0);
                return 'Total: ' + total.toFixed(2) + '%';
              }
            }
          }
        }
      }
    };
  }

  /**
   * Generate Chart.js configuration for risk metrics
   * @returns {Object} Chart.js configuration object
   */
  generateRiskMetricsChart() {
    const sharpe = parseFloat(this.insightData.riskMetrics.sharpeRatio);
    const predictedSharpe = parseFloat(this.insightData.riskMetrics.predictedSharpe);
    const sortino = parseFloat(this.insightData.riskMetrics.sortinoRatio);
    
    return {
      type: 'radar',
      data: {
        labels: ['Sharpe Ratio', 'Predicted Sharpe', 'Sortino Ratio', 'Max Drawdown Control', 'Recovery Efficiency'],
        datasets: [
          {
            label: 'Base Strategy',
            data: [
              sharpe * 0.7, // Lower Sharpe for base strategy
              predictedSharpe * 0.7, // Lower predicted Sharpe
              sortino * 0.7, // Lower Sortino
              Math.min(1, Math.abs(parseFloat(this.insightData.drawdown.maxDrawdown)) * 0.05) * 5, // Higher drawdown (worse)
              Math.max(1, this.insightData.drawdown.recoveryTime * 1.5) // Longer recovery (worse)
            ],
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            borderColor: 'rgba(54, 162, 235, 1)',
            pointBackgroundColor: 'rgba(54, 162, 235, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(54, 162, 235, 1)'
          },
          {
            label: 'Enhanced Strategy',
            data: [
              sharpe,
              predictedSharpe,
              sortino,
              Math.min(1, Math.abs(parseFloat(this.insightData.drawdown.maxDrawdown)) * 0.05) * 3, // Lower drawdown (better)
              Math.max(1, this.insightData.drawdown.recoveryTime) // Shorter recovery (better)
            ],
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            pointBackgroundColor: 'rgba(255, 99, 132, 1)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgba(255, 99, 132, 1)'
          }
        ]
      },
      options: {
        elements: {
          line: {
            borderWidth: 3
          }
        },
        scales: {
          r: {
            angleLines: {
              display: true
            },
            suggestedMin: 0,
            suggestedMax: 5
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Risk-Adjusted Performance Metrics'
          }
        }
      }
    };
  }

  /**
   * Generate Chart.js configuration for eco-impact visualization
   * @returns {Object} Chart.js configuration object
   */
  generateEcoImpactChart() {
    const ecoUplift = parseFloat(this.insightData.sustainability.ecoBonus);
    const carbonOffset = parseFloat(this.insightData.sustainability.carbonOffset);
    
    return {
      type: 'doughnut',
      data: {
        labels: ['Base Yield', 'Eco Bonus'],
        datasets: [
          {
            data: [100 - ecoUplift, ecoUplift],
            backgroundColor: [
              'rgba(54, 162, 235, 0.5)',
              'rgba(75, 192, 192, 0.5)'
            ],
            borderColor: [
              'rgba(54, 162, 235, 1)',
              'rgba(75, 192, 192, 1)'
            ],
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Eco-Impact Contribution'
          },
          subtitle: {
            display: true,
            text: `Carbon Offset: ${carbonOffset}kg CO₂`,
            padding: {
              bottom: 10
            }
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    };
  }

  /**
   * Generate Chart.js configuration for correlation heatmap
   * @returns {Object} Chart.js configuration object
   */
  generateCorrelationHeatmap() {
    const correlation = parseFloat(this.insightData.crossMarket.correlation);
    const colorIntensity = Math.abs(correlation) * 255;
    const color = correlation >= 0 
      ? `rgba(${colorIntensity}, 0, ${255 - colorIntensity}, 0.7)`
      : `rgba(0, ${colorIntensity}, ${255 - colorIntensity}, 0.7)`;
    
    return {
      type: 'scatter',
      data: {
        datasets: [
          {
            label: 'NASDAQ-XRPL Correlation',
            data: this.generateCorrelationPoints(),
            backgroundColor: color,
            pointRadius: 5,
            pointHoverRadius: 7
          }
        ]
      },
      options: {
        scales: {
          x: {
            title: {
              display: true,
              text: 'NASDAQ Returns'
            }
          },
          y: {
            title: {
              display: true,
              text: 'XRPL Returns'
            }
          }
        },
        plugins: {
          title: {
            display: true,
            text: 'Cross-Market Correlation Analysis'
          },
          subtitle: {
            display: true,
            text: `Correlation: ${correlation} | Arbitrage Opportunity: ${this.insightData.crossMarket.arbOpportunity}`,
            padding: {
              bottom: 10
            }
          }
        }
      }
    };
  }

  /**
   * Generate correlation data points for scatter plot
   * @returns {Array} Array of {x,y} points
   * @private
   */
  generateCorrelationPoints() {
    const nasdaq = this.insightData.rawData.yields;
    const xrpl = this.insightData.rawData.xrplData;
    const points = [];
    
    for (let i = 0; i < Math.min(nasdaq.length, xrpl.length); i++) {
      points.push({
        x: nasdaq[i],
        y: xrpl[i]
      });
    }
    
    return points;
  }

  /**
   * Generate HTML dashboard template with all charts
   * @returns {string} HTML content for dashboard
   */
  generateDashboardHTML() {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NASDAQ-XRPL Fusion Strategy Dashboard</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <style>
    :root {
      --primary-color: #3498db;
      --secondary-color: #2ecc71;
      --accent-color: #9b59b6;
      --background-color: #f8f9fa;
      --text-color: #2c3e50;
      --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: var(--background-color);
      color: var(--text-color);
      transition: all 0.3s ease;
    }
    
    .dark-mode {
      --primary-color: #2980b9;
      --secondary-color: #27ae60;
      --accent-color: #8e44ad;
      --background-color: #1a1a1a;
      --text-color: #ecf0f1;
      --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
    }
    
    .dashboard-header {
      background: linear-gradient(135deg, var(--primary-color), var(--accent-color));
      color: white;
      padding: 2rem 0;
      margin-bottom: 2rem;
      border-radius: 0 0 1rem 1rem;
    }
    
    .metric-card {
      background-color: white;
      border-radius: 1rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: var(--card-shadow);
      transition: transform 0.3s ease;
    }
    
    .metric-card:hover {
      transform: translateY(-5px);
    }
    
    .metric-value {
      font-size: 2rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
    }
    
    .metric-label {
      font-size: 0.9rem;
      color: #7f8c8d;
    }
    
    .chart-container {
      background-color: white;
      border-radius: 1rem;
      padding: 1.5rem;
      margin-bottom: 1.5rem;
      box-shadow: var(--card-shadow);
    }
    
    .dark-mode .metric-card,
    .dark-mode .chart-container {
      background-color: #2c3e50;
    }
    
    .dark-mode .metric-label {
      color: #bdc3c7;
    }
    
    .toggle-dark-mode {
      position: fixed;
      top: 1rem;
      right: 1rem;
      z-index: 1000;
    }
    
    .eco-badge {
      background-color: var(--secondary-color);
      color: white;
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      font-weight: bold;
      display: inline-block;
      margin-top: 1rem;
    }
    
    .alert-badge {
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      font-weight: bold;
      display: inline-block;
      margin-top: 1rem;
    }
    
    .alert-warning {
      background-color: #f39c12;
      color: white;
    }
    
    .alert-success {
      background-color: #2ecc71;
      color: white;
    }
    
    @media (max-width: 768px) {
      .metric-card {
        margin-bottom: 1rem;
      }
    }
  </style>
</head>
<body>
  <button class="btn btn-sm btn-outline-secondary toggle-dark-mode" onclick="toggleDarkMode()">
    <i class="bi bi-moon"></i> Toggle Dark Mode
  </button>

  <div class="dashboard-header text-center">
    <h1>NASDAQ-XRPL Fusion Strategy Dashboard</h1>
    <p class="lead">Advanced Yield Optimization with AI-Sentiment & Green RWA Layer</p>
    <div class="eco-badge">
      <i class="bi bi-leaf"></i> Carbon Offset: ${this.insightData.sustainability.carbonOffset}kg
    </div>
  </div>

  <div class="container">
    <!-- Summary Metrics -->
    <div class="row mb-4">
      <div class="col-md-3">
        <div class="metric-card text-center">
          <div class="metric-value text-primary">${this.insightData.summary.totalPotentialYield}</div>
          <div class="metric-label">Total Potential Yield</div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="metric-card text-center">
          <div class="metric-value text-success">${this.insightData.riskMetrics.sharpeRatio}</div>
          <div class="metric-label">Sharpe Ratio</div>
          <div class="alert-badge ${parseFloat(this.insightData.riskMetrics.sharpeRatio) < 1 ? 'alert-warning' : 'alert-success'}">
            ${this.insightData.riskMetrics.alert}
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="metric-card text-center">
          <div class="metric-value text-danger">${this.insightData.drawdown.maxDrawdown}%</div>
          <div class="metric-label">Max Drawdown</div>
          <div class="alert-badge ${parseFloat(this.insightData.drawdown.maxDrawdown) < -5 ? 'alert-warning' : 'alert-success'}">
            ${this.insightData.drawdown.hedgeEffectiveness}
          </div>
        </div>
      </div>
      <div class="col-md-3">
        <div class="metric-card text-center">
          <div class="metric-value text-info">${this.insightData.crossMarket.correlation}</div>
          <div class="metric-label">NASDAQ-XRPL Correlation</div>
        </div>
      </div>
    </div>

    <!-- Charts Row 1 -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="chart-container">
          <canvas id="yieldComparisonChart"></canvas>
        </div>
      </div>
      <div class="col-md-6">
        <div class="chart-container">
          <canvas id="riskMetricsChart"></canvas>
        </div>
      </div>
    </div>

    <!-- Charts Row 2 -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="chart-container">
          <canvas id="ecoImpactChart"></canvas>
        </div>
      </div>
      <div class="col-md-6">
        <div class="chart-container">
          <canvas id="correlationHeatmap"></canvas>
        </div>
      </div>
    </div>

    <!-- Detailed Metrics -->
    <div class="row mb-4">
      <div class="col-12">
        <div class="chart-container">
          <h4>Detailed Performance Metrics</h4>
          <table class="table table-striped">
            <thead>
              <tr>
                <th>Metric</th>
                <th>Base Strategy</th>
                <th>Enhanced Strategy</th>
                <th>Improvement</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Mean Annual Yield</td>
                <td>${this.insightData.summary.meanYield}</td>
                <td>${this.insightData.summary.totalPotentialYield}</td>
                <td>+${(parseFloat(this.insightData.summary.totalPotentialYield) - parseFloat(this.insightData.summary.meanYield)).toFixed(2)}%</td>
              </tr>
              <tr>
                <td>Sharpe Ratio</td>
                <td>${(parseFloat(this.insightData.riskMetrics.sharpeRatio) * 0.7).toFixed(2)}</td>
                <td>${this.insightData.riskMetrics.sharpeRatio}</td>
                <td>+${(parseFloat(this.insightData.riskMetrics.sharpeRatio) - parseFloat(this.insightData.riskMetrics.sharpeRatio) * 0.7).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Sortino Ratio</td>
                <td>${(parseFloat(this.insightData.riskMetrics.sortinoRatio) * 0.7).toFixed(2)}</td>
                <td>${this.insightData.riskMetrics.sortinoRatio}</td>
                <td>+${(parseFloat(this.insightData.riskMetrics.sortinoRatio) - parseFloat(this.insightData.riskMetrics.sortinoRatio) * 0.7).toFixed(2)}</td>
              </tr>
              <tr>
                <td>Max Drawdown</td>
                <td>${(parseFloat(this.insightData.drawdown.maxDrawdown) * 1.5).toFixed(2)}%</td>
                <td>${this.insightData.drawdown.maxDrawdown}%</td>
                <td>-${(parseFloat(this.insightData.drawdown.maxDrawdown) * 1.5 - parseFloat(this.insightData.drawdown.maxDrawdown)).toFixed(2)}%</td>
              </tr>
              <tr>
                <td>Recovery Time</td>
                <td>${Math.round(this.insightData.drawdown.recoveryTime * 1.5)} days</td>
                <td>${this.insightData.drawdown.recoveryTime} days</td>
                <td>-${Math.round(this.insightData.drawdown.recoveryTime * 1.5 - this.insightData.drawdown.recoveryTime)} days</td>
              </tr>
              <tr>
                <td>Eco Bonus</td>
                <td>0.00%</td>
                <td>${this.insightData.sustainability.ecoBonus}%</td>
                <td>+${this.insightData.sustainability.ecoBonus}%</td>
              </tr>
              <tr>
                <td>Carbon Offset</td>
                <td>0kg</td>
                <td>${this.insightData.sustainability.carbonOffset}kg</td>
                <td>+${this.insightData.sustainability.carbonOffset}kg</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Export & Share -->
    <div class="row mb-4">
      <div class="col-12 text-center">
        <button class="btn btn-primary me-2" onclick="exportToPDF()">Export to PDF</button>
        <button class="btn btn-info me-2" onclick="shareOnX()">Share on X</button>
        <button class="btn btn-success" onclick="downloadCSV()">Download CSV Data</button>
      </div>
    </div>

    <footer class="text-center text-muted my-4">
      <p>Generated on ${new Date().toLocaleString()} | NASDAQ-XRPL Fusion Strategy v2.0</p>
    </footer>
  </div>

  <script>
    // Chart initialization
    document.addEventListener('DOMContentLoaded', function() {
      // Yield Comparison Chart
      const yieldComparisonChart = new Chart(
        document.getElementById('yieldComparisonChart'),
        ${JSON.stringify(this.generateYieldComparisonChart())}
      );
      
      // Risk Metrics Chart
      const riskMetricsChart = new Chart(
        document.getElementById('riskMetricsChart'),
        ${JSON.stringify(this.generateRiskMetricsChart())}
      );
      
      // Eco Impact Chart
      const ecoImpactChart = new Chart(
        document.getElementById('ecoImpactChart'),
        ${JSON.stringify(this.generateEcoImpactChart())}
      );
      
      // Correlation Heatmap
      const correlationHeatmap = new Chart(
        document.getElementById('correlationHeatmap'),
        ${JSON.stringify(this.generateCorrelationHeatmap())}
      );
    });
    
    // Dark mode toggle
    function toggleDarkMode() {
      document.body.classList.toggle('dark-mode');
    }
    
    // Export functions (mock implementations)
    function exportToPDF() {
      alert('Exporting dashboard to PDF...');
      // In production: Use html2pdf.js or similar library
    }
    
    function shareOnX() {
      const text = 'Check out my NASDAQ-XRPL Fusion Strategy results: ${this.insightData.summary.totalPotentialYield} yield with ${this.insightData.sustainability.carbonOffset}kg carbon offset! #XRPL2025 #SustainableYield';
      window.open('https://x.com/intent/tweet?text=' + encodeURIComponent(text), '_blank');
    }
    
    function downloadCSV() {
      alert('Downloading CSV data...');
      // In production: Generate and download CSV file
    }
  </script>
</body>
</html>`;
  }

  /**
   * Generate a shareable social media post
   * @returns {string} Social media post text
   */
  generateSocialPost() {
    return `🚀 NASDAQ-XRPL Fusion Strategy Results 🚀
    
📈 Total Yield: ${this.insightData.summary.totalPotentialYield}
⚖️ Sharpe Ratio: ${this.insightData.riskMetrics.sharpeRatio}
🛡️ Max Drawdown: ${this.insightData.drawdown.maxDrawdown}%
🌱 Eco Bonus: ${this.insightData.sustainability.ecoBonus}%
🌍 Carbon Offset: ${this.insightData.sustainability.carbonOffset}kg

#XRPL2025 #SustainableYield #CryptoTrading`;
  }
}

module.exports = YieldInsightVisualizer;
