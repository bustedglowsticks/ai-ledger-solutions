const xrpl = require('xrpl');

class NetworkConnector {
  constructor() {
    this.client = null;
    this.wallet = null;
    this.isConnected = false;
    this.currentNetwork = null;
    this.connectionAttempts = 0;
    this.maxRetries = 5;
  }

  // Network configurations
  getNetworks() {
    return {
      testnet: {
        name: 'XRPL Testnet',
        server: 'wss://s.altnet.rippletest.net:51233',
        faucet: 'https://faucet.altnet.rippletest.net/accounts',
        description: 'Test environment with free XRP'
      },
      mainnet: {
        name: 'XRPL Mainnet',
        server: 'wss://s1.ripple.com',
        faucet: null,
        description: 'Production network with real XRP'
      },
      devnet: {
        name: 'XRPL Devnet',
        server: 'wss://s.devnet.rippletest.net:51233',
        faucet: 'https://faucet.devnet.rippletest.net/accounts',
        description: 'Development environment'
      },
      hooks: {
        name: 'XRPL Hooks Testnet',
        server: 'wss://hooks-testnet-v3.xrpl-labs.com',
        faucet: 'https://hooks-testnet-v3.xrpl-labs.com/faucet',
        description: 'Hooks-enabled testnet'
      }
    };
  }

  async connect(networkName = 'testnet', walletSeed = null) {
    const networks = this.getNetworks();
    const network = networks[networkName];
    
    if (!network) {
      throw new Error(`Unknown network: ${networkName}. Available: ${Object.keys(networks).join(', ')}`);
    }

    console.log(`🌐 BEAST MODE: Connecting to ${network.name}...`);
    console.log(`   Server: ${network.server}`);
    console.log(`   Description: ${network.description}`);

    try {
      // Create client
      this.client = new xrpl.Client(network.server);
      
      // Connect with timeout
      await Promise.race([
        this.client.connect(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Connection timeout')), 30000)
        )
      ]);

      this.isConnected = true;
      this.currentNetwork = networkName;
      this.connectionAttempts = 0;

      console.log(`✅ BEAST MODE: Successfully connected to ${network.name}!`);

      // Setup wallet
      if (walletSeed) {
        await this.setupWallet(walletSeed);
      } else {
        await this.createWallet();
      }

      // Setup event listeners
      this.setupEventListeners();

      return {
        success: true,
        network: networkName,
        server: network.server,
        wallet: this.wallet ? this.wallet.address : null
      };

    } catch (error) {
      this.connectionAttempts++;
      console.error(`❌ BEAST MODE: Connection failed to ${network.name}:`, error.message);
      
      if (this.connectionAttempts < this.maxRetries) {
        console.log(`🔄 BEAST MODE: Retrying connection (${this.connectionAttempts}/${this.maxRetries})...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        return this.connect(networkName, walletSeed);
      } else {
        throw new Error(`Failed to connect to ${network.name} after ${this.maxRetries} attempts`);
      }
    }
  }

  async setupWallet(seed) {
    try {
      this.wallet = xrpl.Wallet.fromSeed(seed);
      console.log(`💰 BEAST MODE: Wallet loaded - ${this.wallet.address}`);
      
      // Check balance
      const balance = await this.getBalance();
      console.log(`💰 BEAST MODE: Current balance: ${balance} XRP`);
      
      return this.wallet;
    } catch (error) {
      console.error('❌ BEAST MODE: Wallet setup failed:', error.message);
      throw error;
    }
  }

  async createWallet() {
    try {
      this.wallet = xrpl.Wallet.generate();
      console.log(`💰 BEAST MODE: New wallet created - ${this.wallet.address}`);
      console.log(`🔑 BEAST MODE: Seed: ${this.wallet.seed}`);
      
      // Fund wallet if on testnet
      if (this.currentNetwork === 'testnet' || this.currentNetwork === 'devnet') {
        await this.fundWallet();
      }
      
      return this.wallet;
    } catch (error) {
      console.error('❌ BEAST MODE: Wallet creation failed:', error.message);
      throw error;
    }
  }

  async fundWallet() {
    if (!this.wallet) {
      throw new Error('No wallet available');
    }

    try {
      console.log(`💰 BEAST MODE: Funding wallet from faucet...`);
      
      const response = await fetch('https://faucet.altnet.rippletest.net/accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          destination: this.wallet.address
        })
      });

      if (response.ok) {
        const result = await response.json();
        console.log(`✅ BEAST MODE: Wallet funded with ${result.amount} XRP`);
        
        // Wait for funding to be available
        await new Promise(resolve => setTimeout(resolve, 10000));
        
        const balance = await this.getBalance();
        console.log(`💰 BEAST MODE: New balance: ${balance} XRP`);
      } else {
        console.log(`⚠️ BEAST MODE: Faucet funding failed, but continuing...`);
      }
    } catch (error) {
      console.log(`⚠️ BEAST MODE: Faucet funding failed: ${error.message}`);
    }
  }

  async getBalance() {
    if (!this.client || !this.wallet) {
      throw new Error('Not connected or no wallet');
    }

    try {
      const response = await this.client.request({
        command: 'account_info',
        account: this.wallet.address,
        ledger_index: 'validated'
      });

      const balance = xrpl.dropsToXrp(response.result.account_data.Balance);
      return parseFloat(balance);
    } catch (error) {
      console.error('❌ BEAST MODE: Balance check failed:', error.message);
      return 0;
    }
  }

  async submitTransaction(transaction) {
    if (!this.client || !this.wallet) {
      throw new Error('Not connected or no wallet');
    }

    try {
      const prepared = await this.client.autofill(transaction);
      const signed = this.wallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob);
      
      console.log(`✅ BEAST MODE: Transaction submitted successfully`);
      return result;
    } catch (error) {
      console.error('❌ BEAST MODE: Transaction failed:', error.message);
      throw error;
    }
  }

  setupEventListeners() {
    if (!this.client) return;

    this.client.on('connected', () => {
      console.log('🔌 BEAST MODE: Connected to XRPL');
    });

    this.client.on('disconnected', () => {
      console.log('🔌 BEAST MODE: Disconnected from XRPL');
      this.isConnected = false;
    });

    this.client.on('error', (error) => {
      console.error('❌ BEAST MODE: XRPL connection error:', error);
    });
  }

  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.isConnected = false;
      this.currentNetwork = null;
      console.log('🔌 BEAST MODE: Disconnected from XRPL');
    }
  }

  getStatus() {
    return {
      isConnected: this.isConnected,
      network: this.currentNetwork,
      wallet: this.wallet ? this.wallet.address : null,
      connectionAttempts: this.connectionAttempts
    };
  }
}

module.exports = NetworkConnector; 