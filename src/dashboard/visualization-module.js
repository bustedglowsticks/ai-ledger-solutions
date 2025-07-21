/**
 * Dynamic Yield Viz Hub - Interactive Dashboard Visualization Module
 * 
 * Features:
 * - Interactive yield curve charts with real-time what-if sliders
 * - Eco-impact heatmaps with green-themed visuals
 * - Sentiment overlays from X searches (#XRPLGreenDeFi)
 * - NFT export for community sharing
 * - Dark mode support and eco-animations
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
 * Dynamic Yield Visualization Hub
 * Central class for managing all visualizations
 */
class DynamicYieldVizHub {
  /**
   * Create a new visualization hub
   * @param {Object} options - Configuration options
   * @param {Object} options.data - Yield, allocation and eco-score data
   * @param {string} options.theme - 'light' or 'dark'
   * @param {boolean} options.animations - Enable eco-animations
   */
  constructor(options = {}) {
    this.data = options.data || {
      yields: [],
      allocations: [],
      ecoScores: [],
      sentimentScores: []
    };
    
    this.theme = options.theme || this.detectTheme();
    this.animations = options.animations !== undefined ? options.animations : true;
    this.charts = {};
    this.sliders = {};
    
    // Bind methods
    this.updateData = this.updateData.bind(this);
    this.exportAsNFT = this.exportAsNFT.bind(this);
    this.toggleTheme = this.toggleTheme.bind(this);
  }
  
  /**
   * Initialize all charts
   * @param {Object} containers - DOM element IDs for chart containers
   */
  initializeCharts(containers = {}) {
    // Create yield chart
    if (containers.yieldChart) {
      this.charts.yield = new YieldChart(containers.yieldChart, this.data, {
        theme: this.theme,
        animations: this.animations
      });
    }
    
    // Create allocation pie chart
    if (containers.allocationChart) {
      this.charts.allocation = new AllocationChart(containers.allocationChart, this.data, {
        theme: this.theme,
        animations: this.animations
      });
    }
    
    // Create eco-impact heatmap
    if (containers.ecoHeatmap) {
      this.charts.ecoHeatmap = new EcoHeatmap(containers.ecoHeatmap, this.data, {
        theme: this.theme,
        animations: this.animations
      });
    }
    
    // Create sentiment overlay
    if (containers.sentimentChart) {
      this.charts.sentiment = new SentimentChart(containers.sentimentChart, this.data, {
        theme: this.theme,
        animations: this.animations
      });
    }
    
    return this;
  }
  
  /**
   * Initialize interactive sliders
   * @param {Object} containers - DOM element IDs for slider containers
   */
  initializeSliders(containers = {}) {
    // Create volatility slider
    if (containers.volatilitySlider) {
      this.sliders.volatility = new VolatilitySlider(containers.volatilitySlider, {
        onChange: (value) => this.simulateWithVolatility(value)
      });
    }
    
    // Create eco-weight slider
    if (containers.ecoWeightSlider) {
      this.sliders.ecoWeight = new EcoWeightSlider(containers.ecoWeightSlider, {
        onChange: (value) => this.updateEcoWeights(value)
      });
    }
    
    // Create sentiment threshold slider
    if (containers.sentimentSlider) {
      this.sliders.sentiment = new SentimentSlider(containers.sentimentSlider, {
        onChange: (value) => this.updateSentimentThreshold(value)
      });
    }
    
    return this;
  }
  
  /**
   * Update all charts with new data
   * @param {Object} newData - New data to visualize
   */
  updateData(newData) {
    this.data = { ...this.data, ...newData };
    
    // Update all charts
    Object.values(this.charts).forEach(chart => {
      if (typeof chart.updateData === 'function') {
        chart.updateData(this.data);
      }
    });
    
    return this;
  }
  
