# XRPL Liquidity Provider Bot

## Overview

This bot provides automated liquidity provision on the XRP Ledger (XRPL), focusing on high-volume, low-margin strategies through fees and spread arbitrage. It leverages XRPL's hybrid CLOB (Central Limit Order Book) and AMM (Automated Market Maker) systems to optimize liquidity provision.

## Key Features

- **Live Data Fusion**: Real-time XRPL testnet data ingestion with sentiment enrichment
- **AI-Driven Anomaly Detection**: Identifies market anomalies and triggers automated rebalancing
- **Automated Rebalancing**: Optimizes liquidity allocation based on market conditions
- **NFT Minting**: Generates NFTs for community engagement and yield proof
- **Quantum-Inspired CLOB Optimization**: Uses simulated annealing for optimal order placement
- **Eco-Impact Reporting**: Tracks and reports sustainability metrics

## Directory Structure

- `src/`: Source code for the bot
  - `services/`: Core services (data-harvester, anomaly-detector, nft-exporter, xrpl-client)
  - `test/`: Test modules and Live Validation Arena components
- `config/`: Configuration files
- `docs/`: Documentation files

## Getting Started

1. Install dependencies: `npm install`
2. Configure environment variables in `.env` file
3. Run the bot: `node src/index.js`

## Documentation

Detailed documentation is available in the `docs/` directory:

- [Deployment Guide](docs/DEPLOYMENT.md)
- [Testnet Deployment](docs/SUPREME_TESTNET_DEPLOYMENT.md)
- [Architecture Overview](docs/architecture.md)
- [Configuration System](docs/config-enhancements.md)
- [Liquidity Strategies](docs/liquidity-strategies.md)
- [Testing Framework](docs/testing.md)

## License

This project is licensed under the MIT License - see the LICENSE file for details.
