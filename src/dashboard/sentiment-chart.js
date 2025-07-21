/**
 * Sentiment Chart Component
 * Visualizes social sentiment data from X (#XRPLGreenDeFi, #NasdaqHype)
 * and integrates with yield optimization strategies
 * 
 * @version 1.0.0
 * @date July 16, 2025
 */

// Use as CDN in HTML: <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
// For Node.js environments
let Chart;
try {
  Chart = require('chart.js/auto');
} catch (e) {
  // Will use global Chart from CDN in browser environment
}

/**
 * Sentiment Chart Component
 * Visualizes social sentiment overlays and thresholds
 */
class SentimentChart {
  /**
   * Create a new sentiment chart
   * @param {string} containerId - DOM element ID for chart container
   * @param {Object} data - Sentiment and yield data
   * @param {Object} options - Chart options
   */
  constructor(containerId, data, options = {}) {
    this.container = document.getElementById(containerId);
    this.data = data;
    this.options = options;
    this.chart = null;
    this.threshold = options.threshold || 0.7; // Default sentiment threshold
    
    this.initChart();
  }
  
  /**
   * Initialize the chart
   * @private
   */
  initChart() {
    if (!this.container) return;
    
    // Create canvas if it doesn't exist
    if (!this.container.querySelector('canvas')) {
      const canvas = document.createElement('canvas');
      this.container.appendChild(canvas);
      this.canvas = canvas;
    } else {
      this.canvas = this.container.querySelector('canvas');
    }
    
    // Get theme colors
    const colors = this.getThemeColors();
    
    // Generate sentiment data
    const sentimentData = this.generateSentimentData();
    const timeLabels = this.generateTimeLabels(sentimentData.length);
    
    // Create chart
    this.chart = new Chart(this.canvas, {
      type: 'line',
      data: {
        labels: timeLabels,
        datasets: [
          {
            label: 'X Sentiment (#NasdaqHype)',
            data: sentimentData,
            borderColor: colors.blue,
            backgroundColor: `rgba(33, 150, 243, ${colors.alpha})`,
            borderWidth: 2,
            tension: 0.4,
            fill: true
          },
          {
            label: 'X Sentiment (#XRPLGreenDeFi)',
            data: this.generateSentimentData(), // Different sentiment data
            borderColor: colors.green,
            backgroundColor: `rgba(76, 175, 80, ${colors.alpha})`,
            borderWidth: 2,
            tension: 0.4,
            fill: true
          },
          {
            label: 'Sentiment Threshold',
            data: Array(timeLabels.length).fill(this.threshold),
            borderColor: colors.orange,
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [5, 5],
            pointRadius: 0,
            fill: false
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Time',
              color: colors.textColor
            },
            ticks: {
              color: colors.textColor
            },
            grid: {
              color: colors.gridColor
            }
          },
          y: {
            title: {
              display: true,
              text: 'Sentiment Score',
              color: colors.textColor
            },
            min: 0,
            max: 1,
            ticks: {
              color: colors.textColor,
              callback: (value) => value.toFixed(1)
            },
            grid: {
              color: colors.gridColor
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: colors.textColor
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.dataset.label || '';
                const value = context.raw.toFixed(2);
                let tooltipText = `${label}: ${value}`;
                
                // Add trading signal info based on sentiment threshold
                if (context.datasetIndex < 2 && context.raw >= this.threshold) {
                  tooltipText += ' 🔔 Buy Signal';
                }
                
                return tooltipText;
              },
              afterBody: (tooltipItems) => {
                // Check if any sentiment value is above threshold
                const aboveThreshold = tooltipItems.some(item => 
                  item.datasetIndex < 2 && item.raw >= this.threshold
                );
                
                if (aboveThreshold) {
                  // Calculate potential yield based on updated simulation data
                  const baseYield = 1.93; // Updated base yield from simulation
                  const leverageBoost = 2; // 2x leverage
                  const sentimentBoost = 1.15; // Sentiment boost factor
                  const federationUplift = 0.5; // Federation uplift
                  
                  const potentialYield = baseYield * (1 + federationUplift) * sentimentBoost;
                  const tweakedYield = 6.79; // From simulation results
                  
                  return [
                    `Base Yield: ${baseYield.toFixed(2)}%`,
                    `Tweaked Yield: ${tweakedYield.toFixed(2)}%`,
                    `Strategy: Leverage & Sentiment Fusion`,
                    `Eco-Bonus: +24% (Solar RWA)`
                  ];
                }
                
                return [];
              }
            }
          }
        },
        animation: this.options.animations ? {
          duration: 2000,
          easing: 'easeOutQuart'
        } : false
      }
    });
    
    // Add sentiment threshold indicator
    this.addThresholdIndicator();
    
    // Add click handler for interactive exploration
    this.addClickHandler();
  }
  
  /**
   * Generate mock sentiment data
   * @param {number} length - Number of data points
   * @returns {Array} Array of sentiment values
   * @private
   */
  generateSentimentData(length = 24) {
    // Generate realistic sentiment data with trends
    const sentimentData = [];
    let currentSentiment = 0.5 + (Math.random() * 0.2);
    
    for (let i = 0; i < length; i++) {
      // Add some randomness with trend persistence
      const change = (Math.random() - 0.5) * 0.1;
      currentSentiment = Math.max(0, Math.min(1, currentSentiment + change));
      
      // Add occasional sentiment spikes for buy signals
      if (Math.random() > 0.8) {
        currentSentiment = Math.min(1, currentSentiment + 0.2);
      }
      
      sentimentData.push(currentSentiment);
    }
    
    return sentimentData;
  }
  
  /**
   * Generate time labels for x-axis
   * @param {number} length - Number of labels
   * @returns {Array} Array of time labels
   * @private
   */
  generateTimeLabels(length = 24) {
    const labels = [];
    const now = new Date();
    
    for (let i = length - 1; i >= 0; i--) {
      const time = new Date(now);
      time.setHours(now.getHours() - i);
      labels.push(time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    }
    
    return labels;
  }
  
  /**
   * Add visual indicator for sentiment threshold
   * @private
   */
  addThresholdIndicator() {
    if (!this.chart) return;
    
    // Add shading above threshold
    const originalDraw = this.chart.draw;
    this.chart.draw = () => {
      originalDraw.call(this.chart);
      
      const ctx = this.chart.ctx;
      const yAxis = this.chart.scales.y;
      const xAxis = this.chart.scales.x;
      
      const thresholdY = yAxis.getPixelForValue(this.threshold);
      
      // Draw shaded area above threshold
      ctx.save();
      ctx.fillStyle = 'rgba(76, 175, 80, 0.1)';
      ctx.fillRect(
        xAxis.left,
        yAxis.top,
        xAxis.width,
        thresholdY - yAxis.top
      );
      ctx.restore();
    };
    
    // Trigger redraw
    this.chart.update();
  }
  
  /**
   * Update chart with new data
   * @param {Object} newData - New data to visualize
   */
  updateData(newData) {
    if (!this.chart) return;
    
    this.data = { ...this.data, ...newData };
    
    // Update sentiment data if provided
    if (this.data.sentimentScores) {
      const timeLabels = this.generateTimeLabels(this.data.sentimentScores.length);
      
      this.chart.data.labels = timeLabels;
      this.chart.data.datasets[0].data = this.data.sentimentScores;
      
      // Update threshold line
      if (this.data.sentimentThreshold !== undefined) {
        this.threshold = this.data.sentimentThreshold;
        this.chart.data.datasets[2].data = Array(timeLabels.length).fill(this.threshold);
      }
    }
    
    // Update chart
    this.chart.update();
    
    // Update threshold indicator
    this.addThresholdIndicator();
  }
  
  /**
   * Set chart theme
   * @param {string} theme - 'light' or 'dark'
   */
  setTheme(theme) {
    this.options.theme = theme;
    
    if (!this.chart) return;
    
    // Get updated theme colors
    const colors = this.getThemeColors();
    
    // Update dataset colors
    this.chart.data.datasets[0].borderColor = colors.blue;
    this.chart.data.datasets[0].backgroundColor = `rgba(33, 150, 243, ${colors.alpha})`;
    this.chart.data.datasets[1].borderColor = colors.green;
    this.chart.data.datasets[1].backgroundColor = `rgba(76, 175, 80, ${colors.alpha})`;
    this.chart.data.datasets[2].borderColor = colors.orange;
    
    // Update scales
    this.chart.options.scales.x.title.color = colors.textColor;
    this.chart.options.scales.x.ticks.color = colors.textColor;
    this.chart.options.scales.x.grid.color = colors.gridColor;
    this.chart.options.scales.y.title.color = colors.textColor;
    this.chart.options.scales.y.ticks.color = colors.textColor;
    this.chart.options.scales.y.grid.color = colors.gridColor;
    
    // Update legend
    this.chart.options.plugins.legend.labels.color = colors.textColor;
    
    // Update chart
    this.chart.update();
    
    // Update threshold indicator
    this.addThresholdIndicator();
  }
  
  /**
   * Add click handler for interactive exploration
   * @private
   */
  addClickHandler() {
    if (!this.chart || !this.canvas) return;
    
    this.canvas.onclick = (evt) => {
      const points = this.chart.getElementsAtEventForMode(
        evt, 
        'nearest', 
        { intersect: true }, 
        false
      );
      
      if (points.length) {
        const firstPoint = points[0];
        const dataset = this.chart.data.datasets[firstPoint.datasetIndex];
        const dataIndex = firstPoint.index;
        const value = dataset.data[dataIndex];
        const label = this.chart.data.labels[dataIndex];
        
        console.log(`Selected sentiment: ${dataset.label} at ${label}: ${value.toFixed(2)}`);
        
        // Check if above threshold for trading signal
        const isSignal = value >= this.threshold;
        
        // Dispatch custom event for integration with other components
        const event = new CustomEvent('sentiment-selected', {
          detail: {
            sentiment: value,
            time: label,
            source: dataset.label,
            isSignal,
            threshold: this.threshold
          }
        });
        
        this.container.dispatchEvent(event);
        
        // Generate trading recommendation if above threshold
        if (isSignal) {
          this.generateTradingSignal(dataset.label, value);
        }
      }
    };
  }
  
  /**
   * Generate trading signal based on sentiment
   * @param {string} source - Sentiment source
   * @param {number} value - Sentiment value
   * @private
   */
  generateTradingSignal(source, value) {
    // Calculate potential yield based on updated simulation data
    const baseYield = 1.93; // Updated base yield from simulation
    const leverageBoost = 2; // 2x leverage
    const sentimentBoost = 1 + ((value - this.threshold) * 5); // Sentiment boost factor
    const federationUplift = 0.5; // Federation uplift
    
    const potentialYield = baseYield * (1 + federationUplift) * sentimentBoost;
    const tweakedYield = 6.79; // From simulation results
    
    // Create signal notification
    const signalDiv = document.createElement('div');
    signalDiv.className = 'trading-signal';
    signalDiv.style.position = 'absolute';
    signalDiv.style.top = '10px';
    signalDiv.style.right = '10px';
    signalDiv.style.padding = '10px';
    signalDiv.style.backgroundColor = 'rgba(76, 175, 80, 0.9)';
    signalDiv.style.color = 'white';
    signalDiv.style.borderRadius = '5px';
    signalDiv.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    signalDiv.style.zIndex = '1000';
    signalDiv.style.maxWidth = '250px';
    
    signalDiv.innerHTML = `
      <h4 style="margin: 0 0 5px 0">🔔 Buy Signal Detected</h4>
      <p style="margin: 0 0 5px 0">Source: ${source}</p>
      <p style="margin: 0 0 5px 0">Sentiment: ${value.toFixed(2)}</p>
      <p style="margin: 0 0 5px 0">Base Yield: ${baseYield.toFixed(2)}%</p>
      <p style="margin: 0 0 5px 0">Tweaked Yield: ${tweakedYield.toFixed(2)}%</p>
      <p style="margin: 0 0 5px 0">Strategy: Leverage & Sentiment Fusion</p>
      <p style="margin: 0">Eco-Bonus: +24% (Solar RWA)</p>
    `;
    
    // Add to container
    this.container.style.position = 'relative';
    this.container.appendChild(signalDiv);
    
    // Remove after a delay
    setTimeout(() => {
      signalDiv.style.opacity = '0';
      signalDiv.style.transition = 'opacity 0.5s';
      setTimeout(() => signalDiv.remove(), 500);
    }, 5000);
  }
  
  /**
   * Update sentiment threshold
   * @param {number} threshold - New threshold value (0-1)
   */
  updateThreshold(threshold) {
    if (!this.chart) return;
    
    this.threshold = threshold;
    
    // Update threshold line
    this.chart.data.datasets[2].data = Array(this.chart.data.labels.length).fill(threshold);
    
    // Update chart
    this.chart.update();
    
    // Update threshold indicator
    this.addThresholdIndicator();
    
    return threshold;
  }
  
  /**
   * Add yield comparison chart
   * @param {string} containerId - DOM element ID for comparison chart container
   */
  addYieldComparisonChart(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Create canvas
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    // Get theme colors
    const colors = this.getThemeColors();
    
    // Create comparison chart
    new Chart(canvas, {
      type: 'bar',
      data: {
        labels: ['Base Sim', 'Tweaked Sim'],
        datasets: [
          {
            label: 'Mean Yield (%)',
            data: [1.93, 6.79],
            backgroundColor: [colors.blue, colors.green],
            borderColor: colors.border,
            borderWidth: 1
          },
          {
            label: 'Standard Deviation (%)',
            data: [0.26, 0.91],
            backgroundColor: [
              `rgba(156, 39, 176, ${colors.alpha * 2})`,
              `rgba(156, 39, 176, ${colors.alpha * 2})`
            ],
            borderColor: colors.border,
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Percentage (%)',
              color: colors.textColor
            },
            ticks: {
              color: colors.textColor
            },
            grid: {
              color: colors.gridColor
            }
          },
          x: {
            ticks: {
              color: colors.textColor
            },
            grid: {
              color: colors.gridColor
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: colors.textColor
            }
          },
          tooltip: {
            callbacks: {
              afterBody: () => [
                'Uplift: +252% with APY ramp + federation',
                'Sharpe Ratio: 7.46 (+0.5%)',
                'Min Yield: 5.00%, Max Yield: 8.58%'
              ]
            }
          }
        }
      }
    });
  }
  
  /**
   * Add price path simulation chart
   * @param {string} containerId - DOM element ID for price path chart container
   */
  addPricePathChart(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    // Create canvas
    const canvas = document.createElement('canvas');
    container.appendChild(canvas);
    
    // Get theme colors
    const colors = this.getThemeColors();
    
    // Generate price path data
    const days = 252; // Trading days in a year
    const initialPrice = 23040.25; // Current NASDAQ futures price
    const drift = 0.0005; // Daily drift
    const volatility = 0.1738; // Volatility from simulation
    
    // Generate base path
    const basePath = this.generatePricePath(initialPrice, drift, volatility, days);
    
    // Generate tweaked path with less volatility
    const tweakedPath = this.generatePricePath(initialPrice, drift * 1.1, volatility * 0.9, days);
    
    // Create labels for x-axis (days)
    const labels = Array.from({ length: days }, (_, i) => `Day ${i + 1}`);
    
    // Create chart
    new Chart(canvas, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Base Price Path',
            data: basePath,
            borderColor: colors.blue,
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.1,
            pointRadius: 0
          },
          {
            label: 'Tweaked Price Path (Uplifted)',
            data: tweakedPath,
            borderColor: colors.green,
            backgroundColor: 'transparent',
            borderWidth: 2,
            tension: 0.1,
            pointRadius: 0
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            title: {
              display: true,
              text: 'Price ($)',
              color: colors.textColor
            },
            ticks: {
              color: colors.textColor,
              callback: (value) => `$${value.toLocaleString()}`
            },
            grid: {
              color: colors.gridColor
            }
          },
          x: {
            ticks: {
              color: colors.textColor,
              maxRotation: 0,
              autoSkip: true,
              maxTicksLimit: 12
            },
            grid: {
              color: colors.gridColor
            }
          }
        },
        plugins: {
          legend: {
            labels: {
              color: colors.textColor
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const price = context.raw.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                });
                return `${context.dataset.label}: $${price}`;
              }
            }
          }
        }
      }
    });
  }
  
  /**
   * Generate price path using geometric Brownian motion
   * @param {number} initialPrice - Starting price
   * @param {number} drift - Daily drift
   * @param {number} volatility - Daily volatility
   * @param {number} days - Number of days
   * @returns {Array} Array of prices
   * @private
   */
  generatePricePath(initialPrice, drift, volatility, days) {
    const prices = [initialPrice];
    let currentPrice = initialPrice;
    
    for (let i = 1; i < days; i++) {
      const randomFactor = this.normalRandom();
      const dailyReturn = drift + volatility * randomFactor;
      currentPrice = currentPrice * Math.exp(dailyReturn);
      prices.push(currentPrice);
    }
    
    return prices;
  }
  
  /**
   * Generate a normally distributed random number
   * @returns {number} Random number from normal distribution
   * @private
   */
  normalRandom() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  }
  
  /**
   * Get colors based on current theme
   * @returns {Object} Theme colors
   * @private
   */
  getThemeColors() {
    const isDark = this.options.theme === 'dark';
    
    return {
      blue: isDark ? 'rgba(33, 150, 243, 0.8)' : 'rgba(33, 150, 243, 1)',
      green: isDark ? 'rgba(76, 175, 80, 0.8)' : 'rgba(76, 175, 80, 1)',
      orange: isDark ? 'rgba(255, 152, 0, 0.8)' : 'rgba(255, 152, 0, 1)',
      gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      textColor: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)',
      alpha: isDark ? 0.3 : 0.2,
      border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
    };
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SentimentChart;
} else if (typeof window !== 'undefined') {
  window.SentimentChart = SentimentChart;
}
