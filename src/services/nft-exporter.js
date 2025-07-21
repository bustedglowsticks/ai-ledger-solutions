/**
 * NFT Exporter Service
 * 
 * Mints "Proof of Yield" NFTs on XRPL testnet
 * Includes visualization snapshots and shareable metadata
 */

const xrpl = require('xrpl');
const logger = require('../utils/logger');

class NFTExporter {
  constructor(config = {}) {
    this.config = {
      xrplTestnetUrl: config.xrplTestnetUrl || 'wss://s.altnet.rippletest.net:51233',
      wallet: config.wallet || null,
      defaultTaxon: config.defaultTaxon || 0,
      ...config
    };
    
    this.client = null;
    this.initialized = false;
  }
  
  /**
   * Initialize the NFT exporter
   * @returns {Promise<boolean>} Whether initialization was successful
   */
  async initialize() {
    try {
      logger.info('NFT Exporter: Initializing service');
      
      // Create XRPL client
      this.client = new xrpl.Client(this.config.xrplTestnetUrl);
      
      // Connect to XRPL
      await this.client.connect();
      
      // If no wallet is provided, create a test wallet
      if (!this.config.wallet) {
        // For testing purposes only - in production, use a secure wallet
        const { wallet } = await this.client.fundWallet();
        this.config.wallet = wallet;
        logger.info(`NFT Exporter: Created test wallet with address ${wallet.address}`);
      }
      
      this.initialized = true;
      
      logger.info('NFT Exporter: Initialized successfully');
      return true;
    } catch (error) {
      logger.error(`NFT Exporter: Initialization failed: ${error.message}`);
      return false;
    }
  }
  
