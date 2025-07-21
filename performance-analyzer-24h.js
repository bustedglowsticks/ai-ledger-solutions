const fs = require('fs');
const path = require('path');

class PerformanceAnalyzer24h {
    constructor() {
        this.reportsDir = path.join(__dirname, '../reports');
        this.resultsDir = path.join(__dirname, 'results');
        this.analysis = {
            timestamp: new Date().toISOString(),
            period: '24h',
            metrics: {},
            recommendations: [],
            optimizations: {}
        };
    }

    async analyzeLast24Hours() {
        console.log('🔥 PERFORMANCE ANALYZER 24H - BEAST MODE OPTIMIZATION! 🔥');
        console.log('📊 Analyzing last 24 hours of bot performance...\n');

        try {
            // Analyze monthly reports for recent data
            await this.analyzeMonthlyReports();
            
            // Analyze fusion strategy results
            await this.analyzeFusionStrategy();
            
            // Generate optimization recommendations
            this.generateOptimizations();
            
            // Create performance summary
            this.createPerformanceSummary();
            
            // Save analysis
            await this.saveAnalysis();
            
            console.log('✅ 24-HOUR PERFORMANCE ANALYSIS COMPLETE!');
            console.log('🎯 OPTIMIZATION RECOMMENDATIONS GENERATED!');
            
        } catch (error) {
            console.error('❌ Analysis error:', error.message);
        }
    }

    async analyzeMonthlyReports() {
        console.log('📈 Analyzing monthly performance reports...');
        
        const monthlyDir = path.join(this.reportsDir, 'monthly');
        const files = fs.readdirSync(monthlyDir)
            .filter(file => file.endsWith('.json'))
            .sort()
            .slice(-30); // Last 30 reports (approximately 24 hours)

        let totalProfit = 0;
        let totalFees = 0;
        let totalSpread = 0;
        let totalImpermanentLoss = 0;
        let profitableDays = 0;
        let totalDays = 0;

        for (const file of files) {
            try {
                const data = JSON.parse(fs.readFileSync(path.join(monthlyDir, file), 'utf8'));
                
                if (data.profitLossHistory && data.profitLossHistory.length > 0) {
                    const latest = data.profitLossHistory[data.profitLossHistory.length - 1];
                    if (latest.profitLoss) {
                        totalProfit += parseFloat(latest.profitLoss.total) || 0;
                        totalFees += parseFloat(latest.profitLoss.fees) || 0;
                        totalSpread += parseFloat(latest.profitLoss.spread) || 0;
                        totalImpermanentLoss += parseFloat(latest.profitLoss.impermanentLoss) || 0;
                        
                        if (parseFloat(latest.profitLoss.total) > 0) {
                            profitableDays++;
                        }
                        totalDays++;
                    }
                }
            } catch (error) {
                console.log(`⚠️ Skipping corrupted report: ${file}`);
            }
        }

        this.analysis.metrics.monthly = {
            totalProfit: totalProfit.toFixed(6),
            totalFees: totalFees.toFixed(6),
            totalSpread: totalSpread.toFixed(6),
            totalImpermanentLoss: totalImpermanentLoss.toFixed(6),
            profitableDays,
            totalDays,
            winRate: totalDays > 0 ? ((profitableDays / totalDays) * 100).toFixed(2) : '0.00',
            averageDailyProfit: totalDays > 0 ? (totalProfit / totalDays).toFixed(6) : '0.000000'
        };

        console.log(`✅ Monthly Analysis: ${totalDays} days analyzed`);
        console.log(`💰 Total Profit: ${totalProfit.toFixed(6)} XRP`);
        console.log(`🎯 Win Rate: ${this.analysis.metrics.monthly.winRate}%`);
    }

