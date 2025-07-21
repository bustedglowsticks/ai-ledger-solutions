/**
 * AMM Math Utilities
 * 
 * Mathematical functions for Automated Market Maker calculations
 * Includes constant product formula, price impact, slippage, and other AMM-related math
 */

const logger = require('./logger');

/**
 * AMM Math utility class for XRPL AMM operations
 */
class AmmMath {
  /**
   * Calculate constant product k = x * y
   * @param {number} x - Amount of token X
   * @param {number} y - Amount of token Y
   * @returns {number} Constant product k
   */
  calculateConstantProduct(x, y) {
    return x * y;
  }

  /**
   * Calculate output amount based on constant product formula
   * @param {number} xIn - Input amount of token X
   * @param {number} xReserve - Reserve of token X
   * @param {number} yReserve - Reserve of token Y
   * @returns {number} Output amount of token Y
   */
  getAmountOut(xIn, xReserve, yReserve) {
    if (xIn <= 0 || xReserve <= 0 || yReserve <= 0) {
      return 0;
    }

    const k = this.calculateConstantProduct(xReserve, yReserve);
    const xReserveAfter = xReserve + xIn;
    const yReserveAfter = k / xReserveAfter;
    
    return yReserve - yReserveAfter;
  }

  /**
   * Calculate input amount needed for desired output
   * @param {number} yOut - Desired output amount of token Y
   * @param {number} xReserve - Reserve of token X
   * @param {number} yReserve - Reserve of token Y
   * @returns {number} Required input amount of token X
   */
  getAmountIn(yOut, xReserve, yReserve) {
    if (yOut <= 0 || xReserve <= 0 || yReserve <= 0 || yOut >= yReserve) {
      return 0;
    }

    const k = this.calculateConstantProduct(xReserve, yReserve);
    const yReserveAfter = yReserve - yOut;
    const xReserveAfter = k / yReserveAfter;
    
    return xReserveAfter - xReserve;
  }

  /**
   * Calculate price impact percentage
   * @param {number} amountIn - Input amount
   * @param {number} reserveIn - Input token reserve
   * @param {number} reserveOut - Output token reserve
   * @returns {number} Price impact as percentage (0-100)
   */
  calculatePriceImpact(amountIn, reserveIn, reserveOut) {
    if (amountIn <= 0 || reserveIn <= 0 || reserveOut <= 0) {
      return 0;
    }

    const initialPrice = reserveOut / reserveIn;
    const amountOut = this.getAmountOut(amountIn, reserveIn, reserveOut);
    const newReserveIn = reserveIn + amountIn;
    const newReserveOut = reserveOut - amountOut;
    const newPrice = newReserveOut / newReserveIn;
    
    return Math.abs((newPrice - initialPrice) / initialPrice) * 100;
  }

  /**
   * Calculate optimal deposit amounts to maintain pool ratio
   * @param {number} amountA - Available amount of token A
   * @param {number} amountB - Available amount of token B
   * @param {number} reserveA - Current reserve of token A
   * @param {number} reserveB - Current reserve of token B
   * @returns {Object} Optimal amounts to deposit
   */
  calculateOptimalDeposit(amountA, amountB, reserveA, reserveB) {
    if (amountA <= 0 || amountB <= 0 || reserveA <= 0 || reserveB <= 0) {
      return { amountA: 0, amountB: 0 };
    }

    const ratio = reserveA / reserveB;
    
    // If amountA/amountB > reserveA/reserveB, amountB is the limiting factor
    if (amountA / amountB > ratio) {
      return {
        amountA: amountB * ratio,
        amountB: amountB
      };
    } else {
      // Otherwise, amountA is the limiting factor
      return {
        amountA: amountA,
        amountB: amountA / ratio
      };
    }
  }

  /**
   * Calculate LP token amount for a deposit
   * @param {number} amountA - Amount of token A to deposit
   * @param {number} amountB - Amount of token B to deposit
   * @param {number} reserveA - Current reserve of token A
   * @param {number} reserveB - Current reserve of token B
   * @param {number} totalLpTokens - Total supply of LP tokens
   * @returns {number} LP tokens to mint
   */
  calculateLpTokens(amountA, amountB, reserveA, reserveB, totalLpTokens) {
    if (
      amountA <= 0 || 
      amountB <= 0 || 
      reserveA <= 0 || 
      reserveB <= 0
    ) {
      return 0;
    }
    
    // If this is the first deposit (no LP tokens exist yet)
    if (totalLpTokens === 0) {
      return Math.sqrt(amountA * amountB);
    }
    
    // Calculate based on the smaller ratio to ensure proportional deposit
    const ratioA = amountA / reserveA;
    const ratioB = amountB / reserveB;
    const ratio = Math.min(ratioA, ratioB);
    
    return totalLpTokens * ratio;
  }

