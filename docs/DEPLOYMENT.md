# XRPL Liquidity Provider Bot - Deployment Guide

This document outlines the steps required to deploy the XRPL Liquidity Provider Bot to the XRPL mainnet environment after successful testing on the testnet.

## Prerequisites

Before deploying to mainnet, ensure you have:

1. Successfully tested all components on the XRPL testnet
2. A secure XRPL wallet with sufficient XRP for operations
3. Proper security measures for protecting your wallet seed
4. Understanding of the risk parameters and strategy configurations

## Environment Setup

### 1. Create a Production Environment File

Create a `.env.production` file with your mainnet configuration:

```
# XRPL Wallet Configuration
# IMPORTANT: Keep this information secure!
XRPL_WALLET_SEED=your_secure_mainnet_wallet_seed
XRPL_WALLET_ADDRESS=your_mainnet_wallet_address

# Asset Issuers (Use actual mainnet issuers)
USD_ISSUER=actual_mainnet_usd_issuer
EUR_ISSUER=actual_mainnet_eur_issuer

# Alert Configuration
ALERT_WEBHOOK_URL=your_alert_webhook_url
ALERT_EMAIL=your_alert_email

# Logging
LOG_LEVEL=info
```

### 2. Update Configuration for Mainnet

Create a `config/production.json` file that extends the default configuration:

```json
{
  "network": {
    "serverUrl": "wss://xrplcluster.com",
    "fallbackUrls": [
      "wss://s1.ripple.com",
      "wss://s2.ripple.com"
    ],
    "connectionTimeout": 20000,
    "reconnectInterval": 10000,
    "maxReconnectAttempts": 10
  },
  "risk": {
    "maxExposureXrp": 1000,
    "maxExposureToken": 1000,
    "maxSlippagePercent": 0.5,
    "stopLossPercent": 5.0
  }
}
```

## Security Measures

### 1. Secure Wallet Management

- **NEVER** store your mainnet wallet seed in plain text files
- Use environment variables or a secure secret management service
- Consider using a hardware wallet for signing transactions
- Use a dedicated wallet for the bot with limited funds

### 2. Set Up Monitoring and Alerts

- Configure alerts for suspicious activity
- Monitor wallet balances and transactions
- Set up automated notifications for profit/loss thresholds
- Implement circuit breakers for market volatility

### 3. Implement Rate Limiting

- Add rate limiting for API calls to avoid hitting XRPL rate limits
- Implement exponential backoff for failed requests
- Monitor API usage and adjust as needed

## Deployment Steps

### 1. Install Dependencies

```bash
npm install --production
```

### 2. Run with Production Configuration

```bash
NODE_ENV=production node src/index.js start
```

### 3. Deploy as a Service (Linux/Unix)

Create a systemd service file for reliable operation:

```ini
[Unit]
Description=XRPL Liquidity Provider Bot
After=network.target

[Service]
Type=simple
User=your_service_user
WorkingDirectory=/path/to/bot
ExecStart=/usr/bin/node src/index.js start
Restart=always
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=xrpl-bot
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

### 4. Deploy with Docker (Alternative)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY . .

ENV NODE_ENV=production

CMD ["node", "src/index.js", "start"]
```

Build and run:

```bash
docker build -t xrpl-liquidity-bot .
docker run -d --name xrpl-bot --restart always -v /path/to/env:/app/.env xrpl-liquidity-bot
```

## Operational Procedures

### 1. Regular Maintenance

- Check logs daily for errors or warnings
- Monitor profit/loss reports
- Update strategy parameters as market conditions change
- Keep dependencies updated for security patches

### 2. Backup Procedures

- Regularly backup configuration files
- Securely store wallet recovery information
- Document all custom configurations and changes

### 3. Emergency Procedures

- Create a runbook for common issues
- Document steps to safely shut down the bot
- Have a process for emergency fund withdrawals
- Maintain contact information for support resources

## Performance Monitoring

- Set up dashboard for key metrics
- Monitor network throughput and latency
- Track strategy performance and profit/loss
- Set up alerts for abnormal behavior

## Compliance Considerations

- Ensure compliance with relevant regulations
- Keep records of all transactions for audit purposes
- Consider tax implications of trading activity
- Monitor regulatory changes that may affect operations

---

By following this deployment guide, you can safely transition your XRPL Liquidity Provider Bot from testnet to mainnet while maintaining security, reliability, and operational efficiency.
