# XRPL Liquidity Provider Bot - Testing Framework

## Overview

A robust testing framework is essential for ensuring the reliability, security, and performance of the XRPL Liquidity Provider Bot. This document outlines a comprehensive testing strategy covering unit tests, integration tests, and end-to-end (E2E) tests. The goal is to achieve at least 80% code coverage, catch edge cases like network failures or impermanent loss spikes, and integrate seamlessly with CI/CD pipelines.

Testing focuses on:

- **Correctness**: Verify logic in strategies, risk calculations, and XRPL interactions.
- **Resilience**: Simulate failures (e.g., WebSocket disconnects, invalid configs).
- **Performance**: Benchmark critical paths like order placement or rebalancing.

## Technology Stack for Testing

- **Framework**: Jest (with TypeScript support via ts-jest for your JS/TS codebase).
- **Mocking**: Sinon or Jest mocks for XRPL Client and external dependencies; xrpl-mocks library for realistic XRPL simulations.
- **Coverage**: Jest's built-in coverage reporter.
- **Utilities**: Supertest for API/dashboard testing (if applicable); Sinon-Chai for enhanced assertions.
- **Environment**: Node.js test environment with .env.test for mock configs.

## Setup Instructions

1. Install dependencies:
```bash
npm install --save-dev jest ts-jest @types/jest sinon xrpl-mocks supertest
```

2. Add to package.json:
```json
{
  "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --watch"
  },
  "jest": {
    "preset": "ts-jest",
    "testEnvironment": "node",
    "coverageThreshold": {
      "global": {
        "branches": 80,
        "functions": 80,
        "lines": 80,
        "statements": 80
      }
    }
  }
}
```

3. Create a `.env.test` file with mock values (e.g., testnet seeds, no real XRPL connections).
4. Run tests: `npm test`.

## Testing Strategies

### 1. Unit Tests

**Focus**: Isolate individual functions or classes (e.g., impermanent loss calculator in Risk Manager).

**Best Practices**:
- Use Arrange-Act-Assert pattern.
- Mock dependencies (e.g., XRPL Client responses).
- Cover happy paths, edge cases (e.g., zero balances), and errors (e.g., invalid inputs).

**Example**: Test for Impermanent Loss Calculator in risk-manager.js.

```javascript
// src/risk-manager.test.js
import { calculateImpermanentLoss } from './risk-manager'; // Assume this function exists

describe('Risk Manager - Impermanent Loss Calculator', () => {
  it('calculates zero loss when ratios are equal', () => {
    const initialRatio = 1;
    const currentRatio = 1;
    expect(calculateImpermanentLoss(initialRatio, currentRatio)).toBe(0);
  });

  it('calculates positive loss on price drift', () => {
    const initialRatio = 1;
    const currentRatio = 2;
    const expectedLoss = 2 * Math.sqrt(2) / (1 + Math.sqrt(2)) - 1; // ~ -0.057 (5.7% loss)
    expect(calculateImpermanentLoss(initialRatio, currentRatio)).toBeCloseTo(expectedLoss, 3);
  });

  it('throws error on invalid ratios', () => {
    expect(() => calculateImpermanentLoss(0, -1)).toThrow('Invalid ratio values');
  });
});
```

### 2. Integration Tests

**Focus**: Test interactions between modules (e.g., Strategies proposing actions validated by Risk Manager).

**Best Practices**:
- Use in-memory databases (e.g., SQLite :memory:) for Data Storage.
- Mock XRPL Client with xrpl-mocks to simulate ledger events without real connections.
- Test async flows like event handling.

**Example**: Integration test for Strategies and Risk Manager flow.

