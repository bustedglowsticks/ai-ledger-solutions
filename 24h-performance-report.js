const fs = require('fs');
const path = require('path');

class PerformanceReport24h {
    constructor() {
        this.reportsDir = path.join(__dirname, '../reports');
        this.resultsDir = path.join(__dirname, 'results');
        this.report = {
            timestamp: new Date().toISOString(),
            period: '24h',
            summary: {},
            detailedAnalysis: {},
            recommendations: [],
            nextSteps: []
        };
    }

    async generateReport() {
        console.log('🔥 24-HOUR PERFORMANCE REPORT - BEAST MODE ANALYSIS! 🔥');
        console.log('📊 Generating comprehensive performance analysis...\n');

        try {
            await this.analyzePerformanceData();
            await this.generateDetailedAnalysis();
            await this.createRecommendations();
            await this.saveReport();
            this.displayReport();
            
            console.log('✅ 24-HOUR PERFORMANCE REPORT COMPLETE!');
            
        } catch (error) {
            console.error('❌ Report generation error:', error.message);
        }
    }

    async analyzePerformanceData() {
        console.log('📈 Analyzing performance data...');
        
        // Analyze monthly reports
        const monthlyDir = path.join(this.reportsDir, 'monthly');
        const files = fs.readdirSync(monthlyDir)
            .filter(file => file.endsWith('.json'))
            .sort()
            .slice(-30); // Last 30 reports

        let totalProfit = 0;
        let totalFees = 0;
        let totalSpread = 0;
        let totalImpermanentLoss = 0;
        let profitableDays = 0;
        let totalDays = 0;
        let dailyProfits = [];

        for (const file of files) {
            try {
                const data = JSON.parse(fs.readFileSync(path.join(monthlyDir, file), 'utf8'));
                
                if (data.profitLossHistory && data.profitLossHistory.length > 0) {
                    const latest = data.profitLossHistory[data.profitLossHistory.length - 1];
                    if (latest.profitLoss) {
                        const dailyProfit = parseFloat(latest.profitLoss.total) || 0;
                        totalProfit += dailyProfit;
                        totalFees += parseFloat(latest.profitLoss.fees) || 0;
                        totalSpread += parseFloat(latest.profitLoss.spread) || 0;
                        totalImpermanentLoss += parseFloat(latest.profitLoss.impermanentLoss) || 0;
                        
                        dailyProfits.push(dailyProfit);
                        
                        if (dailyProfit > 0) {
                            profitableDays++;
                        }
                        totalDays++;
                    }
                }
            } catch (error) {
                // Skip corrupted files
            }
        }

        // Calculate additional metrics
        const avgDailyProfit = totalDays > 0 ? totalProfit / totalDays : 0;
        const winRate = totalDays > 0 ? (profitableDays / totalDays) * 100 : 0;
        const maxDailyProfit = Math.max(...dailyProfits);
        const minDailyProfit = Math.min(...dailyProfits);
        const profitVolatility = this.calculateVolatility(dailyProfits);

        this.report.summary = {
            totalProfit: totalProfit.toFixed(6),
            totalFees: totalFees.toFixed(6),
            totalSpread: totalSpread.toFixed(6),
            totalImpermanentLoss: totalImpermanentLoss.toFixed(6),
            profitableDays,
            totalDays,
            winRate: winRate.toFixed(2),
            averageDailyProfit: avgDailyProfit.toFixed(6),
            maxDailyProfit: maxDailyProfit.toFixed(6),
            minDailyProfit: minDailyProfit.toFixed(6),
            profitVolatility: profitVolatility.toFixed(6),
            profitMargin: totalProfit > 0 ? ((totalProfit / (totalFees + totalSpread + totalImpermanentLoss)) * 100).toFixed(2) : '0.00'
        };

        console.log(`✅ Performance Analysis: ${totalDays} days analyzed`);
        console.log(`💰 Total Profit: ${totalProfit.toFixed(6)} XRP`);
        console.log(`🎯 Win Rate: ${winRate.toFixed(2)}%`);
        console.log(`📊 Average Daily: ${avgDailyProfit.toFixed(6)} XRP`);
    }

    calculateVolatility(values) {
        if (values.length === 0) return 0;
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
        const variance = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
        return Math.sqrt(variance);
    }