    async analyzeFusionStrategy() {
        console.log('⚛️ Analyzing fusion strategy performance...');
        
        const fusionFile = path.join(this.resultsDir, 'fusion-strategy-simulation-1752720045140.json');
        
        if (fs.existsSync(fusionFile)) {
            try {
                const data = JSON.parse(fs.readFileSync(fusionFile, 'utf8'));
                
                this.analysis.metrics.fusion = {
                    meanYield: data.baseResults?.meanYield || 0,
                    stdDev: data.baseResults?.stdDev || 0,
                    sharpeRatio: data.baseResults?.sharpeRatio || 0,
                    minYield: data.baseResults?.minYield || 0,
                    maxYield: data.baseResults?.maxYield || 0,
                    simulationParams: data.simulationParams || {}
                };

                console.log(`✅ Fusion Strategy: Mean Yield ${(data.baseResults?.meanYield * 100).toFixed(2)}%`);
                console.log(`📊 Sharpe Ratio: ${data.baseResults?.sharpeRatio.toFixed(2)}`);
            } catch (error) {
                console.log('⚠️ Could not analyze fusion strategy data');
            }
        }
    }

    generateOptimizations() {
        console.log('🎯 Generating optimization recommendations...');
        
        const monthly = this.analysis.metrics.monthly;
        const fusion = this.analysis.metrics.fusion;
        
        // Analyze performance patterns
        const winRate = parseFloat(monthly.winRate);
        const avgDailyProfit = parseFloat(monthly.averageDailyProfit);
        const sharpeRatio = fusion.sharpeRatio;
        
        // Generate recommendations based on performance
        if (winRate < 60) {
            this.analysis.recommendations.push({
                priority: 'HIGH',
                category: 'RISK_MANAGEMENT',
                title: 'Improve Win Rate',
                description: `Current win rate is ${winRate}%. Need to improve strategy accuracy.`,
                action: 'Adjust risk parameters and entry/exit criteria'
            });
        }
        
        if (avgDailyProfit < 0) {
            this.analysis.recommendations.push({
                priority: 'CRITICAL',
                category: 'PROFITABILITY',
                title: 'Address Negative Daily Returns',
                description: `Average daily profit is ${avgDailyProfit} XRP. Immediate action required.`,
                action: 'Review strategy logic and market conditions'
            });
        }
        
        if (sharpeRatio < 1.0) {
            this.analysis.recommendations.push({
                priority: 'HIGH',
                category: 'RISK_ADJUSTED_RETURNS',
                title: 'Improve Risk-Adjusted Returns',
                description: `Sharpe ratio is ${sharpeRatio.toFixed(2)}. Need better risk management.`,
                action: 'Optimize position sizing and volatility management'
            });
        }
        
        // Generate beast mode optimizations
        this.analysis.optimizations = {
            aiOracle: {
                confidenceThreshold: winRate > 70 ? 0.95 : 0.98,
                surgeDetectionSensitivity: avgDailyProfit > 0 ? 'HIGH' : 'MEDIUM',
                recommendation: 'Adjust AI confidence based on win rate performance'
            },
            quantumOptimizer: {
                optimizationFrequency: avgDailyProfit > 0 ? 'REAL_TIME' : 'HOURLY',
                performanceBoost: sharpeRatio > 1.5 ? 3.0 : 2.5,
                recommendation: 'Increase optimization frequency for better performance'
            },
            riskManager: {
                maxDrawdown: winRate > 80 ? 0.05 : 0.03,
                circuitBreakerThreshold: avgDailyProfit < 0 ? 0.02 : 0.05,
                recommendation: 'Tighten risk parameters for better capital preservation'
            },
            yieldOptimizer: {
                targetAPY: avgDailyProfit > 0 ? 350 : 280,
                rebalancingFrequency: 'DAILY',
                recommendation: 'Adjust target APY based on current performance'
            }
        };
        
        console.log(`✅ Generated ${this.analysis.recommendations.length} recommendations`);
        console.log(`⚡ Created ${Object.keys(this.analysis.optimizations).length} optimization profiles`);
    }

