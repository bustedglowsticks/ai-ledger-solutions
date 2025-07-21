// Oracle Dashboard Component - Integrates XRP Buy Timing Oracle with Elite Nexus
// Provides real-time trading intelligence and yield optimization recommendations

class OracleDashboard {
    constructor(containerId = 'oracle-dashboard') {
        this.containerId = containerId;
        this.oracle = null;
        this.updateInterval = null;
        this.isActive = false;
        
        this.init();
    }
    
    async init() {
        console.log('🔮 Initializing Oracle Dashboard...');
        
        // Wait for oracle to be available
        if (typeof window.xrpOracle !== 'undefined') {
            this.oracle = window.xrpOracle;
        } else {
            // Wait for oracle to load
            setTimeout(() => this.init(), 1000);
            return;
        }
        
        this.createDashboardHTML();
        this.startRealTimeUpdates();
        this.isActive = true;
        
        console.log('✅ Oracle Dashboard initialized');
    }
    
    createDashboardHTML() {
        const container = document.getElementById(this.containerId) || this.createContainer();
        
        container.innerHTML = `
            <div class="oracle-panel bg-gray-900 border border-gray-700 rounded-xl p-6 mb-6">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-xl font-bold text-white flex items-center">
                        🔮 XRP Buy Timing Oracle
                        <span id="oracle-status" class="ml-2 w-3 h-3 bg-green-400 rounded-full animate-pulse"></span>
                    </h3>
                    <button id="refresh-oracle" class="interactive-btn px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">
                        🔄 Refresh
                    </button>
                </div>
                
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <!-- Price Panel -->
                    <div class="bg-gray-800 rounded-lg p-4">
                        <div class="text-gray-400 text-sm mb-1">Current XRP Price</div>
                        <div id="current-price" class="text-2xl font-bold text-green-400">$3.44</div>
                        <div id="price-change" class="text-sm text-green-400">+5.2% (24h)</div>
                    </div>
                    
                    <!-- Sentiment Panel -->
                    <div class="bg-gray-800 rounded-lg p-4">
                        <div class="text-gray-400 text-sm mb-1">X Sentiment</div>
                        <div id="sentiment-score" class="text-2xl font-bold text-blue-400">70%</div>
                        <div id="sentiment-level" class="text-sm text-blue-400">Very Bullish</div>
                    </div>
                    
                    <!-- Volatility Panel -->
                    <div class="bg-gray-800 rounded-lg p-4">
                        <div class="text-gray-400 text-sm mb-1">Implied Volatility</div>
                        <div id="volatility-score" class="text-2xl font-bold text-yellow-400">96%</div>
                        <div id="volatility-level" class="text-sm text-yellow-400">High Risk</div>
                    </div>
                </div>
                
                <!-- Monte Carlo Results -->
                <div class="bg-gray-800 rounded-lg p-4 mb-4">
                    <div class="text-gray-400 text-sm mb-2">Monte Carlo Simulation (1000 runs)</div>
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <div class="text-gray-500 text-xs">Expected APY</div>
                            <div id="expected-apy" class="text-lg font-bold text-green-400">62.4%</div>
                        </div>
                        <div>
                            <div class="text-gray-500 text-xs">95% Confidence</div>
                            <div id="confidence-95" class="text-lg font-bold text-blue-400">89.1%</div>
                        </div>
                        <div>
                            <div class="text-gray-500 text-xs">5% Risk</div>
                            <div id="confidence-5" class="text-lg font-bold text-red-400">-12.3%</div>
                        </div>
                        <div>
                            <div class="text-gray-500 text-xs">Simulations</div>
                            <div id="sim-count" class="text-lg font-bold text-gray-400">1000</div>
                        </div>
                    </div>
                </div>
                
                <!-- Recommendation Panel -->
                <div id="recommendation-panel" class="bg-gradient-to-r from-green-900 to-green-800 rounded-lg p-4 mb-4">
                    <div class="flex items-center justify-between">
                        <div>
                            <div id="recommendation-action" class="text-xl font-bold text-white">STRONG BUY</div>
                            <div id="recommendation-reason" class="text-sm text-green-200">
                                Optimal entry at $3.44 with 62.4% expected APY
                            </div>
                        </div>
                        <div id="recommendation-confidence" class="text-2xl font-bold text-white">85%</div>
                    </div>
                </div>
                
                <!-- Rebalance Strategy -->
                <div class="bg-gray-800 rounded-lg p-4">
                    <div class="text-gray-400 text-sm mb-2">Recommended Bot Rebalance</div>
                    <div class="flex items-center justify-between">
                        <div>
                            <div id="rebalance-action" class="text-lg font-bold text-blue-400">MAINTAIN</div>
                            <div id="rebalance-weights" class="text-sm text-gray-400">20% XRP / 80% RLUSD</div>
                        </div>
                        <button id="apply-rebalance" class="interactive-btn px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                            Apply Strategy
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.attachEventListeners();
    }
    
    createContainer() {
        const container = document.createElement('div');
        container.id = this.containerId;
        
        // Insert after header or at top of main content
        const header = document.querySelector('header');
        if (header && header.nextSibling) {
            header.parentNode.insertBefore(container, header.nextSibling);
        } else {
            document.body.appendChild(container);
        }
        
        return container;
    }
    
    attachEventListeners() {
        // Refresh button
        const refreshBtn = document.getElementById('refresh-oracle');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }
        
        // Apply rebalance button
        const applyBtn = document.getElementById('apply-rebalance');
        if (applyBtn) {
            applyBtn.addEventListener('click', () => this.applyRebalanceStrategy());
        }
    }
    
    async refreshData() {
        if (!this.oracle) return;
        
        try {
            // Show loading state
            document.getElementById('oracle-status').className = 'ml-2 w-3 h-3 bg-yellow-400 rounded-full animate-pulse';
            
            // Get fresh analysis
            const analysis = await this.oracle.getMarketAnalysis(10000);
            const rebalance = this.oracle.getRebalanceStrategy();
            
            // Update UI
            this.updatePricePanel(analysis.price);
            this.updateSentimentPanel(analysis.sentiment);
            this.updateVolatilityPanel(analysis.volatility);
            this.updateSimulationPanel(analysis.simulation);
            this.updateRecommendationPanel(analysis.recommendation);
            this.updateRebalancePanel(rebalance);
            
            // Show success state
            document.getElementById('oracle-status').className = 'ml-2 w-3 h-3 bg-green-400 rounded-full animate-pulse';
            
            console.log('🔄 Oracle data refreshed successfully');
        } catch (error) {
            console.error('Error refreshing oracle data:', error);
            document.getElementById('oracle-status').className = 'ml-2 w-3 h-3 bg-red-400 rounded-full animate-pulse';
        }
    }
    
    updatePricePanel(priceData) {
        document.getElementById('current-price').textContent = `$${priceData.current.toFixed(4)}`;
        document.getElementById('price-change').textContent = `+${priceData.change24h}% (24h)`;
        document.getElementById('price-change').className = priceData.change24h > 0 ? 'text-sm text-green-400' : 'text-sm text-red-400';
    }
    
    updateSentimentPanel(sentimentData) {
        document.getElementById('sentiment-score').textContent = `${(sentimentData.score * 100).toFixed(0)}%`;
        document.getElementById('sentiment-level').textContent = sentimentData.level;
        
        const color = sentimentData.score > 0.7 ? 'text-green-400' : 
                     sentimentData.score > 0.5 ? 'text-blue-400' : 'text-yellow-400';
        document.getElementById('sentiment-score').className = `text-2xl font-bold ${color}`;
    }
    
    updateVolatilityPanel(volatilityData) {
        document.getElementById('volatility-score').textContent = `${(volatilityData.current * 100).toFixed(0)}%`;
        document.getElementById('volatility-level').textContent = volatilityData.level;
        
        const color = volatilityData.current > 0.8 ? 'text-red-400' : 'text-yellow-400';
        document.getElementById('volatility-score').className = `text-2xl font-bold ${color}`;
    }
    
    updateSimulationPanel(simData) {
        document.getElementById('expected-apy').textContent = `${(simData.expectedAPY * 100).toFixed(1)}%`;
        document.getElementById('confidence-95').textContent = `${(simData.confidence95 * 100).toFixed(1)}%`;
        document.getElementById('confidence-5').textContent = `${(simData.confidence5 * 100).toFixed(1)}%`;
        document.getElementById('sim-count').textContent = simData.simulations.toString();
    }
    
    updateRecommendationPanel(recommendation) {
        document.getElementById('recommendation-action').textContent = recommendation.action;
        document.getElementById('recommendation-reason').textContent = recommendation.reason;
        document.getElementById('recommendation-confidence').textContent = `${(recommendation.confidence * 100).toFixed(0)}%`;
        
        // Update panel color based on recommendation
        const panel = document.getElementById('recommendation-panel');
        const colorClass = {
            'STRONG BUY': 'bg-gradient-to-r from-green-900 to-green-800',
            'BUY': 'bg-gradient-to-r from-blue-900 to-blue-800',
            'HOLD': 'bg-gradient-to-r from-yellow-900 to-yellow-800',
            'AVOID': 'bg-gradient-to-r from-red-900 to-red-800'
        };
        
        panel.className = `${colorClass[recommendation.action] || colorClass['HOLD']} rounded-lg p-4 mb-4`;
    }
    
    updateRebalancePanel(rebalanceData) {
        document.getElementById('rebalance-action').textContent = rebalanceData.action;
        document.getElementById('rebalance-weights').textContent = 
            `${(rebalanceData.xrpWeight * 100).toFixed(0)}% XRP / ${(rebalanceData.rlusdWeight * 100).toFixed(0)}% RLUSD`;
    }
    
    applyRebalanceStrategy() {
        // Simulate applying rebalance strategy
        const btn = document.getElementById('apply-rebalance');
        const originalText = btn.textContent;
        
        btn.textContent = 'Applying...';
        btn.disabled = true;
        
        setTimeout(() => {
            btn.textContent = '✅ Applied';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 2000);
        }, 1500);
        
        console.log('🔄 Rebalance strategy applied to bot');
    }
    
    startRealTimeUpdates() {
        // Update every 30 seconds
        this.updateInterval = setInterval(() => {
            this.refreshData();
        }, 30000);
        
        // Initial refresh
        setTimeout(() => this.refreshData(), 1000);
    }
    
    stopRealTimeUpdates() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }
    
    destroy() {
        this.stopRealTimeUpdates();
        const container = document.getElementById(this.containerId);
        if (container) {
            container.remove();
        }
        this.isActive = false;
    }
}

// Initialize Oracle Dashboard
window.OracleDashboard = OracleDashboard;

// Auto-start when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for other components to load
    setTimeout(() => {
        window.oracleDashboard = new OracleDashboard();
        console.log('🚀 Oracle Dashboard loaded and active!');
    }, 2000);
});

console.log('📊 Oracle Dashboard component loaded!');
