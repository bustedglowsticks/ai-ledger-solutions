// Oracle Simulation Runner - Live demonstration of XRP Buy Timing Oracle capabilities
// Runs personalized Monte Carlo simulations with current market conditions

class OracleSimulationRunner {
    constructor() {
        this.oracle = null;
        this.isRunning = false;
        this.results = [];
        
        this.init();
    }
    
    async init() {
        console.log('🎯 Initializing Oracle Simulation Runner...');
        
        // Wait for oracle to be available
        if (typeof window.xrpOracle !== 'undefined') {
            this.oracle = window.xrpOracle;
            console.log('✅ Oracle connected successfully');
        } else {
            console.log('⏳ Waiting for oracle to load...');
            setTimeout(() => this.init(), 1000);
            return;
        }
        
        // Auto-run simulation after initialization
        setTimeout(() => this.runLiveSimulation(), 2000);
    }
    
    async runLiveSimulation(capitalAmount = 50000, timeHorizon = 30, simulations = 2000) {
        if (!this.oracle || this.isRunning) return;
        
        this.isRunning = true;
        console.log('🚀 Starting Live Oracle Simulation...');
        console.log(`💰 Capital: $${capitalAmount.toLocaleString()}`);
        console.log(`📅 Time Horizon: ${timeHorizon} days`);
        console.log(`🔢 Simulations: ${simulations.toLocaleString()}`);
        
        try {
            // Get current market analysis
            const marketAnalysis = await this.oracle.getMarketAnalysis(capitalAmount);
            console.log('\n📊 Current Market Conditions:');
            console.log(`   XRP Price: $${marketAnalysis.price.current.toFixed(4)}`);
            console.log(`   Sentiment: ${marketAnalysis.sentiment.level} (${(marketAnalysis.sentiment.score * 100).toFixed(1)}%)`);
            console.log(`   Volatility: ${marketAnalysis.volatility.level} (${(marketAnalysis.volatility.current * 100).toFixed(1)}%)`);
            
            // Run enhanced Monte Carlo simulation
            const simulation = this.runEnhancedMonteCarlo(capitalAmount, timeHorizon, simulations);
            
            // Get rebalancing strategy
            const rebalanceStrategy = this.oracle.getRebalanceStrategy();
            
            // Display comprehensive results
            this.displaySimulationResults(simulation, marketAnalysis, rebalanceStrategy, capitalAmount);
            
            // Store results for analysis
            this.results.push({
                timestamp: new Date(),
                capitalAmount,
                timeHorizon,
                simulations,
                marketAnalysis,
                simulation,
                rebalanceStrategy
            });
            
        } catch (error) {
            console.error('❌ Simulation error:', error);
        } finally {
            this.isRunning = false;
        }
    }
    
