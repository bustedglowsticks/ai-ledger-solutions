# XRPL Liquidity Provider Bot - Configuration Enhancements

## Overview

Enhancing the configuration system adds validation for error-proof setups and hot-reloading for dynamic adjustments without restarts. This builds on the existing Configuration module in architecture.md, ensuring parameters like risk limits or strategy thresholds are always valid and updatable in real-time—critical for mainnet where market conditions change rapidly.

### Goals:

- **Validation**: Prevent invalid configs (e.g., negative slippage thresholds) at startup or runtime.
- **Hot-Reloading**: Monitor config files and apply changes seamlessly, minimizing disruption.
- **Security**: Handle sensitive data (e.g., wallet seeds) with encryption and least-privilege access.
- **Integration**: Tie into Core Logic for runtime updates and Testing Framework for automated checks.

## Technology Additions

- **Validation Library**: Joi (for schema-based validation—simple, powerful, and integrates with Express if you add a dashboard).
- **Watcher**: Chokidar (lightweight file watcher for hot-reloading).
- **Secrets Management**: dotenv (base) + optional vault tools like dotenv-vault for encrypted .env files.
- **Logging**: Winston or your existing structured logger for config change audits.

## Setup Instructions

1. Install dependencies:
```bash
npm install joi chokidar dotenv
```

2. Update package.json scripts:
```json
{
  "scripts": {
    "start": "node src/index.js --watch-config"
  }
}
```

3. Create a config/schema.js for validation schemas (example below).

## Validation Implementation

Define a Joi schema for all config params. This runs at startup and on reloads.

### Example: src/config/schema.js

```javascript
const Joi = require('joi');

const configSchema = Joi.object({
  network: Joi.object({
    serverUrl: Joi.string().uri().required(),
    fallbackUrls: Joi.array().items(Joi.string().uri()).min(1),
    connectionTimeout: Joi.number().integer().min(5000).default(20000),
  }).required(),
  
  risk: Joi.object({
    maxExposureXrp: Joi.number().positive().required(),
    maxSlippagePercent: Joi.number().min(0).max(5).default(0.5),
    stopLossPercent: Joi.number().min(0).max(20).default(5.0),
  }).required(),
  
  strategies: Joi.object({
    ammFeeVoteThreshold: Joi.number().min(0).max(0.01).default(0.003),
    clobSpreadMultiplier: Joi.number().min(1).default(1.2),
  }).required(),
  
  xrplWalletSeed: Joi.string().required().description('Sensitive: XRPL wallet seed'),
  // Add more sections as needed
}).unknown(true); // Allow extra keys for flexibility

module.exports = { configSchema };
```

### Validator function in src/config/loader.js:

```javascript
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const { configSchema } = require('./schema');

function loadAndValidateConfig(env = 'development') {
  dotenv.config({ path: path.resolve(__dirname, `../../.env.${env}`) });
  
  const config = { ...process.env };
  const { error, value } = configSchema.validate(config, { abortEarly: false });
  
  if (error) {
    throw new Error(`Config validation failed: ${error.details.map(d => d.message).join('; ')}`);
  }
  
  console.log('Config validated successfully');
  return value;
}

module.exports = { loadAndValidateConfig };
```

### Integrate into Core Logic (e.g., in src/index.js):

```javascript
const { loadAndValidateConfig } = require('./config/loader');

try {
  const config = loadAndValidateConfig(process.env.NODE_ENV);
  // Proceed with bot initialization
} catch (err) {
  console.error('Startup failed:', err);
  process.exit(1);
}
```

## Hot-Reloading Implementation

Use Chokidar to watch config files and reload on changes.

### Example: src/config/watcher.js

```javascript
const chokidar = require('chokidar');
const path = require('path');
const { loadAndValidateConfig } = require('./loader');
const EventEmitter = require('events');

class ConfigWatcher extends EventEmitter {
  constructor(env) {
    super();
    this.env = env;
    this.configPath = path.resolve(__dirname, `../../.env.${env}`);
    this.currentConfig = loadAndValidateConfig(env);
    
    this.watcher = chokidar.watch(this.configPath, { persistent: true });
    this.watcher.on('change', this.handleChange.bind(this));
  }
  
  handleChange() {
    try {
      const newConfig = loadAndValidateConfig(this.env);
      this.currentConfig = newConfig;
      this.emit('configUpdated', newConfig);
      console.log('Config hot-reloaded successfully');
    } catch (err) {
      console.error('Hot-reload failed:', err);
      // Optional: Emit error event or fallback to previous config
    }
  }
  
  getConfig() {
    return this.currentConfig;
  }
}

module.exports = ConfigWatcher;
```

### Integrate into Core Logic:

```javascript
const ConfigWatcher = require('./config/watcher');

const configWatcher = new ConfigWatcher(process.env.NODE_ENV);
configWatcher.on('configUpdated', (newConfig) => {
  // Apply changes dynamically, e.g., update risk limits in Risk Manager
  riskManager.updateLimits(newConfig.risk);
  strategies.updateThresholds(newConfig.strategies);
});
```

## Security Enhancements

1. **Encrypt Secrets**: Use dotenv-vault for encrypted .env files: `npm install dotenv-vault` and run `npx dotenv-vault new` for mainnet.
2. **Runtime Masking**: In logs/reports, mask sensitive fields like XRPL_WALLET_SEED.
3. **Access Controls**: Load configs with process.env only in secure environments; use vaults in cloud deploys.

