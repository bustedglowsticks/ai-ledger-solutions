/**
 * Adaptive Monte Carlo Forecaster for XRPL Liquidity Provider Bot
 * 
 * Uses advanced Monte Carlo simulation techniques to:
 * - Predict yield based on historical data and market conditions
 * - Adapt to changing market conditions with Bayesian updates
 * - Provide confidence intervals for yield predictions
 * - Support community-governed scenario selection
 */

const fs = require('fs');
const path = require('path');

class AdaptiveMonteCarlo {
  /**
   * Initialize the Adaptive Monte Carlo Forecaster
   * @param {Object} options Configuration options
   * @param {string} options.outputDir Directory to store forecast reports
   * @param {number} options.iterations Number of Monte Carlo iterations (default: 10000)
   * @param {number} options.confidenceLevel Confidence level for intervals (default: 0.95)
   * @param {number} options.learningRate Learning rate for Bayesian updates (default: 0.15)
   * @param {Object} options.priors Prior distributions for parameters
   */
  constructor(options = {}) {
    this.outputDir = options.outputDir || path.join(__dirname, '../../data/forecasts');
    this.iterations = options.iterations || 10000;
    this.confidenceLevel = options.confidenceLevel || 0.95;
    this.learningRate = options.learningRate || 0.15;
    this.priors = options.priors || {
      baseYield: { mean: 0.12, stdDev: 0.04 },
      volatility: { mean: 0.25, stdDev: 0.1 },
      sentimentImpact: { mean: 0.05, stdDev: 0.02 }
    };
    
    // Historical data for Bayesian updates
    this.historicalData = [];
    
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
    
    // Load historical data if available
    this._loadHistoricalData();
  }
  
  /**
   * Load historical data for Bayesian updates
   * @private
   */
  _loadHistoricalData() {
    try {
      const historyFile = path.join(this.outputDir, 'history.json');
      if (fs.existsSync(historyFile)) {
        this.historicalData = JSON.parse(fs.readFileSync(historyFile, 'utf8'));
        console.log(`Loaded ${this.historicalData.length} historical data points for Bayesian updates`);
      }
    } catch (error) {
      console.warn('Error loading historical data:', error.message);
    }
  }
  
  /**
   * Save historical data for future Bayesian updates
   * @private
   */
  _saveHistoricalData() {
    try {
      const historyFile = path.join(this.outputDir, 'history.json');
      fs.writeFileSync(historyFile, JSON.stringify(this.historicalData, null, 2));
    } catch (error) {
      console.error('Error saving historical data:', error.message);
    }
  }
  
  /**
   * Generate a random sample from a normal distribution
   * @param {number} mean Mean of the distribution
   * @param {number} stdDev Standard deviation of the distribution
   * @returns {number} Random sample
   * @private
   */
  _normalSample(mean, stdDev) {
    // Box-Muller transform for normal distribution
    const u1 = Math.random();
    const u2 = Math.random();
    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    return mean + z0 * stdDev;
  }
  
  /**
   * Generate a random sample from a beta distribution
   * @param {number} alpha Alpha parameter
   * @param {number} beta Beta parameter
   * @returns {number} Random sample
   * @private
   */
  _betaSample(alpha, beta) {
    // Approximation of beta distribution using gamma distribution
    const x = this._gammaSample(alpha, 1);
    const y = this._gammaSample(beta, 1);
    return x / (x + y);
  }
  
  /**
   * Generate a random sample from a gamma distribution
   * @param {number} shape Shape parameter
   * @param {number} scale Scale parameter
   * @returns {number} Random sample
   * @private
   */
  _gammaSample(shape, scale) {
    // Marsaglia and Tsang method for gamma distribution
    if (shape < 1) {
      const d = shape + 1.0 - 1.0/3.0;
      const c = 1.0 / Math.sqrt(9.0 * d);
      let x, v;
      do {
        x = this._normalSample(0, 1);
        v = 1.0 + c * x;
      } while (v <= 0);
      v = v * v * v;
      const u = Math.random();
      if (u < 1.0 - 0.0331 * x * x * x * x) {
        return scale * d * v * Math.pow(Math.random(), 1.0/shape);
      }
      if (Math.log(u) < 0.5 * x * x + d * (1.0 - v + Math.log(v))) {
        return scale * d * v * Math.pow(Math.random(), 1.0/shape);
      }
      return this._gammaSample(shape, scale);
    } else {
      const d = shape - 1.0/3.0;
      const c = 1.0 / Math.sqrt(9.0 * d);
      let x, v;
      do {
        x = this._normalSample(0, 1);
        v = 1.0 + c * x;
      } while (v <= 0);
      v = v * v * v;
      const u = Math.random();
      if (u < 1.0 - 0.0331 * x * x * x * x) {
        return scale * d * v;
      }
      if (Math.log(u) < 0.5 * x * x + d * (1.0 - v + Math.log(v))) {
        return scale * d * v;
      }
      return this._gammaSample(shape, scale);
    }
  }
  