    async generateDetailedAnalysis() {
        console.log('🔍 Generating detailed analysis...');
        
        const summary = this.report.summary;
        const avgDailyProfit = parseFloat(summary.averageDailyProfit);
        const winRate = parseFloat(summary.winRate);
        const profitVolatility = parseFloat(summary.profitVolatility);

        this.report.detailedAnalysis = {
            profitability: {
                status: avgDailyProfit > 0 ? 'PROFITABLE' : 'UNPROFITABLE',
                strength: avgDailyProfit > 5 ? 'EXCELLENT' : avgDailyProfit > 2 ? 'GOOD' : avgDailyProfit > 0 ? 'MARGINAL' : 'POOR',
                trend: avgDailyProfit > 0 ? 'POSITIVE' : 'NEGATIVE',
                recommendation: avgDailyProfit > 0 ? 'SCALE_UP' : 'OPTIMIZE_FIRST'
            },
            riskManagement: {
                winRate: winRate > 80 ? 'EXCELLENT' : winRate > 70 ? 'GOOD' : winRate > 60 ? 'FAIR' : 'POOR',
                volatility: profitVolatility < 1 ? 'LOW' : profitVolatility < 3 ? 'MEDIUM' : 'HIGH',
                riskLevel: winRate > 70 && profitVolatility < 2 ? 'LOW' : winRate > 60 && profitVolatility < 3 ? 'MEDIUM' : 'HIGH',
                recommendation: winRate > 70 ? 'MAINTAIN' : 'IMPROVE_ACCURACY'
            },
            efficiency: {
                profitMargin: parseFloat(summary.profitMargin) > 50 ? 'EXCELLENT' : parseFloat(summary.profitMargin) > 30 ? 'GOOD' : 'POOR',
                feeEfficiency: parseFloat(summary.totalFees) < parseFloat(summary.totalProfit) * 0.3 ? 'EFFICIENT' : 'INEFFICIENT',
                recommendation: parseFloat(summary.profitMargin) > 30 ? 'OPTIMIZE_FEES' : 'REVIEW_STRATEGY'
            },
            scalability: {
                currentCapacity: avgDailyProfit > 5 ? 'HIGH' : avgDailyProfit > 2 ? 'MEDIUM' : 'LOW',
                scalingPotential: winRate > 70 && avgDailyProfit > 0 ? 'EXCELLENT' : winRate > 60 && avgDailyProfit > 0 ? 'GOOD' : 'LIMITED',
                recommendation: winRate > 70 && avgDailyProfit > 0 ? 'READY_TO_SCALE' : 'OPTIMIZE_FIRST'
            }
        };

        console.log('✅ Detailed analysis complete!');
    }

    async createRecommendations() {
        console.log('🎯 Creating recommendations...');
        
        const analysis = this.report.detailedAnalysis;
        const summary = this.report.summary;

        // Critical recommendations
        if (analysis.profitability.status === 'UNPROFITABLE') {
            this.report.recommendations.push({
                priority: 'CRITICAL',
                category: 'PROFITABILITY',
                title: 'Address Negative Returns',
                description: `Bot is currently unprofitable with ${summary.averageDailyProfit} XRP daily average.`,
                action: 'Immediate strategy review and parameter adjustment required.',
                impact: 'HIGH'
            });
        }

        if (analysis.riskManagement.winRate === 'POOR') {
            this.report.recommendations.push({
                priority: 'HIGH',
                category: 'RISK_MANAGEMENT',
                title: 'Improve Win Rate',
                description: `Current win rate of ${summary.winRate}% is below acceptable threshold.`,
                action: 'Adjust entry/exit criteria and risk parameters.',
                impact: 'HIGH'
            });
        }

        if (analysis.efficiency.profitMargin === 'POOR') {
            this.report.recommendations.push({
                priority: 'HIGH',
                category: 'EFFICIENCY',
                title: 'Optimize Fee Structure',
                description: `Profit margin of ${summary.profitMargin}% indicates high fee burden.`,
                action: 'Review and optimize transaction costs and strategy efficiency.',
                impact: 'MEDIUM'
            });
        }

        // Optimization recommendations
        if (analysis.scalability.scalingPotential === 'EXCELLENT') {
            this.report.recommendations.push({
                priority: 'MEDIUM',
                category: 'SCALABILITY',
                title: 'Scale Up Operations',
                description: 'Bot performance indicates readiness for capital scaling.',
                action: 'Increase position sizes and expand to additional markets.',
                impact: 'HIGH'
            });
        }

        // Next steps
        this.report.nextSteps = [
            {
                step: 1,
                action: 'Implement Critical Recommendations',
                timeline: 'IMMEDIATE',
                priority: 'CRITICAL'
            },
            {
                step: 2,
                action: 'Apply Performance Optimizations',
                timeline: '24_HOURS',
                priority: 'HIGH'
            },
            {
                step: 3,
                action: 'Monitor and Validate Improvements',
                timeline: '1_WEEK',
                priority: 'MEDIUM'
            },
            {
                step: 4,
                action: 'Scale Operations if Performance Improves',
                timeline: '2_WEEKS',
                priority: 'MEDIUM'
            }
        ];

        console.log(`✅ Created ${this.report.recommendations.length} recommendations`);
    }