```javascript
// src/strategies.integration.test.js
import { evaluateAMMStrategy } from './strategies';
import { validateAction } from './risk-manager';
import xrplMocks from 'xrpl-mocks'; // Mock XRPL responses

describe('Strategies + Risk Manager Integration', () => {
  let mockPoolData;

  beforeEach(() => {
    mockPoolData = { volume24h: 1000, fee: 0.003, asset1: 'XRP', asset2: 'USD' };
    xrplMocks.setup(); // Initialize mocks
  });

  afterEach(() => xrplMocks.teardown());

  it('proposes and validates a valid rebalancing action', async () => {
    const proposedAction = await evaluateAMMStrategy(mockPoolData);
    expect(proposedAction.type).toBe('rebalance');

    const validation = validateAction(proposedAction, { maxExposure: 1000 });
    expect(validation.approved).toBe(true);
  });

  it('rejects action exceeding risk limits', async () => {
    const highRiskPool = { ...mockPoolData, volume24h: 100 }; // Low volume = higher risk
    const proposedAction = await evaluateAMMStrategy(highRiskPool);

    const validation = validateAction(proposedAction, { maxExposure: 50 });
    expect(validation.approved).toBe(false);
    expect(validation.reason).toContain('exceeds exposure limit');
  });
});
```

### 3. End-to-End (E2E) Tests

**Focus**: Simulate full bot operation (e.g., from market monitoring to transaction submission).

**Best Practices**:
- Run against a testnet XRPL node or fully mocked environment.
- Use tools like Cypress for dashboard/UI if implemented.
- Limit to key scenarios; run less frequently due to longer execution time.

**Example**: E2E test for full liquidity provision cycle.

```javascript
// e2e/bot-cycle.test.js
import { startBot } from '../index'; // Main bot entry
import xrplMocks from 'xrpl-mocks';

describe('E2E: Full Bot Cycle', () => {
  it('initializes, monitors, and executes a strategy without errors', async () => {
    xrplMocks.mockLedgerClose(); // Simulate events
    const botInstance = await startBot({ testMode: true });

    // Simulate market data feed
    xrplMocks.emitMarketData({ price: 0.5, volume: 500 });

    // Wait for cycle
    await new Promise(resolve => setTimeout(resolve, 1000));

    expect(botInstance.getState().positions.length).toBeGreaterThan(0); // Position managed
    expect(botInstance.getLogs()).not.toContain('error');

    botInstance.stop();
  });
});
```

## Coverage and Reporting

- Aim for 80%+ coverage: Use `npm test -- --coverage` and review reports in `/coverage`.
- Ignore non-testable files (e.g., configs) via `.jestignore`.

## CI/CD Integration Hooks

Integrate with GitHub Actions (or similar) for automated testing:

```yaml
# .github/workflows/test.yml
name: Run Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install Node.js
        uses: actions/setup-node@v3
        with: { node-version: 18 }
      - run: npm ci
      - run: npm test
```

## XRPL-Specific Testing Strategies

### Testing AMM Interactions

When testing AMM interactions, focus on:

1. **LP Token Management**: Test deposit/withdrawal calculations and token tracking
2. **Fee Optimization**: Verify voting logic and fee calculation
3. **Rebalancing**: Test threshold detection and optimal rebalancing ratios

Example test for AMM deposit calculation:

```javascript
// src/strategies/amm.test.js
import { calculateOptimalDeposit } from './amm-strategy';

describe('AMM Strategy - Deposit Calculation', () => {
  it('calculates balanced deposit amounts', () => {
    const poolState = {
      asset1: { currency: 'XRP', value: '1000' },
      asset2: { currency: 'USD', issuer: 'rXYZ...', value: '2000' },
      lpTokens: '1414.21' // sqrt(1000*2000)
    };
    
    const availableFunds = {
      XRP: '100',
      'USD.rXYZ...': '300'
    };
    
    const result = calculateOptimalDeposit(poolState, availableFunds);
    
    // Should deposit in pool ratio (1:2)
    expect(result.asset1Amount).toBe('100');
    expect(result.asset2Amount).toBe('200');
    expect(result.expectedLPTokens).toBeCloseTo(141.42, 1);
  });
});
```

