/**
 * Allocation Chart Component
 * Visualizes asset allocation with eco-friendly themes
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
 * Allocation Chart Component
 * Visualizes asset allocation with interactive features
 */
class AllocationChart {
  /**
   * Create a new allocation chart
   * @param {string} containerId - DOM element ID for chart container
   * @param {Object} data - Allocation data
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
    
    // Extract allocation data
    const allocations = this.data.allocations || {
      'XRP': 0.3,
      'RLUSD': 0.2,
      'GreenRWA': 0.1,
      'NASDAQ': 0.4
    };
    
    // Create chart
    this.chart = new Chart(this.canvas, {
      type: 'pie',
      data: {
        labels: Object.keys(allocations),
        datasets: [{
          data: Object.values(allocations).map(v => v * 100),
          backgroundColor: [
            colors.blue,
            colors.purple,
            colors.green,
            colors.orange
          ],
          borderColor: colors.border,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: colors.textColor,
              generateLabels: (chart) => {
                const data = chart.data;
                if (data.labels.length && data.datasets.length) {
                  return data.labels.map((label, i) => {
                    const value = data.datasets[0].data[i];
                    const isGreen = label.toLowerCase().includes('green') || 
                                   label.toLowerCase().includes('eco');
                    
                    return {
                      text: `${label}: ${value.toFixed(1)}%${isGreen ? ' 🌱' : ''}`,
                      fillStyle: data.datasets[0].backgroundColor[i],
                      strokeStyle: data.datasets[0].borderColor,
                      lineWidth: data.datasets[0].borderWidth,
                      hidden: false,
                      index: i
                    };
                  });
                }
                return [];
              }
            }
          },
          tooltip: {
            callbacks: {
              label: (context) => {
                const label = context.label || '';
                const value = context.raw.toFixed(1);
                let tooltipText = `${label}: ${value}%`;
                
                // Add eco-bonus info for green assets
                if (label.toLowerCase().includes('green') || 
                    label.toLowerCase().includes('eco')) {
                  tooltipText += ' - Eco Bonus: +24%';
                }
                
                return tooltipText;
              }
            }
          }
        },
        animation: this.options.animations ? {
          animateRotate: true,
          animateScale: true
        } : false
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
   * Update chart with new data
   * @param {Object} newData - New data to visualize
   */
  updateData(newData) {
    if (!this.chart) return;
    
    this.data = { ...this.data, ...newData };
    
    // Extract updated allocation data
    const allocations = this.data.allocations || {
      'XRP': 0.3,
      'RLUSD': 0.2,
      'GreenRWA': 0.1,
      'NASDAQ': 0.4
    };
    
    // Update chart data
    this.chart.data.labels = Object.keys(allocations);
    this.chart.data.datasets[0].data = Object.values(allocations).map(v => v * 100);
    
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
    
    // Add pulsing effect to green assets
    const originalDraw = this.chart.draw;
    this.chart.draw = () => {
      originalDraw.call(this.chart);
      
      // Add green glow to eco segments
      const ctx = this.chart.ctx;
      const meta = this.chart.getDatasetMeta(0);
      
      meta.data.forEach((element, index) => {
        const label = this.chart.data.labels[index];
        if (label.toLowerCase().includes('green') || 
            label.toLowerCase().includes('eco')) {
          ctx.save();
          ctx.shadowColor = 'rgba(76, 175, 80, 0.5)';
          ctx.shadowBlur = 15;
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
        const label = this.chart.data.labels[firstPoint.index];
        const value = this.chart.data.datasets[0].data[firstPoint.index];
        
        console.log(`Selected asset: ${label} (${value.toFixed(1)}%)`);
        
        // Dispatch custom event for integration with other components
        const event = new CustomEvent('asset-selected', {
          detail: {
            asset: label,
            allocation: value / 100
          }
        });
        
        this.container.dispatchEvent(event);
        
        // Highlight selected segment
        this.highlightSegment(firstPoint.index);
      }
    };
  }
  
  /**
   * Highlight a specific segment
   * @param {number} index - Segment index to highlight
   * @private
   */
  highlightSegment(index) {
    if (!this.chart) return;
    
    // Reset all segments
    const dataset = this.chart.data.datasets[0];
    const originalColors = this.getThemeColors();
    
    // Create new backgroundColor array with highlighted segment
    const newColors = [
      originalColors.blue,
      originalColors.purple,
      originalColors.green,
      originalColors.orange
    ];
    
    // Highlight selected segment
    newColors[index] = this.lightenColor(newColors[index], 20);
    
    // Update chart
    dataset.backgroundColor = newColors;
    this.chart.update();
    
    // Reset after a delay
    setTimeout(() => {
      dataset.backgroundColor = [
        originalColors.blue,
        originalColors.purple,
        originalColors.green,
        originalColors.orange
      ];
      this.chart.update();
    }, 1500);
  }
  
  /**
   * Lighten a color by a percentage
   * @param {string} color - Color to lighten
   * @param {number} percent - Percentage to lighten
   * @returns {string} Lightened color
   * @private
   */
  lightenColor(color, percent) {
    // Convert rgba or rgb to hex
    if (color.startsWith('rgba') || color.startsWith('rgb')) {
      const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
      if (rgbMatch) {
        const r = parseInt(rgbMatch[1]);
        const g = parseInt(rgbMatch[2]);
        const b = parseInt(rgbMatch[3]);
        color = `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
      }
    }
    
    // Lighten hex color
    const hex = color.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    
    const amount = percent / 100;
    const nr = Math.min(255, Math.floor(r + (255 - r) * amount));
    const ng = Math.min(255, Math.floor(g + (255 - g) * amount));
    const nb = Math.min(255, Math.floor(b + (255 - b) * amount));
    
    return `#${((1 << 24) + (nr << 16) + (ng << 8) + nb).toString(16).slice(1)}`;
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
      purple: isDark ? 'rgba(156, 39, 176, 0.8)' : 'rgba(156, 39, 176, 1)',
      green: isDark ? 'rgba(76, 175, 80, 0.8)' : 'rgba(76, 175, 80, 1)',
      orange: isDark ? 'rgba(255, 152, 0, 0.8)' : 'rgba(255, 152, 0, 1)',
      border: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
      textColor: isDark ? 'rgba(255, 255, 255, 0.8)' : 'rgba(0, 0, 0, 0.8)'
    };
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AllocationChart;
} else if (typeof window !== 'undefined') {
  window.AllocationChart = AllocationChart;
}
