/**
 * XRPL Client Service (Mock Implementation)
 * Provides a lightweight mock implementation of the XRPL client for testing
 */

const xrpl = require('xrpl');
const logger = require('../utils/logger');

// Singleton instance
let client = null;

/**
 * Get the XRPL client instance (creates one if it doesn't exist)
 * @returns {Promise<Object>} - XRPL client instance
 */
async function getXrplClient() {
  if (client) {
    return client;
  }
  
  try {
    logger.info('XRPL Client: Initializing mock client');
    
    // Create a mock client with necessary methods
    client = {
      isConnected: () => true,
      
      connect: async () => {
        logger.info('XRPL Client: Connected to testnet');
        return true;
      },
      
      disconnect: async () => {
        logger.info('XRPL Client: Disconnected from testnet');
        return true;
      },
      
      request: async (request) => {
        logger.info(`XRPL Client: Processing request type: ${request.command}`);
        
        // Mock responses for different request types
        switch (request.command) {
          case 'account_info':
            return {
              result: {
                account_data: {
                  Account: request.account || 'rMockAccount123456789',
                  Balance: '1000000000', // 1000 XRP
                  Sequence: 123
                }
              }
            };
            
          case 'account_lines':
            return {
              result: {
                lines: [
                  {
                    account: 'rIssuer123456789',
                    balance: '100',
                    currency: 'USD',
                    limit: '1000',
                    limit_peer: '0'
                  }
                ]
              }
            };
            
          case 'book_offers':
            return {
              result: {
                offers: [
                  {
                    Account: 'rTrader123456789',
                    BookDirectory: '...',
                    BookNode: '0',
                    Flags: 0,
                    LedgerEntryType: 'Offer',
                    OwnerNode: '0',
                    PreviousTxnID: '...',
                    PreviousTxnLgrSeq: 123456,
                    Sequence: 42,
                    TakerGets: {
                      currency: 'USD',
                      issuer: 'rIssuer123456789',
                      value: '100'
                    },
                    TakerPays: '100000000', // 100 XRP
                    index: '...',
                    owner_funds: '200',
                    quality: '1'
                  }
                ]
              }
            };
            
          case 'amm_info':
            return {
              result: {
                amm: {
                  account: 'rAMM123456789',
                  amount: {
                    currency: 'XRP',
                    value: '1000'
                  },
                  amount2: {
                    currency: 'USD',
                    issuer: 'rIssuer123456789',
                    value: '1000'
                  },
                  lp_token: {
                    currency: 'LP',
                    issuer: 'rAMM123456789',
                    value: '1000'
                  },
                  trading_fee: 500, // 0.5%
                  auction_slot: {
                    account: 'rTrader123456789',
                    discounted_fee: 250, // 0.25%
                    expiration: Date.now() + 86400000 // 24 hours
                  }
                }
              }
            };
            
          case 'subscribe':
            // Mock subscription response
            return {
              result: {
                status: 'success',
                type: 'response',
                id: request.id || 'mock_subscription'
              }
            };
            
          default:
            return {
              result: {
                status: 'success',
                info: 'Mock response for ' + request.command
              }
            };
        }
      },
      
      // Mock event emitter methods
      on: (event, callback) => {
        logger.info(`XRPL Client: Registered listener for event: ${event}`);
      },
      
      once: (event, callback) => {
        logger.info(`XRPL Client: Registered one-time listener for event: ${event}`);
      },
      
      // Mock wallet methods
      fundWallet: async () => {
        return {
          wallet: xrpl.Wallet.generate(),
          balance: 1000
        };
      }
    };
    
    return client;
  } catch (error) {
    logger.error(`XRPL Client: Initialization error: ${error.message}`);
    throw error;
  }
}

module.exports = {
  getXrplClient
};