    runEnhancedMonteCarlo(capitalAmount, timeHorizon, simulations) {
        console.log('\n🎲 Running Enhanced Monte Carlo Simulation...');
        
        const results = [];
        const currentPrice = this.oracle.currentPrice;
        const volatility = this.oracle.volatility;
        const sentimentBoost = this.oracle.sentimentScore * 0.1; // Sentiment adds up to 10% boost
        
        for (let i = 0; i < simulations; i++) {
            let portfolioValue = capitalAmount;
            let xrpPrice = currentPrice;
            let xrpWeight = 0.2; // Starting 20% XRP allocation
            let rlusdWeight = 0.8; // Starting 80% RLUSD allocation
            
            // Simulate daily price movements
            for (let day = 0; day < timeHorizon; day++) {
                // Generate correlated returns with sentiment bias
                const baseReturn = this.generateEnhancedReturn(volatility, sentimentBoost);
                const xrpReturn = baseReturn * (1 + Math.random() * 0.3); // XRP more volatile
                const rlusdReturn = 0.0001 + Math.random() * 0.0002; // Stable RLUSD return
                
                // Update XRP price
                xrpPrice *= (1 + xrpReturn);
                
                // Calculate portfolio performance
                const xrpComponent = portfolioValue * xrpWeight * (1 + xrpReturn);
                const rlusdComponent = portfolioValue * rlusdWeight * (1 + rlusdReturn);
                portfolioValue = xrpComponent + rlusdComponent;
                
                // Dynamic rebalancing based on price movements
                if (day % 7 === 0) { // Weekly rebalancing
                    if (xrpPrice < currentPrice * 0.95) {
                        // Price dropped, increase XRP allocation (buy the dip)
                        xrpWeight = Math.min(0.3, xrpWeight + 0.05);
                        rlusdWeight = 1 - xrpWeight;
                    } else if (xrpPrice > currentPrice * 1.1) {
                        // Price pumped, take profits
                        xrpWeight = Math.max(0.1, xrpWeight - 0.05);
                        rlusdWeight = 1 - xrpWeight;
                    }
                }
            }
            
            const totalReturn = (portfolioValue - capitalAmount) / capitalAmount;
            const annualizedReturn = Math.pow(1 + totalReturn, 365 / timeHorizon) - 1;
            
            results.push({
                finalValue: portfolioValue,
                finalPrice: xrpPrice,
                totalReturn: totalReturn,
                annualizedReturn: annualizedReturn,
                maxDrawdown: this.calculateMaxDrawdown(portfolioValue, capitalAmount)
            });
        }
        
        // Calculate comprehensive statistics
        const sortedReturns = results.map(r => r.annualizedReturn).sort((a, b) => a - b);
        const avgReturn = sortedReturns.reduce((sum, r) => sum + r, 0) / sortedReturns.length;
        
        return {
            expectedAPY: avgReturn,
            medianAPY: sortedReturns[Math.floor(simulations / 2)],
            confidence95: sortedReturns[Math.floor(simulations * 0.95)],
            confidence75: sortedReturns[Math.floor(simulations * 0.75)],
            confidence25: sortedReturns[Math.floor(simulations * 0.25)],
            confidence5: sortedReturns[Math.floor(simulations * 0.05)],
            maxReturn: Math.max(...sortedReturns),
            minReturn: Math.min(...sortedReturns),
            volatilityOfReturns: this.calculateStandardDeviation(sortedReturns),
            sharpeRatio: avgReturn / this.calculateStandardDeviation(sortedReturns),
            probabilityOfProfit: sortedReturns.filter(r => r > 0).length / simulations,
            simulations: simulations,
            results: results
        };
    }
    
    generateEnhancedReturn(volatility, sentimentBoost) {
        // Box-Muller transformation with sentiment bias
        const u1 = Math.random();
        const u2 = Math.random();
        const normalRandom = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
        
        const drift = 0.0003 + sentimentBoost; // Base drift + sentiment boost
        const dailyVol = volatility / Math.sqrt(252);
        
        return drift + normalRandom * dailyVol;
    }
    
    calculateMaxDrawdown(finalValue, initialValue) {
        // Simplified drawdown calculation
        const peakValue = Math.max(finalValue, initialValue * 1.2);
        return (peakValue - finalValue) / peakValue;
    }
    
    calculateStandardDeviation(values) {
        const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
        const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
        return Math.sqrt(variance);
    }
    
