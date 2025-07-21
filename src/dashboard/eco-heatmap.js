/**
 * Eco Heatmap Component
 * Visualizes eco-impact and cross-market correlations with green-themed visuals
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
 * Eco Heatmap Component
 * Visualizes eco-impact and cross-market correlations
 */
class EcoHeatmap {
  /**
   * Create a new eco heatmap
   * @param {string} containerId - DOM element ID for chart container
   * @param {Object} data - Correlation and eco-impact data
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
    
    // Generate correlation data
    const correlationData = this.generateCorrelationData();
    
    // Create chart
    this.chart = new Chart(this.canvas, {
      type: 'matrix',
      data: {
        datasets: [{
          label: 'Cross-Market Correlation Heatmap',
          data: correlationData,
          backgroundColor: (context) => {
            const value = context.dataset.data[context.dataIndex].v;
            return this.getHeatmapColor(value);
          },
          borderColor: colors.border,
          borderWidth: 1,
          width: ({ chart }) => (chart.chartArea || {}).width / 5,
          height: ({ chart }) => (chart.chartArea || {}).height / 5
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            callbacks: {
              title: () => null,
              label: (context) => {
                const item = context.dataset.data[context.dataIndex];
                const value = (item.v * 100).toFixed(1);
                const ecoImpact = this.getEcoImpact(item.x, item.y);
                
                return [
                  `${item.x} ↔ ${item.y}: ${value}% correlation`,
                  ecoImpact ? `Eco-Impact: ${ecoImpact}` : ''
                ].filter(Boolean);
              }
            }
          }
        },
        scales: {
          x: {
            type: 'category',
            labels: ['XRP', 'RLUSD', 'GreenRWA', 'NASDAQ', 'ETF'],
            ticks: {
              color: colors.textColor
            },
            grid: {
              display: false
            }
          },
          y: {
            type: 'category',
            labels: ['XRP', 'RLUSD', 'GreenRWA', 'NASDAQ', 'ETF'],
            ticks: {
              color: colors.textColor
            },
            grid: {
              display: false
            }
          }
        }
      }
    });
    
    // Add eco-animation if enabled
    if (this.options.animations) {
      this.addEcoAnimation();
    }
    
    // Add click handler for interactive exploration
    this.addClickHandler();
  }
  
  /**
   * Generate correlation data for the heatmap
   * @returns {Array} Array of correlation data points
   * @private
   */
  generateCorrelationData() {
    // Use provided data or generate mock data
    if (this.data.correlations) {
      return this.data.correlations;
    }
    
    // Mock correlation data
    const assets = ['XRP', 'RLUSD', 'GreenRWA', 'NASDAQ', 'ETF'];
    const correlations = [];
    
    // Generate correlation matrix
    for (let i = 0; i < assets.length; i++) {
      for (let j = 0; j < assets.length; j++) {
        // Self-correlation is always 1
        if (i === j) {
          correlations.push({
            x: assets[i],
            y: assets[j],
            v: 1.0
          });
          continue;
        }
        
        // Generate symmetric correlation values
        let value;
        const existingPair = correlations.find(
          c => c.x === assets[j] && c.y === assets[i]
        );
        
        if (existingPair) {
          value = existingPair.v;
        } else {
          // Generate realistic correlations
          if (assets[i].includes('Green') || assets[j].includes('Green')) {
            // Green assets have lower correlation with others
            value = 0.2 + Math.random() * 0.3;
          } else if ((assets[i] === 'NASDAQ' && assets[j] === 'ETF') || 
                     (assets[i] === 'ETF' && assets[j] === 'NASDAQ')) {
            // NASDAQ and ETF are highly correlated
            value = 0.8 + Math.random() * 0.2;
          } else if ((assets[i] === 'XRP' && assets[j] === 'RLUSD') || 
                     (assets[i] === 'RLUSD' && assets[j] === 'XRP')) {
            // XRP and RLUSD have moderate correlation
            value = 0.5 + Math.random() * 0.3;
          } else {
            // Other pairs have random correlation
            value = 0.3 + Math.random() * 0.4;
          }
        }
        
        correlations.push({
          x: assets[i],
          y: assets[j],
          v: value
        });
      }
    }
    
    return correlations;
  }
  
  /**
   * Get eco-impact description for a pair of assets
   * @param {string} asset1 - First asset
   * @param {string} asset2 - Second asset
   * @returns {string} Eco-impact description
   * @private
   */
  getEcoImpact(asset1, asset2) {
    if (asset1.includes('Green') || asset2.includes('Green')) {
      return '🌱 +24% Eco Bonus (Carbon Offset: 100kg)';
    }
    
    if (asset1 === 'RLUSD' || asset2 === 'RLUSD') {
      return '🌿 +12% Eco Bonus (Carbon Neutral)';
    }
    
    if ((asset1 === 'XRP' && asset2 === 'RLUSD') || 
        (asset1 === 'RLUSD' && asset2 === 'XRP')) {
      return '🌿 +15% Eco Bonus (Energy Efficient)';
    }
    
    return null;
  }
  