### Testing CLOB Strategies

For CLOB testing, focus on:

1. **Order Book Analysis**: Test spread calculation and depth analysis
2. **Order Placement Logic**: Verify optimal price and amount calculations
3. **Order Lifecycle**: Test creation, partial fills, and cancellations

Example test for spread strategy:

```javascript
// src/strategies/clob.test.js
import { calculateOptimalSpread } from './clob-strategy';

describe('CLOB Strategy - Spread Calculation', () => {
  it('calculates optimal spread based on market volatility', () => {
    const marketData = {
      bestBid: '0.98',
      bestAsk: '1.02',
      volatility24h: 0.05, // 5% daily volatility
      volume24h: '500000'
    };
    
    const riskParams = {
      minSpreadPercent: 0.002,
      volatilityMultiplier: 0.5
    };
    
    const result = calculateOptimalSpread(marketData, riskParams);
    
    // Base spread (0.002) + volatility adjustment (0.05 * 0.5)
    expect(result.optimalSpreadPercent).toBeCloseTo(0.027, 3);
    expect(result.buyPrice).toBeLessThan(marketData.bestBid);
    expect(result.sellPrice).toBeGreaterThan(marketData.bestAsk);
  });
});
```

### Testing Network Resilience

Test the bot's ability to handle network issues:

```javascript
// src/xrpl/client.test.js
import { XRPLClient } from './client';
import WebSocket from 'ws';

// Mock WebSocket
jest.mock('ws');

describe('XRPL Client - Network Resilience', () => {
  let client;
  
  beforeEach(() => {
    client = new XRPLClient({ url: 'wss://test.net' });
    WebSocket.mockClear();
  });
  
  it('reconnects after connection failure', async () => {
    // Setup mock to emit close event
    const mockWs = {
      on: jest.fn((event, callback) => {
        if (event === 'close') setTimeout(callback, 10);
      }),
      send: jest.fn(),
      close: jest.fn()
    };
    WebSocket.mockImplementation(() => mockWs);
    
    await client.connect();
    
    // Wait for reconnection attempt
    await new Promise(resolve => setTimeout(resolve, 50));
    
    // Should try to create a new WebSocket
    expect(WebSocket).toHaveBeenCalledTimes(2);
  });
  
  it('handles request timeouts gracefully', async () => {
    const mockWs = {
      on: jest.fn(),
      send: jest.fn(),
      close: jest.fn()
    };
    WebSocket.mockImplementation(() => mockWs);
    
    await client.connect();
    
    // Mock a request that never gets a response
    const requestPromise = client.request({ command: 'account_info' }, 100);
    
    await expect(requestPromise).rejects.toThrow('Request timeout');
  });
});
```

## Best Practices and Roadmap

- **Mock Everything External**: Never hit real XRPL in tests—use mocks to keep them fast and deterministic.
- **Test-Driven Development (TDD)**: Write tests before implementing new strategies.
- **Performance Testing**: Add load tests with Artillery for high-volume scenarios.

### Roadmap Extensions:

1. **Phase 1**: Cover Core Logic and Strategies (target 100% unit coverage).
2. **Phase 2**: Add security tests (e.g., key leakage prevention).
3. **Phase 3**: Integrate fuzz testing for risk calculations.

## Test Organization

Organize tests to mirror the project structure:

```
src/
  ├── index.js
  ├── xrpl/
  │   ├── client.js
  │   └── __tests__/
  │       ├── client.test.js
  │       └── client.integration.test.js
  ├── strategies/
  │   ├── amm-strategy.js
  │   ├── clob-strategy.js
  │   └── __tests__/
  │       ├── amm-strategy.test.js
  │       └── clob-strategy.test.js
  └── ...
e2e/
  ├── setup.js
  ├── bot-cycle.test.js
  └── ...
```

This framework will make your bot rock-solid—reducing downtime and boosting trust in its profitability.