  /**
   * Run a Monte Carlo simulation with adjusted volatility
   * @param {number} volatility - Volatility value (0-1)
   */
  simulateWithVolatility(volatility) {
    console.log(`Running simulation with volatility: ${volatility}`);
    
    // Generate simulated yields based on volatility
    const simulatedYields = this.generateSimulatedYields(volatility);
    
    // Update charts with new simulation data
    this.updateData({
      yields: simulatedYields,
      simulationParams: { volatility }
    });
    
    return simulatedYields;
  }
  
  /**
   * Generate simulated yields based on volatility
   * @param {number} volatility - Volatility parameter (0-1)
   * @returns {Array} Array of simulated yields
   * @private
   */
  generateSimulatedYields(volatility) {
    const paths = 100;
    const meanYield = 0.06 + (volatility * 0.5); // Higher volatility, higher potential returns
    const stdDev = volatility * 0.2;
    
    // Generate random yields using geometric Brownian motion
    return Array.from({ length: paths }, () => {
      const randomFactor = this.normalRandom();
      return meanYield + (stdDev * randomFactor);
    });
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
   * Update eco-weights in the simulation
   * @param {number} ecoWeight - Weight for eco-assets (0-1)
   */
  updateEcoWeights(ecoWeight) {
    console.log(`Updating eco-weights: ${ecoWeight}`);
    
    // Calculate new eco-scores based on weight
    const newEcoScores = this.data.ecoScores.map(score => score * (1 + ecoWeight));
    
    // Update allocations based on eco-weight
    const newAllocations = this.calculateAllocationsWithEco(ecoWeight);
    
    // Update charts
    this.updateData({
      ecoScores: newEcoScores,
      allocations: newAllocations,
      ecoWeight
    });
    
    return newEcoScores;
  }
  
  /**
   * Calculate new allocations based on eco-weight
   * @param {number} ecoWeight - Weight for eco-assets (0-1)
   * @returns {Object} New allocations
   * @private
   */
  calculateAllocationsWithEco(ecoWeight) {
    // Example allocation adjustment based on eco-weight
    return {
      'XRP': 0.3 - (ecoWeight * 0.1),
      'RLUSD': 0.2 + (ecoWeight * 0.1),
      'GreenRWA': 0.1 + (ecoWeight * 0.2),
      'NASDAQ': 0.4 - (ecoWeight * 0.2)
    };
  }
  
  /**
   * Update sentiment threshold for trading decisions
   * @param {number} threshold - Sentiment threshold (0-1)
   */
  updateSentimentThreshold(threshold) {
    console.log(`Updating sentiment threshold: ${threshold}`);
    
    // Filter yields based on sentiment threshold
    const filteredYields = this.filterYieldsBySentiment(threshold);
    
    // Update charts
    this.updateData({
      yields: filteredYields,
      sentimentThreshold: threshold
    });
    
    return filteredYields;
  }
  
  /**
   * Filter yields based on sentiment threshold
   * @param {number} threshold - Sentiment threshold (0-1)
   * @returns {Array} Filtered yields
   * @private
   */
  filterYieldsBySentiment(threshold) {
    // Example: Filter out yields where sentiment is below threshold
    const sentimentFilter = this.data.sentimentScores.map(score => score >= threshold);
    
    return this.data.yields.filter((_, i) => sentimentFilter[i] || i >= sentimentFilter.length);
  }
  
  /**
   * Export current visualization as NFT
   * @returns {Object} NFT metadata
   */
  exportAsNFT() {
    console.log('Exporting visualization as NFT');
    
    // Capture current state of all charts
    const chartImages = {};
    Object.entries(this.charts).forEach(([name, chart]) => {
      if (chart.canvas && typeof chart.canvas.toDataURL === 'function') {
        chartImages[name] = chart.canvas.toDataURL('image/png');
      }
    });
    
    // Generate NFT metadata
    const nftMetadata = {
      name: 'XRPL-NASDAQ Yield Optimizer Insights',
      description: 'Interactive visualization of yield optimization strategy',
      images: chartImages,
      data: {
        meanYield: this.calculateMean(this.data.yields) * 100,
        ecoBonus: this.calculateEcoBonus(),
        timestamp: new Date().toISOString(),
        simulationParams: this.data.simulationParams || {}
      },
      creator: 'Dynamic Yield Viz Hub',
      license: 'CC BY-NC-SA 4.0'
    };
    
    // In a real implementation, this would mint the NFT on XRPL
    // For now, we just return the metadata
    this.triggerDownload(JSON.stringify(nftMetadata, null, 2), 'yield-viz-nft.json');
    
    return nftMetadata;
  }
  
  /**
   * Trigger download of data as file
   * @param {string} content - File content
   * @param {string} filename - File name
   * @private
   */
  triggerDownload(content, filename) {
    // Create a blob from the content
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    // Create a link and trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(url);
  }
  
  /**
   * Toggle between light and dark theme
   */
  toggleTheme() {
    this.theme = this.theme === 'light' ? 'dark' : 'light';
    
    // Update all charts
    Object.values(this.charts).forEach(chart => {
      if (typeof chart.setTheme === 'function') {
        chart.setTheme(this.theme);
      }
    });
    
    return this.theme;
  }
  
  /**
   * Detect system theme preference
   * @returns {string} 'light' or 'dark'
   * @private
   */
  detectTheme() {
    if (typeof window !== 'undefined' && 
        window.matchMedia && 
        window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }
  
  /**
   * Calculate mean of an array
   * @param {Array} arr - Array of numbers
   * @returns {number} Mean value
   * @private
   */
  calculateMean(arr) {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
  
  /**
   * Calculate eco-bonus based on eco-scores
   * @returns {number} Eco-bonus percentage
   * @private
   */
  calculateEcoBonus() {
    if (!this.data.ecoScores || this.data.ecoScores.length === 0) return 0;
    return this.data.ecoScores.reduce((sum, s) => sum + s, 0) / 
           this.data.ecoScores.length * 0.24; // 24% max bonus
  }
}

/**
 * Yield Chart Component
 * Visualizes yield curves and metrics
 */
class YieldChart {
  /**
   * Create a new yield chart
   * @param {string} containerId - DOM element ID for chart container
   * @param {Object} data - Yield data
   * @param {Object} options - Chart options
   */
  constructor(containerId, data, options = {}) {
    this.container = document.getElementById(containerId);
    this.data = data;
    this.options = options;
    this.chart = null;
    
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
    
    // Calculate metrics
    const meanYield = this.calculateMean(this.data.yields) * 100;
    const ecoUplift = this.calculateEcoUplift() * 100;
    const maxDrawdown = this.calculateMaxDrawdown() * 100;
    
    // Create chart
    this.chart = new Chart(this.canvas, {
      type: 'bar',
      data: {
        labels: ['Mean Yield', 'Eco Uplift', 'Max Drawdown'],
        datasets: [{
          label: 'Yield Metrics (%)',
          data: [meanYield, ecoUplift, maxDrawdown],
          backgroundColor: [colors.green, colors.blue, colors.orange],
          borderColor: colors.border,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: colors.gridColor
            },
            ticks: {
              color: colors.textColor
            }
          },
          x: {
            grid: {
              color: colors.gridColor
            },
            ticks: {
              color: colors.textColor
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
                const value = context.raw.toFixed(2);
                let label = `${context.label}: ${value}%`;
                
                // Add eco-bonus info for the Eco Uplift bar
                if (context.label === 'Eco Uplift') {
                  label += ' - Solar RWA: +24% bonus';
                }
                
                return label;
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
    
    // Add eco-animation if enabled
    if (this.options.animations) {
      this.addEcoAnimation();
    }
  }
  
  /**
   * Update chart with new data
   * @param {Object} newData - New data to visualize
   */
  updateData(newData) {
    if (!this.chart) return;
    
    this.data = { ...this.data, ...newData };
    
    // Calculate updated metrics
    const meanYield = this.calculateMean(this.data.yields) * 100;
    const ecoUplift = this.calculateEcoUplift() * 100;
    const maxDrawdown = this.calculateMaxDrawdown() * 100;
    
    // Update chart data
    this.chart.data.datasets[0].data = [meanYield, ecoUplift, maxDrawdown];
    
    // Update chart
    this.chart.update();
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
    
    // Update chart colors
    this.chart.data.datasets[0].backgroundColor = [colors.green, colors.blue, colors.orange];
    this.chart.data.datasets[0].borderColor = colors.border;
    
    // Update scales
    this.chart.options.scales.y.grid.color = colors.gridColor;
    this.chart.options.scales.y.ticks.color = colors.textColor;
    this.chart.options.scales.x.grid.color = colors.gridColor;
    this.chart.options.scales.x.ticks.color = colors.textColor;
    
    // Update legend
    this.chart.options.plugins.legend.labels.color = colors.textColor;
    
    // Update chart
    this.chart.update();
  }
  
  /**
   * Add eco-friendly animation effects
   * @private
   */
  addEcoAnimation() {
    if (!this.chart) return;
    
    // Add growing effect to eco uplift bar
    const originalDraw = this.chart.draw;
    this.chart.draw = () => {
      originalDraw.call(this.chart);
      
      // Add green glow to eco uplift bar
      const ctx = this.chart.ctx;
      const meta = this.chart.getDatasetMeta(0);
      const ecoBar = meta.data[1];
      
      if (ecoBar) {
        ctx.save();
        ctx.shadowColor = 'rgba(76, 175, 80, 0.5)';
        ctx.shadowBlur = 15;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
        ecoBar.draw(ctx);
        ctx.restore();
      }
    };
    
    // Trigger redraw
    this.chart.update();
  }
  
  /**
   * Get colors based on current theme
   * @returns {Object} Theme colors
   * @private
   */
  getThemeColors() {
    const isDark = this.options.theme === 'dark';
    
    return {
      green: isDark ? 'rgba(76, 175, 80, 0.8)' : 'rgba(76, 175, 80, 1)',
      blue: isDark ? 'rgba(33, 150, 243, 0.8)' : 'rgba(33, 150, 243, 1)',
      orange: isDark ? 'rgba(255, 152, 0, 0.8)' : 'rgba(255, 152, 0, 1)',
      border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      gridColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      textColor: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
    };
  }
  
  /**
   * Calculate mean of an array
   * @param {Array} arr - Array of numbers
   * @returns {number} Mean value
   * @private
   */
  calculateMean(arr) {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((a, b) => a + b, 0) / arr.length;
  }
  
  /**
   * Calculate eco uplift based on eco-scores
   * @returns {number} Eco uplift value
   * @private
   */
  calculateEcoUplift() {
    if (!this.data.ecoScores || this.data.ecoScores.length === 0) return 0;
    return this.data.ecoScores.reduce((sum, s) => sum + s, 0) / 
           this.data.ecoScores.length * 0.24; // 24% bonus
  }
  
  /**
   * Calculate maximum drawdown
   * @returns {number} Maximum drawdown
   * @private
   */
  calculateMaxDrawdown() {
    if (!this.data.yields || this.data.yields.length === 0) return 0;
    
    const cum = this.data.yields.reduce((acc, y) => {
      const last = acc.length > 0 ? acc[acc.length - 1] : 1;
      return [...acc, last * (1 + y)];
    }, []);
    
    const peak = Math.max(...cum);
    const peakIndex = cum.indexOf(peak);
    const troughAfterPeak = Math.min(...cum.slice(peakIndex));
    
    return (troughAfterPeak - peak) / peak;
  }
}

// Export the main class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DynamicYieldVizHub, YieldChart };
} else if (typeof window !== 'undefined') {
  window.DynamicYieldVizHub = DynamicYieldVizHub;
  window.YieldChart = YieldChart;
}
