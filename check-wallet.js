/**
 * Script to check wallet status on XRPL
 */

const xrpl = require('xrpl');

async function checkWallet() {
  try {
    console.log('Connecting to XRPL mainnet...');
    const client = new xrpl.Client('wss://xrplcluster.com');
    await client.connect();
    
    // Get wallet address from .env file or use hardcoded value
    const address = 'rPPkYBhkXJqastLAjN7MU8ZXcgSRJuuzC4';
    console.log(`Checking wallet ${address}...`);
    
    // Get account info
    const response = await client.request({
      command: 'account_info',
      account: address,
      ledger_index: 'validated'
    });
    
    console.log('Wallet information:');
    console.log(JSON.stringify(response.result, null, 2));
    
    // Get account balances
    const balances = await client.request({
      command: 'account_lines',
      account: address,
      ledger_index: 'validated'
    });
    
    console.log('Token balances:');
    console.log(JSON.stringify(balances.result, null, 2));
    
    await client.disconnect();
    console.log('Disconnected from XRPL');
  } catch (err) {
    console.error(`Error: ${err.message}`);
  }
}

checkWallet();