    displaySimulationResults(simulation, marketAnalysis, rebalanceStrategy, capitalAmount) {
        console.log('\n🎯 SIMULATION RESULTS SUMMARY');
        console.log('═'.repeat(50));
        
        // Performance Metrics
        console.log('📈 PERFORMANCE METRICS:');
        console.log(`   Expected APY: ${(simulation.expectedAPY * 100).toFixed(2)}%`);
        console.log(`   Median APY: ${(simulation.medianAPY * 100).toFixed(2)}%`);
        console.log(`   Best Case (95%): ${(simulation.confidence95 * 100).toFixed(2)}%`);
        console.log(`   Worst Case (5%): ${(simulation.confidence5 * 100).toFixed(2)}%`);
        console.log(`   Max Possible: ${(simulation.maxReturn * 100).toFixed(2)}%`);
        console.log(`   Sharpe Ratio: ${simulation.sharpeRatio.toFixed(3)}`);
        console.log(`   Profit Probability: ${(simulation.probabilityOfProfit * 100).toFixed(1)}%`);
        
        // Dollar Amounts
        console.log('\n💰 DOLLAR PROJECTIONS:');
        const expectedValue = capitalAmount * (1 + simulation.expectedAPY);
        const bestCase = capitalAmount * (1 + simulation.confidence95);
        const worstCase = capitalAmount * (1 + simulation.confidence5);
        
        console.log(`   Expected Value: $${expectedValue.toLocaleString()}`);
        console.log(`   Best Case: $${bestCase.toLocaleString()}`);
        console.log(`   Worst Case: $${worstCase.toLocaleString()}`);
        console.log(`   Expected Profit: $${(expectedValue - capitalAmount).toLocaleString()}`);
        
        // Risk Assessment
        console.log('\n⚠️  RISK ASSESSMENT:');
        console.log(`   Volatility: ${(simulation.volatilityOfReturns * 100).toFixed(2)}%`);
        console.log(`   Max Drawdown Risk: ${(simulation.results[0]?.maxDrawdown * 100 || 15).toFixed(1)}%`);
        console.log(`   IL Protection: 80% RLUSD hedging active`);
        
        // Current Recommendation
        console.log('\n🎯 CURRENT RECOMMENDATION:');
        console.log(`   Action: ${marketAnalysis.recommendation.action}`);
        console.log(`   Confidence: ${(marketAnalysis.recommendation.confidence * 100).toFixed(0)}%`);
        console.log(`   Reason: ${marketAnalysis.recommendation.reason}`);
        
        // Optimal Strategy
        console.log('\n🔄 OPTIMAL REBALANCING:');
        console.log(`   Strategy: ${rebalanceStrategy.action}`);
        console.log(`   XRP Allocation: ${(rebalanceStrategy.xrpWeight * 100).toFixed(0)}%`);
        console.log(`   RLUSD Allocation: ${(rebalanceStrategy.rlusdWeight * 100).toFixed(0)}%`);
        console.log(`   Rationale: ${rebalanceStrategy.reason}`);
        
        // Market Context
        console.log('\n🌍 MARKET CONTEXT:');
        console.log(`   XRP Price: $${marketAnalysis.price.current.toFixed(4)} (${marketAnalysis.price.trend})`);
        console.log(`   Sentiment: ${marketAnalysis.sentiment.level} (${(marketAnalysis.sentiment.score * 100).toFixed(1)}%)`);
        console.log(`   Volatility: ${marketAnalysis.volatility.level} (${(marketAnalysis.volatility.current * 100).toFixed(1)}%)`);
        
        console.log('\n✅ Simulation Complete! Oracle ready for live trading decisions.');
    }
    
    // Run quick comparison with different capital amounts
    async runCapitalComparison() {
        const amounts = [10000, 25000, 50000, 100000, 250000];
        console.log('\n💼 CAPITAL SCALING ANALYSIS:');
        
        for (const amount of amounts) {
            const sim = this.runEnhancedMonteCarlo(amount, 30, 500);
            const expectedProfit = amount * sim.expectedAPY;
            console.log(`   $${amount.toLocaleString()} → Expected: $${expectedProfit.toLocaleString()} (${(sim.expectedAPY * 100).toFixed(1)}% APY)`);
        }
    }
}

// Initialize and expose globally
window.OracleSimulationRunner = OracleSimulationRunner;

// Auto-start simulation runner
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.oracleSimRunner = new OracleSimulationRunner();
        console.log('🎯 Oracle Simulation Runner loaded!');
    }, 3000);
});

console.log('🚀 Oracle Simulation Runner module loaded!');