  /**
   * Update priors with new data (Bayesian update)
   * @param {Object} observation Observed data
   * @param {number} observation.yield Observed yield
   * @param {number} observation.volatility Observed volatility
   * @param {number} observation.sentiment Observed sentiment
   * @private
   */
  _updatePriors(observation) {
    // Simple Bayesian update using weighted average
    const weight = this.learningRate;
    
    // Update base yield prior
    this.priors.baseYield.mean = (1 - weight) * this.priors.baseYield.mean + weight * observation.yield;
    
    // Update volatility prior
    this.priors.volatility.mean = (1 - weight) * this.priors.volatility.mean + weight * observation.volatility;
    
    // Update sentiment impact prior
    this.priors.sentimentImpact.mean = (1 - weight) * this.priors.sentimentImpact.mean + weight * observation.sentiment;
    
    // Add observation to historical data
    this.historicalData.push({
      timestamp: Date.now(),
      observation
    });
    
    // Keep only the last 100 observations
    if (this.historicalData.length > 100) {
      this.historicalData.shift();
    }
    
    // Save updated historical data
    this._saveHistoricalData();
  }
  
  /**
   * Simulate a single yield path
   * @param {Object} params Simulation parameters
   * @returns {number} Simulated yield
   * @private
   */
  _simulateYield(params) {
    // Extract parameters with defaults
    const vol = params.vol || this.priors.volatility.mean;
    const baseYield = params.baseYield || this.priors.baseYield.mean;
    const sentimentBoost = params.sentimentBoost || 1.0;
    const ecoBoostMultiplier = params.ecoBoostMultiplier || 1.0;
    
    // Base yield with random variation
    let yield = this._normalSample(baseYield, baseYield * vol);
    
    // Apply sentiment boost
    yield *= sentimentBoost;
    
    // Apply eco boost for sustainable strategies
    if (params.ecoFocus) {
      yield *= ecoBoostMultiplier;
    }
    
    // Apply hedging effect if specified
    if (params.hedge === 'RLUSD') {
      // RLUSD hedging reduces volatility but may cap upside
      yield = Math.min(yield, baseYield * 1.5);
      yield = Math.max(yield, baseYield * 0.8);
    }
    
    // Convert to percentage
    yield *= 100;
    
    return yield;
  }
  