  /**
   * Mint a "Proof of Yield" NFT
   * @param {Object} metadata - Metadata for the NFT
   * @param {string} imageData - Base64-encoded image data or URI
   * @returns {Promise<Object>} Minting result
   */
  async mintYieldProofNFT(metadata, imageData) {
    try {
      logger.info('NFT Exporter: Minting Yield Proof NFT');
      
      if (!this.initialized) {
        await this.initialize();
      }
      
      // Validate metadata
      if (!metadata || typeof metadata !== 'object') {
        throw new Error('Invalid metadata');
      }
      
      // Prepare NFT metadata
      const nftMetadata = {
        ...metadata,
        timestamp: metadata.timestamp || Date.now(),
        type: 'YieldProof',
        version: '1.0'
      };
      
      // Convert metadata to hex string
      const metadataHex = xrpl.convertStringToHex(JSON.stringify(nftMetadata));
      
      // Calculate taxon based on eco score if available
      const taxon = metadata.ecoScore 
        ? Math.floor(metadata.ecoScore * 100) 
        : this.config.defaultTaxon;
      
      // Prepare transaction
      const transactionBlob = {
        TransactionType: 'NFTokenMint',
        Account: this.config.wallet.address,
        URI: xrpl.convertStringToHex(imageData),
        Flags: 8, // transferable
        TokenTaxon: taxon,
        Memos: [
          {
            Memo: {
              MemoData: metadataHex
            }
          }
        ]
      };
      
      // Autofill transaction details
      const tx = await this.client.autofill(transactionBlob);
      
      // Sign transaction
      const signed = this.config.wallet.sign(tx);
      
      // Submit transaction
      const result = await this.client.submitAndWait(signed.tx_blob);
      
      // Extract NFT ID from result
      const nfTokenId = this._extractNFTokenID(result);
      
      logger.info(`NFT Exporter: Successfully minted NFT with ID ${nfTokenId}`);
      
      // Generate shareable content
      const shareableContent = this._generateShareableContent(nftMetadata, nfTokenId);
      
      return {
        success: true,
        nfTokenId,
        result,
        metadata: nftMetadata,
        shareableContent
      };
    } catch (error) {
      logger.error(`NFT Exporter: Error minting NFT: ${error.message}`);
      
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Extract NFToken ID from transaction result
   * @param {Object} result - Transaction result
   * @returns {string} NFToken ID
   * @private
   */
  _extractNFTokenID(result) {
    try {
      // In a real implementation, we would parse the transaction result
      // to extract the NFToken ID
      
      // For now, generate a mock NFToken ID
      return `00000000${Date.now().toString(16)}00000000000000000000000000`;
    } catch (error) {
      logger.error(`NFT Exporter: Error extracting NFToken ID: ${error.message}`);
      return `MOCK_TOKEN_${Date.now().toString(16)}`;
    }
  }
  
  /**
   * Generate shareable content for social media
   * @param {Object} metadata - NFT metadata
   * @param {string} nfTokenId - NFToken ID
   * @returns {Object} Shareable content
   * @private
   */
  _generateShareableContent(metadata, nfTokenId) {
    try {
      // Generate Twitter/X share text
      const twitterText = `🚀 Just minted my #XRPLBotYieldProof NFT with ${metadata.yield ? metadata.yield.toFixed(1) + '% yield' : 'amazing returns'}! ${metadata.ecoScore ? `♻️ Eco-Score: ${(metadata.ecoScore * 100).toFixed(0)}%` : ''} #XRPL2025 #XRPCommunity`;
      
      // Generate Discord embed
      const discordEmbed = {
        title: '🏆 XRPL Bot Yield Proof NFT',
        description: `Just minted a Proof of Yield NFT on the XRPL testnet!`,
        fields: [
          {
            name: 'Yield',
            value: metadata.yield ? `${metadata.yield.toFixed(1)}%` : 'N/A',
            inline: true
          },
          {
            name: 'Eco-Score',
            value: metadata.ecoScore ? `${(metadata.ecoScore * 100).toFixed(0)}%` : 'N/A',
            inline: true
          },
          {
            name: 'NFT ID',
            value: `\`${nfTokenId}\``,
            inline: false
          }
        ],
        color: 0x3498db
      };
      
      // Generate HTML share snippet
      const htmlSnippet = `
        <div class="yield-proof-nft">
          <h3>🏆 XRPL Bot Yield Proof NFT</h3>
          <div class="stats">
            <div class="stat">
              <span class="label">Yield:</span>
              <span class="value">${metadata.yield ? `${metadata.yield.toFixed(1)}%` : 'N/A'}</span>
            </div>
            <div class="stat">
              <span class="label">Eco-Score:</span>
              <span class="value">${metadata.ecoScore ? `${(metadata.ecoScore * 100).toFixed(0)}%` : 'N/A'}</span>
            </div>
          </div>
          <div class="nft-id">
            <span class="label">NFT ID:</span>
            <code>${nfTokenId}</code>
          </div>
          <div class="share-buttons">
            <a href="https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}" target="_blank">Share on X</a>
            <a href="#" class="copy-discord" data-embed="${encodeURIComponent(JSON.stringify(discordEmbed))}">Copy for Discord</a>
          </div>
        </div>
      `;
      
      return {
        twitterText,
        discordEmbed,
        htmlSnippet,
        nfTokenId,
        metadata
      };
    } catch (error) {
      logger.error(`NFT Exporter: Error generating shareable content: ${error.message}`);
      
      return {
        twitterText: `Check out my #XRPLBotYieldProof NFT! #XRPL2025`,
        discordEmbed: {
          title: 'XRPL Bot Yield Proof NFT',
          description: 'Just minted a Proof of Yield NFT!'
        },
        htmlSnippet: '<div>XRPL Bot Yield Proof NFT</div>',
        nfTokenId,
        metadata
      };
    }
  }
  
  /**
   * Capture visualization snapshot
   * @param {HTMLElement} element - DOM element to capture
   * @returns {Promise<string>} Base64-encoded image data
   */
  async captureSnapshot(element) {
    try {
      logger.info('NFT Exporter: Capturing visualization snapshot');
      
      // In a browser environment, this would use html2canvas
      // For now, we'll return a mock base64 image
      
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    } catch (error) {
      logger.error(`NFT Exporter: Error capturing snapshot: ${error.message}`);
      
      // Return a minimal base64 image
      return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    }
  }
  
  /**
   * Stop the NFT exporter
   * @returns {Promise<boolean>} Whether stop was successful
   */
  async stop() {
    try {
      logger.info('NFT Exporter: Stopping service');
      
      // Disconnect from XRPL if connected
      if (this.client && this.client.isConnected()) {
        await this.client.disconnect();
      }
      
      this.initialized = false;
      
      logger.info('NFT Exporter: Stopped successfully');
      return true;
    } catch (error) {
      logger.error(`NFT Exporter: Stop failed: ${error.message}`);
      return false;
    }
  }
}

// Export a singleton instance
module.exports = new NFTExporter();
