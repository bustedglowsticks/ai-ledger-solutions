/**
 * Circuit Breaker
 * 
 * Advanced risk management system that monitors market conditions and
 * automatically triggers protective actions when predefined thresholds
 * are breached. Implements sophisticated circuit breaker patterns to
 * prevent catastrophic losses during extreme market events.
 */

const EventEmitter = require('events');

class CircuitBreaker extends EventEmitter {
  /**
   * Initialize the Circuit Breaker
   * 
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    super();
    
    this.options = {
      checkInterval: 30000, // 30 seconds
      resetTimeout: 3600000, // 1 hour
      thresholds: {
        volatility: 0.05, // 5% volatility
        drawdown: 0.1, // 10% drawdown
        sentimentDrop: 0.2, // 20% sentiment drop
        volumeSpike: 3.0, // 3x normal volume
        priceGap: 0.03 // 3% price gap
      },
      ...options
    };
    
    this.state = {
      initialized: false,
      active: false,
      lastTriggered: null,
      lastReset: null,
      currentBreaches: {},
      breachHistory: [],
      marketState: {},
      protectiveActions: []
    };
    
    // Bind methods
    this.initialize = this.initialize.bind(this);
    this.check = this.check.bind(this);
    this.reset = this.reset.bind(this);
    this.updateMarketState = this.updateMarketState.bind(this);
    this.registerProtectiveAction = this.registerProtectiveAction.bind(this);
    this._evaluateBreaches = this._evaluateBreaches.bind(this);
    this._executeProtectiveActions = this._executeProtectiveActions.bind(this);
  }
  
  /**
   * Initialize the circuit breaker
   * 
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      this.state.initialized = true;
      this.state.active = false;
      this.state.lastReset = Date.now();
      
      // Register default protective actions
      this.registerProtectiveAction({
        name: 'pause-trading',
        priority: 1,
        action: async () => {
          this.emit('pause-trading', {
            timestamp: Date.now(),
            reason: 'circuit-breaker-triggered'
          });
          return true;
        }
      });
      
      this.registerProtectiveAction({
        name: 'reduce-exposure',
        priority: 2,
        action: async () => {
          this.emit('reduce-exposure', {
            timestamp: Date.now(),
            reason: 'circuit-breaker-triggered',
            targetExposure: 0.5 // Reduce to 50%
          });
          return true;
        }
      });
      
      // Start check interval
      if (this.options.autoCheck) {
        this._startCheckInterval();
      }
      
      this.emit('initialized', {
        timestamp: Date.now(),
        state: this.state
      });
      
      return true;
    } catch (error) {
      this.emit('error', {
        message: 'Failed to initialize Circuit Breaker',
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Check for threshold breaches
   * 
   * @returns {Promise<Object>} Check result
   */
  async check() {
    try {
      // Skip if already active
      if (this.state.active) {
        return {
          active: true,
          breaches: this.state.currentBreaches,
          lastTriggered: this.state.lastTriggered
        };
      }
      
      // Evaluate breaches
      const breaches = await this._evaluateBreaches();
      
      // Update state
      this.state.currentBreaches = breaches;
      
      // Check if any thresholds are breached
      const breachCount = Object.values(breaches).filter(breach => breach.breached).length;
      
      if (breachCount > 0) {
        // Trigger circuit breaker
        this.state.active = true;
        this.state.lastTriggered = Date.now();
        
        // Add to breach history
        this.state.breachHistory.push({
          timestamp: Date.now(),
          breaches,
          marketState: { ...this.state.marketState }
        });
        
        // Trim history if too long
        if (this.state.breachHistory.length > 100) {
          this.state.breachHistory = this.state.breachHistory.slice(-100);
        }
        
        // Execute protective actions
        await this._executeProtectiveActions();
        
        // Emit event
        this.emit('triggered', {
          timestamp: Date.now(),
          breaches,
          marketState: this.state.marketState
        });
        
        // Schedule reset
        if (this.options.autoReset) {
          setTimeout(() => {
            this.reset();
          }, this.options.resetTimeout);
        }
      }
      
      return {
        active: this.state.active,
        breaches,
        breachCount,
        lastChecked: Date.now()
      };
    } catch (error) {
      this.emit('error', {
        message: 'Failed to check circuit breaker',
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Reset the circuit breaker
   * 
   * @returns {Promise<boolean>} Success status
   */
  async reset() {
    try {
      // Skip if not active
      if (!this.state.active) {
        return true;
      }
      
      // Check if enough time has passed
      const timeSinceTriggered = Date.now() - this.state.lastTriggered;
      if (timeSinceTriggered < this.options.resetTimeout) {
        this.emit('reset-rejected', {
          timestamp: Date.now(),
          reason: 'timeout-not-elapsed',
          remainingTime: this.options.resetTimeout - timeSinceTriggered
        });
        
        return false;
      }
      
      // Reset state
      this.state.active = false;
      this.state.lastReset = Date.now();
      this.state.currentBreaches = {};
      
      // Emit event
      this.emit('reset', {
        timestamp: Date.now(),
        timeSinceTriggered
      });
      
      return true;
    } catch (error) {
      this.emit('error', {
        message: 'Failed to reset circuit breaker',
        error: error.message
      });
      
      throw error;
    }
  }
  
  /**
   * Update market state
   * 
   * @param {Object} marketData - Market data
   */
  updateMarketState(marketData) {
    this.state.marketState = {
      ...this.state.marketState,
      ...marketData,
      lastUpdated: Date.now()
    };
  }
  
  /**
   * Register a protective action
   * 
   * @param {Object} action - Protective action
   * @param {string} action.name - Action name
   * @param {number} action.priority - Action priority (lower = higher priority)
   * @param {Function} action.action - Action function
   */
  registerProtectiveAction(action) {
    // Validate action
    if (!action.name || !action.action || typeof action.action !== 'function') {
      throw new Error('Invalid protective action');
    }
    
    // Set default priority if not provided
    if (!action.priority) {
      action.priority = 10;
    }
    
    // Add to protective actions
    this.state.protectiveActions.push(action);
    
    // Sort by priority
    this.state.protectiveActions.sort((a, b) => a.priority - b.priority);
  }
  
  /**
   * Start check interval
   * 
   * @private
   */
  _startCheckInterval() {
    setInterval(async () => {
      try {
        await this.check();
      } catch (error) {
        this.emit('error', {
          message: 'Failed to auto-check circuit breaker',
          error: error.message
        });
      }
    }, this.options.checkInterval);
  }
  
  /**
   * Evaluate threshold breaches
   * 
   * @private
   * @returns {Promise<Object>} Breach evaluation
   */
  async _evaluateBreaches() {
    const breaches = {};
    const { thresholds } = this.options;
    const { marketState } = this.state;
    
    // Check volatility
    if (marketState.volatility !== undefined) {
      breaches.volatility = {
        threshold: thresholds.volatility,
        current: marketState.volatility,
        breached: marketState.volatility > thresholds.volatility
      };
    }
    
    // Check drawdown
    if (marketState.drawdown !== undefined) {
      breaches.drawdown = {
        threshold: thresholds.drawdown,
        current: marketState.drawdown,
        breached: marketState.drawdown > thresholds.drawdown
      };
    }
    
    // Check sentiment drop
    if (marketState.sentimentDrop !== undefined) {
      breaches.sentimentDrop = {
        threshold: thresholds.sentimentDrop,
        current: marketState.sentimentDrop,
        breached: marketState.sentimentDrop > thresholds.sentimentDrop
      };
    }
    
    // Check volume spike
    if (marketState.volumeRatio !== undefined) {
      breaches.volumeSpike = {
        threshold: thresholds.volumeSpike,
        current: marketState.volumeRatio,
        breached: marketState.volumeRatio > thresholds.volumeSpike
      };
    }
    
    // Check price gap
    if (marketState.priceGap !== undefined) {
      breaches.priceGap = {
        threshold: thresholds.priceGap,
        current: marketState.priceGap,
        breached: marketState.priceGap > thresholds.priceGap
      };
    }
    
    return breaches;
  }
  
  /**
   * Execute protective actions
   * 
   * @private
   * @returns {Promise<boolean>} Success status
   */
  async _executeProtectiveActions() {
    try {
      // Execute actions in priority order
      for (const action of this.state.protectiveActions) {
        try {
          await action.action();
        } catch (error) {
          this.emit('error', {
            message: `Failed to execute protective action: ${action.name}`,
            error: error.message
          });
        }
      }
      
      return true;
    } catch (error) {
      this.emit('error', {
        message: 'Failed to execute protective actions',
        error: error.message
      });
      
      return false;
    }
  }
}

module.exports = { CircuitBreaker };