## YAML Configuration Support (Alternative)

For more structured configuration with comments and hierarchies, consider using YAML:

1. Install dependencies:
```bash
npm install js-yaml
```

2. Update loader.js to support YAML:
```javascript
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

function loadYamlConfig(configPath) {
  try {
    const fileContents = fs.readFileSync(configPath, 'utf8');
    const config = yaml.load(fileContents);
    return config;
  } catch (e) {
    throw new Error(`Error loading YAML config: ${e.message}`);
  }
}

// Then validate with Joi as before
```

3. Example config.yaml:
```yaml
network:
  # Main XRPL node connection
  serverUrl: wss://xrplcluster.com
  fallbackUrls:
    - wss://s1.ripple.com
    - wss://s2.ripple.com
  connectionTimeout: 20000  # ms

risk:
  # Maximum exposure in XRP
  maxExposureXrp: 1000
  maxSlippagePercent: 0.5
  stopLossPercent: 5.0

strategies:
  ammFeeVoteThreshold: 0.003
  clobSpreadMultiplier: 1.2
```

## Testing Integration

Add tests for validation/hot-reloading to testing.md's framework.

### Example Unit Test: src/config/loader.test.js

```javascript
describe('Config Validation', () => {
  it('validates a complete config', () => {
    const validConfig = { /* mock full config */ };
    expect(() => configSchema.validate(validConfig)).not.toThrow();
  });

  it('rejects invalid slippage', () => {
    const invalidConfig = { risk: { maxSlippagePercent: -1 } };
    const { error } = configSchema.validate(invalidConfig);
    expect(error).toBeDefined();
  });
});
```

### Integration Test for Hot-Reloading:

```javascript
describe('Config Hot-Reloading', () => {
  let configWatcher;
  let configPath;
  
  beforeEach(() => {
    configPath = path.join(__dirname, '../test-config.env');
    fs.writeFileSync(configPath, 'MAX_EXPOSURE_XRP=1000');
    configWatcher = new ConfigWatcher('test', configPath);
  });
  
  afterEach(() => {
    configWatcher.watcher.close();
    if (fs.existsSync(configPath)) fs.unlinkSync(configPath);
  });
  
  it('detects and reloads config changes', (done) => {
    configWatcher.on('configUpdated', (newConfig) => {
      expect(newConfig.MAX_EXPOSURE_XRP).toBe('2000');
      done();
    });
    
    // Change the config file
    fs.writeFileSync(configPath, 'MAX_EXPOSURE_XRP=2000');
  });
});
```

## Advanced Features

### 1. Granular Change Detection

Detect which specific config values changed and only update affected components:

```javascript
class ConfigWatcher extends EventEmitter {
  // ...existing code...
  
  handleChange() {
    try {
      const newConfig = loadAndValidateConfig(this.env);
      
      // Compare with previous config and emit specific change events
      const changes = this.detectChanges(this.currentConfig, newConfig);
      
      if (changes.risk) {
        this.emit('riskConfigUpdated', newConfig.risk);
      }
      
      if (changes.strategies) {
        this.emit('strategiesConfigUpdated', newConfig.strategies);
      }
      
      this.currentConfig = newConfig;
      this.emit('configUpdated', newConfig);
      console.log('Config hot-reloaded successfully');
    } catch (err) {
      console.error('Hot-reload failed:', err);
    }
  }
  
  detectChanges(oldConfig, newConfig) {
    const changes = {};
    
    // Compare top-level sections
    for (const section of ['risk', 'strategies', 'network']) {
      if (JSON.stringify(oldConfig[section]) !== JSON.stringify(newConfig[section])) {
        changes[section] = true;
      }
    }
    
    return changes;
  }
}
```

### 2. Remote Configuration

For cloud deployments, add support for remote configuration sources:

```javascript
// Example with Firebase Remote Config
const firebase = require('firebase-admin');

async function loadRemoteConfig() {
  try {
    await firebase.initializeApp();
    const remoteConfig = firebase.remoteConfig();
    const template = await remoteConfig.getTemplate();
    
    const config = {};
    for (const [key, param] of Object.entries(template.parameters)) {
      config[key] = param.defaultValue.value;
    }
    
    return config;
  } catch (err) {
    console.error('Failed to load remote config:', err);
    // Fall back to local config
    return loadAndValidateConfig(process.env.NODE_ENV);
  }
}
```

## Roadmap for Implementation

1. **Phase 1**: Add validation schema and loader—test startup failures.
2. **Phase 2**: Implement watcher and event emissions—verify hot-reloads in dev.
3. **Phase 3**: Secure secrets and integrate with mainnet configs from DEPLOYMENT.md.
4. **Phase 4**: Add advanced features like remote config pulls (e.g., from Firebase) for supreme scalability.

## Implementation Steps

1. Create the directory structure:
```
src/
  ├── config/
  │   ├── schema.js
  │   ├── loader.js
  │   ├── watcher.js
  │   └── __tests__/
  │       ├── schema.test.js
  │       └── watcher.test.js
```

2. Implement the schema validation first
3. Add the config loader with environment support
4. Implement the watcher for hot-reloading
5. Update the main application to use the new config system
6. Add tests for all components
7. Integrate with the existing bot components

This configuration enhancement system will make your bot more resilient, adaptable, and secure—essential qualities for a production-ready XRPL Liquidity Provider Bot operating on mainnet.