    async saveReport() {
        const filename = `24h-performance-report-${Date.now()}.json`;
        const filepath = path.join(this.resultsDir, filename);
        
        fs.writeFileSync(filepath, JSON.stringify(this.report, null, 2));
        console.log(`💾 Report saved to: ${filename}`);
        
        return filepath;
    }

    displayReport() {
        console.log('\n🔥 24-HOUR PERFORMANCE REPORT 🔥');
        console.log('=' .repeat(60));
        
        const summary = this.report.summary;
        const analysis = this.report.detailedAnalysis;
        
        console.log('📊 PERFORMANCE SUMMARY:');
        console.log(`   💰 Total Profit: ${summary.totalProfit} XRP`);
        console.log(`   📈 Daily Average: ${summary.averageDailyProfit} XRP`);
        console.log(`   🎯 Win Rate: ${summary.winRate}%`);
        console.log(`   📊 Profit Margin: ${summary.profitMargin}%`);
        console.log(`   📈 Max Daily: ${summary.maxDailyProfit} XRP`);
        console.log(`   📉 Min Daily: ${summary.minDailyProfit} XRP`);
        
        console.log('\n🔍 DETAILED ANALYSIS:');
        console.log(`   💰 Profitability: ${analysis.profitability.status} (${analysis.profitability.strength})`);
        console.log(`   🛡️ Risk Management: ${analysis.riskManagement.winRate} Win Rate, ${analysis.riskManagement.volatility} Volatility`);
        console.log(`   ⚡ Efficiency: ${analysis.efficiency.profitMargin} Margin, ${analysis.efficiency.feeEfficiency} Fees`);
        console.log(`   📈 Scalability: ${analysis.scalability.currentCapacity} Capacity, ${analysis.scalability.scalingPotential} Potential`);
        
        console.log('\n🎯 CRITICAL RECOMMENDATIONS:');
        this.report.recommendations
            .filter(rec => rec.priority === 'CRITICAL')
            .forEach(rec => {
                console.log(`   🚨 ${rec.title}: ${rec.description}`);
                console.log(`      Action: ${rec.action}`);
            });
        
        console.log('\n⚡ HIGH PRIORITY OPTIMIZATIONS:');
        this.report.recommendations
            .filter(rec => rec.priority === 'HIGH')
            .forEach(rec => {
                console.log(`   ⚡ ${rec.title}: ${rec.description}`);
                console.log(`      Action: ${rec.action}`);
            });
        
        console.log('\n📋 NEXT STEPS:');
        this.report.nextSteps.forEach(step => {
            console.log(`   ${step.step}. ${step.action} (${step.timeline})`);
        });
        
        console.log('\n' + '='.repeat(60));
        
        // Final recommendation
        if (analysis.profitability.status === 'PROFITABLE' && analysis.scalability.scalingPotential === 'EXCELLENT') {
            console.log('🔥 BEAST MODE READY FOR SCALING! 🔥');
            console.log('🚀 RECOMMENDATION: PROCEED WITH MAINNET DEPLOYMENT');
        } else if (analysis.profitability.status === 'PROFITABLE') {
            console.log('⚡ BEAST MODE NEEDS OPTIMIZATION! ⚡');
            console.log('🎯 RECOMMENDATION: OPTIMIZE BEFORE SCALING');
        } else {
            console.log('🛑 BEAST MODE REQUIRES IMMEDIATE ATTENTION! 🛑');
            console.log('🚨 RECOMMENDATION: FIX PROFITABILITY ISSUES FIRST');
        }
        
        console.log('=' .repeat(60));
    }
}

// Run the report generator
async function generate24hReport() {
    const reporter = new PerformanceReport24h();
    await reporter.generateReport();
    
    return reporter.report;
}

// Export for use in other modules
module.exports = { PerformanceReport24h, generate24hReport };

// Run if called directly
if (require.main === module) {
    generate24hReport().catch(console.error);
} 