    createPerformanceSummary() {
        console.log('📋 Creating performance summary...');
        
        const monthly = this.analysis.metrics.monthly;
        const fusion = this.analysis.metrics.fusion;
        
        this.analysis.summary = {
            overallPerformance: parseFloat(monthly.averageDailyProfit) > 0 ? 'PROFITABLE' : 'UNPROFITABLE',
            riskLevel: parseFloat(monthly.winRate) > 70 ? 'LOW' : parseFloat(monthly.winRate) > 50 ? 'MEDIUM' : 'HIGH',
            recommendation: parseFloat(monthly.averageDailyProfit) > 0 ? 'SCALE_UP' : 'OPTIMIZE_FIRST',
            keyMetrics: {
                dailyProfit: monthly.averageDailyProfit,
                winRate: monthly.winRate,
                sharpeRatio: fusion.sharpeRatio.toFixed(2),
                totalProfit: monthly.totalProfit
            }
        };
        
        console.log(`📊 Performance Summary: ${this.analysis.summary.overallPerformance}`);
        console.log(`🛡️ Risk Level: ${this.analysis.summary.riskLevel}`);
        console.log(`🎯 Recommendation: ${this.analysis.summary.recommendation}`);
    }

    async saveAnalysis() {
        const filename = `performance-analysis-24h-${Date.now()}.json`;
        const filepath = path.join(this.resultsDir, filename);
        
        fs.writeFileSync(filepath, JSON.stringify(this.analysis, null, 2));
        console.log(`💾 Analysis saved to: ${filename}`);
        
        return filepath;
    }

    displayResults() {
        console.log('\n🔥 24-HOUR PERFORMANCE ANALYSIS RESULTS 🔥');
        console.log('=' .repeat(60));
        
        const monthly = this.analysis.metrics.monthly;
        const summary = this.analysis.summary;
        
        console.log(`📊 PERFORMANCE METRICS:`);
        console.log(`   💰 Total Profit: ${monthly.totalProfit} XRP`);
        console.log(`   📈 Daily Average: ${monthly.averageDailyProfit} XRP`);
        console.log(`   🎯 Win Rate: ${monthly.winRate}%`);
        console.log(`   📊 Sharpe Ratio: ${this.analysis.metrics.fusion.sharpeRatio.toFixed(2)}`);
        
        console.log(`\n🛡️ RISK ASSESSMENT:`);
        console.log(`   Overall Performance: ${summary.overallPerformance}`);
        console.log(`   Risk Level: ${summary.riskLevel}`);
        console.log(`   Recommendation: ${summary.recommendation}`);
        
        console.log(`\n⚡ BEAST MODE OPTIMIZATIONS:`);
        Object.entries(this.analysis.optimizations).forEach(([system, config]) => {
            console.log(`   ${system.toUpperCase()}: ${config.recommendation}`);
        });
        
        console.log(`\n🎯 CRITICAL RECOMMENDATIONS:`);
        this.analysis.recommendations
            .filter(rec => rec.priority === 'CRITICAL')
            .forEach(rec => {
                console.log(`   🚨 ${rec.title}: ${rec.description}`);
            });
        
        console.log(`\n📈 HIGH PRIORITY OPTIMIZATIONS:`);
        this.analysis.recommendations
            .filter(rec => rec.priority === 'HIGH')
            .forEach(rec => {
                console.log(`   ⚡ ${rec.title}: ${rec.description}`);
            });
        
        console.log('\n' + '='.repeat(60));
        console.log('🔥 BEAST MODE READY FOR OPTIMIZATION! 🔥');
    }
}

// Run the analyzer
async function runPerformanceAnalysis() {
    const analyzer = new PerformanceAnalyzer24h();
    await analyzer.analyzeLast24Hours();
    analyzer.displayResults();
    
    return analyzer.analysis;
}

// Export for use in other modules
module.exports = { PerformanceAnalyzer24h, runPerformanceAnalysis };

// Run if called directly
if (require.main === module) {
    runPerformanceAnalysis().catch(console.error);
} 