  /**
   * Get color for heatmap cell based on correlation value
   * @param {number} value - Correlation value (-1 to 1)
   * @returns {string} Color string
   * @private
   */
  getHeatmapColor(value) {
    // Use green gradient for positive correlations
    // Use red gradient for negative correlations
    const isDark = this.options.theme === 'dark';
    const alpha = isDark ? 0.8 : 1.0;
    
    if (value >= 0) {
      // Green gradient for positive correlations
      const intensity = Math.round(value * 255);
      return `rgba(${76 + (intensity / 2)}, ${175 + (intensity / 4)}, ${80 + (intensity / 2)}, ${alpha})`;
    } else {
      // Red gradient for negative correlations
      const intensity = Math.round(-value * 255);
      return `rgba(${244 + (intensity / 8)}, ${67 + (intensity / 8)}, ${54 + (intensity / 8)}, ${alpha})`;
    }
  }
  
  /**
   * Update chart with new data
   * @param {Object} newData - New data to visualize
   */
  updateData(newData) {
    if (!this.chart) return;
    
    this.data = { ...this.data, ...newData };
    
    // Generate updated correlation data
    const correlationData = this.generateCorrelationData();
    
    // Update chart data
    this.chart.data.datasets[0].data = correlationData;
    
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
    this.chart.data.datasets[0].borderColor = colors.border;
    
    // Update scales
    this.chart.options.scales.x.ticks.color = colors.textColor;
    this.chart.options.scales.y.ticks.color = colors.textColor;
    
    // Force redraw to update cell colors
    this.chart.update();
  }
  
  /**
   * Add eco-friendly animation effects
   * @private
   */
  addEcoAnimation() {
    if (!this.chart) return;
    
    // Add pulsing effect to eco-friendly cells
    const originalDraw = this.chart.draw;
    this.chart.draw = () => {
      originalDraw.call(this.chart);
      
      // Add green glow to eco-friendly cells
      const ctx = this.chart.ctx;
      const meta = this.chart.getDatasetMeta(0);
      
      meta.data.forEach((element, index) => {
        const item = this.chart.data.datasets[0].data[index];
        if (item.x.includes('Green') || item.y.includes('Green')) {
          ctx.save();
          ctx.shadowColor = 'rgba(76, 175, 80, 0.5)';
          ctx.shadowBlur = 10;
          ctx.shadowOffsetX = 0;
          ctx.shadowOffsetY = 0;
          element.draw(ctx);
          ctx.restore();
        }
      });
    };
    
    // Trigger redraw
    this.chart.update();
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
        const item = this.chart.data.datasets[0].data[firstPoint.index];
        
        console.log(`Selected correlation: ${item.x} ↔ ${item.y} (${(item.v * 100).toFixed(1)}%)`);
        
        // Dispatch custom event for integration with other components
        const event = new CustomEvent('correlation-selected', {
          detail: {
            asset1: item.x,
            asset2: item.y,
            correlation: item.v,
            ecoImpact: this.getEcoImpact(item.x, item.y)
          }
        });
        
        this.container.dispatchEvent(event);
        
        // Highlight selected cell
        this.highlightCell(firstPoint.index);
      }
    };
  }
  
  /**
   * Highlight a specific cell
   * @param {number} index - Cell index to highlight
   * @private
   */
  highlightCell(index) {
    if (!this.chart) return;
    
    // Store original backgroundColor function
    const originalBackgroundColor = this.chart.data.datasets[0].backgroundColor;
    
    // Create new backgroundColor function that highlights the selected cell
    this.chart.data.datasets[0].backgroundColor = (context) => {
      if (context.dataIndex === index) {
        return 'rgba(255, 255, 255, 0.9)';
      }
      return originalBackgroundColor(context);
    };
    
    // Update chart
    this.chart.update();
    
    // Reset after a delay
    setTimeout(() => {
      this.chart.data.datasets[0].backgroundColor = originalBackgroundColor;
      this.chart.update();
    }, 1500);
  }
  
  /**
   * Get colors based on current theme
   * @returns {Object} Theme colors
   * @private
   */
  getThemeColors() {
    const isDark = this.options.theme === 'dark';
    
    return {
      border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      textColor: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
    };
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EcoHeatmap;
} else if (typeof window !== 'undefined') {
  window.EcoHeatmap = EcoHeatmap;
}