  /**
   * Calculate impermanent loss for a given price change
   * @param {number} priceRatio - New price / old price
   * @returns {number} Impermanent loss as percentage (0-100)
   */
  calculateImpermanentLoss(priceRatio) {
    if (priceRatio <= 0) {
      return 0;
    }
    
    // IL = 2 * sqrt(priceRatio) / (1 + priceRatio) - 1
    const sqrtPriceRatio = Math.sqrt(priceRatio);
    const il = 2 * sqrtPriceRatio / (1 + priceRatio) - 1;
    
    // Convert to percentage and return absolute value
    return Math.abs(il * 100);
  }

  /**
   * Calculate APY based on fee income and pool value
   * @param {number} dailyVolume - Daily trading volume in the pool
   * @param {number} feePercent - Fee percentage (e.g., 0.3 for 0.3%)
   * @param {number} poolValue - Total value of the pool
   * @returns {number} Estimated APY percentage
   */
  calculateApy(dailyVolume, feePercent, poolValue) {
    if (dailyVolume <= 0 || feePercent <= 0 || poolValue <= 0) {
      return 0;
    }
    
    // Daily fee income
    const dailyFeeIncome = dailyVolume * (feePercent / 100);
    
    // Annual fee income
    const annualFeeIncome = dailyFeeIncome * 365;
    
    // APY
    return (annualFeeIncome / poolValue) * 100;
  }
  
  /**
   * Optimize liquidity distribution across multiple pools
   * @param {Array<Object>} pools - Available liquidity pools
   * @param {number} totalLiquidity - Total liquidity to distribute
   * @returns {Object} Optimized distribution and expected APY
   */
  optimizeLiquidityDistribution(pools, totalLiquidity) {
    try {
      if (!pools || !Array.isArray(pools) || pools.length === 0 || totalLiquidity <= 0) {
        logger.warn('AmmMath: Invalid inputs for optimizeLiquidityDistribution');
        return {
          distribution: {},
          expectedAPY: 0
        };
      }
      
      // Sort pools by APY (descending)
      const sortedPools = [...pools].sort((a, b) => (b.apy || 0) - (a.apy || 0));
      
      // Calculate risk-adjusted APY for each pool
      const poolsWithRiskAdjustedAPY = sortedPools.map(pool => ({
        ...pool,
        riskAdjustedAPY: (pool.apy || 0) * (1 - (pool.volatility || 0.5))
      }));
      
      // Sort by risk-adjusted APY (descending)
      poolsWithRiskAdjustedAPY.sort((a, b) => b.riskAdjustedAPY - a.riskAdjustedAPY);
      
      // Allocate liquidity based on risk-adjusted APY
      const totalRiskAdjustedAPY = poolsWithRiskAdjustedAPY.reduce(
        (sum, pool) => sum + pool.riskAdjustedAPY, 0
      );
      
      const distribution = {};
      let expectedAPY = 0;
      let remainingLiquidity = totalLiquidity;
      
      // If no valid APY data, distribute equally
      if (totalRiskAdjustedAPY <= 0) {
        const equalShare = totalLiquidity / pools.length;
        
        pools.forEach(pool => {
          const poolId = pool.id || 'unknown';
          distribution[poolId] = {
            amount: equalShare,
            percentage: (equalShare / totalLiquidity) * 100
          };
          expectedAPY += (pool.apy || 0) / pools.length;
        });
        
        return { distribution, expectedAPY };
      }
      
      // Distribute based on risk-adjusted APY weight
      poolsWithRiskAdjustedAPY.forEach(pool => {
        const poolId = pool.id || 'unknown';
        const weight = pool.riskAdjustedAPY / totalRiskAdjustedAPY;
        const amount = totalLiquidity * weight;
        
        distribution[poolId] = {
          amount,
          percentage: weight * 100
        };
        
        expectedAPY += (pool.apy || 0) * weight;
        remainingLiquidity -= amount;
      });
      
      // Handle any remaining liquidity due to rounding errors
      if (remainingLiquidity > 0 && poolsWithRiskAdjustedAPY.length > 0) {
        const topPool = poolsWithRiskAdjustedAPY[0];
        const poolId = topPool.id || 'unknown';
        
        distribution[poolId].amount += remainingLiquidity;
        distribution[poolId].percentage = 
          (distribution[poolId].amount / totalLiquidity) * 100;
      }
      
      return { distribution, expectedAPY };
    } catch (error) {
      logger.error(`AmmMath: Error optimizing liquidity distribution: ${error.message}`);
      
      // Return default distribution
      return {
        distribution: {
          'XRP/USD': {
            amount: totalLiquidity,
            percentage: 100
          }
        },
        expectedAPY: 20
      };
    }
  }
}

// Export a singleton instance
module.exports = new AmmMath();