  /**
   * Run a Monte Carlo forecast
   * @param {Object} params Forecast parameters
   * @param {number} params.vol Volatility parameter (0-1)
   * @param {number} params.baseYield Base yield expectation
   * @param {number} params.sentimentBoost Sentiment multiplier
   * @param {boolean} params.ecoFocus Whether to apply eco-boost
   * @param {number} params.ecoBoostMultiplier Eco-boost multiplier
   * @param {string} params.hedge Hedging strategy ('RLUSD', etc.)
   * @returns {Promise<Object>} Forecast results
   */
  async forecast(params = {}) {
    console.log('Running Adaptive Monte Carlo forecast...');
    console.log(`Parameters: ${JSON.stringify(params)}`);
    
    // Run Monte Carlo simulation
    const yields = [];
    for (let i = 0; i < this.iterations; i++) {
      yields.push(this._simulateYield(params));
    }
    
    // Calculate statistics
    const meanYield = yields.reduce((sum, y) => sum + y, 0) / yields.length;
    
    // Calculate standard deviation
    const variance = yields.reduce((sum, y) => sum + Math.pow(y - meanYield, 2), 0) / yields.length;
    const stdDev = Math.sqrt(variance);
    
    // Calculate confidence interval
    const alpha = 1 - this.confidenceLevel;
    const z = 1.96; // Approximate z-score for 95% confidence
    const marginOfError = z * stdDev / Math.sqrt(yields.length);
    const confidenceInterval = {
      lower: meanYield - marginOfError,
      upper: meanYield + marginOfError
    };
    
    // Calculate percentiles
    yields.sort((a, b) => a - b);
    const percentiles = {
      p5: yields[Math.floor(0.05 * yields.length)],
      p25: yields[Math.floor(0.25 * yields.length)],
      p50: yields[Math.floor(0.5 * yields.length)],
      p75: yields[Math.floor(0.75 * yields.length)],
      p95: yields[Math.floor(0.95 * yields.length)]
    };
    
    // Create histogram
    const histogramBins = 20;
    const min = Math.floor(percentiles.p5);
    const max = Math.ceil(percentiles.p95);
    const binSize = (max - min) / histogramBins;
    const histogram = Array(histogramBins).fill(0);
    
    yields.forEach(y => {
      const binIndex = Math.min(
        Math.floor((y - min) / binSize),
        histogramBins - 1
      );
      if (binIndex >= 0) {
        histogram[binIndex]++;
      }
    });
    
    // Normalize histogram
    const maxBinCount = Math.max(...histogram);
    const normalizedHistogram = histogram.map(count => count / maxBinCount);
    
    // Generate forecast report
    const results = {
      meanYield,
      stdDev,
      confidenceInterval,
      percentiles,
      histogram: {
        bins: Array.from({ length: histogramBins }, (_, i) => min + i * binSize),
        counts: histogram,
        normalized: normalizedHistogram
      },
      params,
      timestamp: Date.now(),
      iterations: this.iterations,
      ecoBoostMultiplier: params.ecoBoostMultiplier || 1.0
    };
    
    // Save forecast report
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportFile = path.join(this.outputDir, `forecast-${timestamp}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(results, null, 2));
    
    console.log(`Forecast complete: Mean yield ${meanYield.toFixed(2)}% ± ${stdDev.toFixed(2)}%`);
    console.log(`95% Confidence Interval: ${confidenceInterval.lower.toFixed(2)}% to ${confidenceInterval.upper.toFixed(2)}%`);
    console.log(`Report saved to: ${reportFile}`);
    
    return results;
  }
  
  /**
   * Update the model with observed data
   * @param {Object} observation Observed data
   * @returns {Promise<void>}
   */
  async updateModel(observation) {
    this._updatePriors(observation);
    console.log('Model updated with new observation data');
    console.log(`Updated priors: ${JSON.stringify(this.priors)}`);
  }
  
  /**
   * Generate a forecast report with visualizations
   * @param {Object} results Forecast results
   * @returns {Promise<string>} Path to the generated report
   */
  async generateReport(results) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const reportPath = path.join(this.outputDir, `report-${timestamp}.html`);
    
    // Create HTML report with Chart.js
    const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>XRPL Liquidity Provider Bot - Yield Forecast</title>
      <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .stats { background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
        .chart-container { height: 400px; margin-bottom: 30px; }
        .parameters { margin-top: 20px; padding: 15px; border-radius: 5px; background: #e6f7ff; }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>XRPL Liquidity Provider Bot - Yield Forecast</h1>
        
        <div class="stats">
          <h2>Forecast Results</h2>
          <p><strong>Mean Yield:</strong> ${results.meanYield.toFixed(2)}%</p>
          <p><strong>Standard Deviation:</strong> ±${results.stdDev.toFixed(2)}%</p>
          <p><strong>95% Confidence Interval:</strong> ${results.confidenceInterval.lower.toFixed(2)}% to ${results.confidenceInterval.upper.toFixed(2)}%</p>
          <p><strong>Iterations:</strong> ${results.iterations.toLocaleString()}</p>
        </div>
        
        <div class="chart-container">
          <h2>Yield Distribution</h2>
          <canvas id="histogramChart"></canvas>
        </div>
        
        <div class="chart-container">
          <h2>Percentile Analysis</h2>
          <canvas id="percentileChart"></canvas>
        </div>
        
        <div class="parameters">
          <h2>Simulation Parameters</h2>
          <ul>
            <li><strong>Volatility:</strong> ${(results.params.vol || 0.25).toFixed(2)}</li>
            <li><strong>Base Yield:</strong> ${((results.params.baseYield || 0.12) * 100).toFixed(2)}%</li>
            <li><strong>Sentiment Boost:</strong> ${(results.params.sentimentBoost || 1).toFixed(2)}x</li>
            <li><strong>Eco-Focus:</strong> ${results.params.ecoFocus ? 'Yes' : 'No'}</li>
            <li><strong>Eco-Boost Multiplier:</strong> ${(results.params.ecoBoostMultiplier || 1).toFixed(2)}x</li>
            <li><strong>Hedging Strategy:</strong> ${results.params.hedge || 'None'}</li>
          </ul>
        </div>
      </div>
      
      <script>
        // Create histogram chart
        const histogramCtx = document.getElementById('histogramChart').getContext('2d');
        new Chart(histogramCtx, {
          type: 'bar',
          data: {
            labels: ${JSON.stringify(results.histogram.bins.map(b => b.toFixed(1)))},
            datasets: [{
              label: 'Yield Distribution (%)',
              data: ${JSON.stringify(results.histogram.counts)},
              backgroundColor: 'rgba(54, 162, 235, 0.5)',
              borderColor: 'rgba(54, 162, 235, 1)',
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Yield Distribution'
              }
            }
          }
        });
        
        // Create percentile chart
        const percentileCtx = document.getElementById('percentileChart').getContext('2d');
        new Chart(percentileCtx, {
          type: 'line',
          data: {
            labels: ['5th', '25th', '50th (Median)', '75th', '95th'],
            datasets: [{
              label: 'Yield Percentiles (%)',
              data: [
                ${results.percentiles.p5.toFixed(2)},
                ${results.percentiles.p25.toFixed(2)},
                ${results.percentiles.p50.toFixed(2)},
                ${results.percentiles.p75.toFixed(2)},
                ${results.percentiles.p95.toFixed(2)}
              ],
              backgroundColor: 'rgba(75, 192, 192, 0.2)',
              borderColor: 'rgba(75, 192, 192, 1)',
              borderWidth: 2,
              pointBackgroundColor: 'rgba(75, 192, 192, 1)',
              pointRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Yield Percentiles'
              }
            },
            scales: {
              y: {
                beginAtZero: false
              }
            }
          }
        });
      </script>
    </body>
    </html>
    `;
    
    fs.writeFileSync(reportPath, html);
    console.log(`Forecast report generated: ${reportPath}`);
    return reportPath;
  }
}

module.exports = { AdaptiveMonteCarlo };
