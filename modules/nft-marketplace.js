/**
 * NFT Marketplace Module
 * 
 * Auto-listing system for yield-proof NFTs with:
 * - XRPL DEX integration (Sologenic compatible)
 * - Royalty management (10% to DAO treasury)
 * - Yield badge metadata with APY stamps
 * - Social sharing capabilities
 * 
 * Part of the Stake-to-Yield Marketplace Hub
 */

const xrpl = require('xrpl');

class NFTMarketplace {
  constructor(connector) {
    this.connector = connector;
    this.royaltyRate = 0.10; // 10% royalty to DAO treasury
    this.daoTreasury = 'rDAOTreasuryTest'; // Mock DAO treasury address
    this.mintedNFTs = new Map(); // Track minted NFTs
    this.listedNFTs = new Map(); // Track listed NFTs
    this.soldNFTs = new Map(); // Track sold NFTs
  }

  /**
   * Mint a yield-proof NFT with comprehensive metadata
   * @param {Object} results - Simulation results
   * @param {string} winner - Winning strategy
   * @param {string} uri - Optional URI for NFT metadata
   * @returns {Object} Minting result with NFT ID
   */
  async mintYieldNFT(results, winner, uri = null) {
    if (!this.connector || !this.connector.wallet) {
      throw new Error('No connector or wallet available');
    }

    try {
      // Generate metadata
      const timestamp = Date.now();
      const metadata = {
        name: `XRPL Yield Proof - ${winner}`,
        description: `This NFT certifies a yield simulation of ${results.meanYield.toFixed(2)}% APY using the ${winner} strategy on July 16, 2025.`,
        yield: results.meanYield,
        winner: winner,
        date: '2025-07-16',
        sharpeRatio: results.sharpeRatio || 0,
        successRate: results.successRate || 100,
        ecoBoost: winner.includes('Eco') ? true : false,
        image: `https://xrpl-yield-nfts.io/images/${winner.replace(/[()% ]/g, '-').toLowerCase()}.png`,
        attributes: [
          { trait_type: "Yield", value: `${results.meanYield.toFixed(2)}%` },
          { trait_type: "Strategy", value: winner },
          { trait_type: "Sharpe Ratio", value: (results.sharpeRatio || 0).toFixed(2) },
          { trait_type: "Success Rate", value: `${(results.successRate || 100).toFixed(2)}%` },
          { trait_type: "Eco-Friendly", value: winner.includes('Eco') ? "Yes" : "No" }
        ],
        socialShareText: `🚀 Just minted my #XRPL Yield Proof NFT! ${results.meanYield.toFixed(2)}% APY with ${winner} strategy. #XRPLGreenDeFi #YieldDAO`
      };

      // Use provided URI or generate metadata URI
      const metadataURI = uri || `https://xrpl-yield-nfts.io/metadata/${timestamp}.json`;
      
      console.log(`🎨 Creating Yield NFT with metadata:`);
      console.log(JSON.stringify(metadata, null, 2));

      // Prepare NFT minting transaction
      const tx = await this.connector.client.autofill({
        TransactionType: 'NFTokenMint',
        Account: this.connector.wallet.address,
        URI: xrpl.convertStringToHex(metadataURI),
        NFTokenTaxon: 0, // Required field but not used
        Flags: xrpl.NFTokenMintFlags.tfTransferable
      });

      // Sign and submit transaction
      const signed = this.connector.wallet.sign(tx);
      const result = await this.connector.client.submitAndWait(signed.tx_blob);
      
      // Extract NFT ID from transaction result
      const nftID = this.extractNFTokenID(result);
      
      if (!nftID) {
        throw new Error('Failed to extract NFT ID from transaction result');
      }
      
      // Store minted NFT info
      this.mintedNFTs.set(nftID, {
        id: nftID,
        metadata,
        metadataURI,
        txHash: result.result.hash,
        timestamp,
        owner: this.connector.wallet.address
      });
      
      console.log(`✅ NFT Minted: ID ${nftID}`);
      console.log(`📊 Yield: ${results.meanYield.toFixed(2)}%, Strategy: ${winner}`);
      console.log(`🔗 Metadata URI: ${metadataURI}`);
      
      return {
        success: true,
        nftID,
        txHash: result.result.hash,
        metadata,
        metadataURI
      };
    } catch (error) {
      console.error(`⚠️ NFT minting error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract NFT ID from transaction result
   * @param {Object} txResult - Transaction result
   * @returns {string|null} NFT ID or null if not found
   */
  extractNFTokenID(txResult) {
    // In a real implementation, we would parse the transaction metadata
    // For this mock, we'll generate a realistic NFT ID
    return `00081388DC6B175F523586C5E36D0D9A7C3F3C13FB6F8B3DC6B175F523586C5E36D0D9A7C3F3C13FB6F8B3000000D9`;
  }

  /**
   * List NFT on XRPL DEX (compatible with Sologenic)
   * @param {string} nftID - NFT ID to list
   * @param {number} price - Listing price in XRP
   * @returns {Object} Listing result
   */
  async listNFT(nftID, price = 50) {
    if (!this.connector || !this.connector.wallet) {
      throw new Error('No connector or wallet available');
    }

    if (!this.mintedNFTs.has(nftID)) {
      throw new Error(`NFT ${nftID} not found in minted NFTs`);
    }

    try {
      console.log(`💹 Listing NFT ${nftID} on XRPL DEX for ${price} XRP`);
      
      // Prepare NFT sell offer transaction
      const tx = await this.connector.client.autofill({
        TransactionType: 'NFTokenCreateOffer',
        Account: this.connector.wallet.address,
        NFTokenID: nftID,
        Amount: xrpl.xrpToDrops(price),
        Flags: xrpl.NFTokenCreateOfferFlags.tfSellNFToken
      });

      // Sign and submit transaction
      const signed = this.connector.wallet.sign(tx);
      const result = await this.connector.client.submitAndWait(signed.tx_blob);
      
      // Extract offer index from transaction result
      const offerIndex = this.extractOfferIndex(result);
      
      if (!offerIndex) {
        throw new Error('Failed to extract offer index from transaction result');
      }
      
      // Store listed NFT info
      this.listedNFTs.set(nftID, {
        id: nftID,
        offerIndex,
        price,
        txHash: result.result.hash,
        timestamp: Date.now(),
        seller: this.connector.wallet.address,
        metadata: this.mintedNFTs.get(nftID).metadata
      });
      
      console.log(`✅ NFT Listed: ID ${nftID}, Offer Index ${offerIndex}`);
      console.log(`💰 Price: ${price} XRP`);
      console.log(`🤑 Expected royalty: ${(price * this.royaltyRate).toFixed(2)} XRP (${this.royaltyRate * 100}%)`);
      
      // Generate social share text
      const metadata = this.mintedNFTs.get(nftID).metadata;
      const shareText = `🚀 Just listed my #XRPL Yield Proof NFT for ${price} XRP! ${metadata.yield.toFixed(2)}% APY with ${metadata.winner} strategy. Get it now! #XRPLGreenDeFi #YieldDAO`;
      console.log(`\n📱 Share on social media:`);
      console.log(shareText);
      
      return {
        success: true,
        nftID,
        offerIndex,
        txHash: result.result.hash,
        price,
        shareText
      };
    } catch (error) {
      console.error(`⚠️ NFT listing error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract offer index from transaction result
   * @param {Object} txResult - Transaction result
   * @returns {string|null} Offer index or null if not found
   */
  extractOfferIndex(txResult) {
    // In a real implementation, we would parse the transaction metadata
    // For this mock, we'll generate a realistic offer index
    return `${Date.now().toString(16)}${Math.floor(Math.random() * 1000000).toString(16)}`;
  }

  /**
   * Accept an NFT offer (simulate purchase)
   * @param {string} offerIndex - Offer index to accept
   * @returns {Object} Purchase result
   */
  async acceptOffer(offerIndex) {
    if (!this.connector || !this.connector.wallet) {
      throw new Error('No connector or wallet available');
    }

    // Find NFT by offer index
    let nftID = null;
    let listing = null;
    
    for (const [id, data] of this.listedNFTs.entries()) {
      if (data.offerIndex === offerIndex) {
        nftID = id;
        listing = data;
        break;
      }
    }

    if (!nftID || !listing) {
      throw new Error(`Offer ${offerIndex} not found in listed NFTs`);
    }

    try {
      console.log(`🛒 Accepting offer for NFT ${nftID} at ${listing.price} XRP`);
      
      // Prepare accept offer transaction
      const tx = await this.connector.client.autofill({
        TransactionType: 'NFTokenAcceptOffer',
        Account: this.connector.wallet.address,
        NFTokenSellOffer: offerIndex
      });

      // Sign and submit transaction
      const signed = this.connector.wallet.sign(tx);
      const result = await this.connector.client.submitAndWait(signed.tx_blob);
      
      // Calculate royalty
      const royaltyAmount = listing.price * this.royaltyRate;
      
      // Store sold NFT info
      this.soldNFTs.set(nftID, {
        id: nftID,
        offerIndex,
        price: listing.price,
        royalty: royaltyAmount,
        txHash: result.result.hash,
        timestamp: Date.now(),
        seller: listing.seller,
        buyer: this.connector.wallet.address,
        metadata: listing.metadata
      });
      
      // Remove from listed NFTs
      this.listedNFTs.delete(nftID);
      
      console.log(`✅ NFT Sold: ID ${nftID}`);
      console.log(`💰 Price: ${listing.price} XRP`);
      console.log(`💸 Royalty: ${royaltyAmount.toFixed(2)} XRP to DAO treasury`);
      
      return {
        success: true,
        nftID,
        txHash: result.result.hash,
        price: listing.price,
        royalty: royaltyAmount
      };
    } catch (error) {
      console.error(`⚠️ NFT purchase error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Pay royalties to DAO treasury
   * @param {string} nftID - NFT ID that was sold
   * @returns {Object} Royalty payment result
   */
  async payRoyalties(nftID) {
    if (!this.connector || !this.connector.wallet) {
      throw new Error('No connector or wallet available');
    }

    if (!this.soldNFTs.has(nftID)) {
      throw new Error(`NFT ${nftID} not found in sold NFTs`);
    }

    const soldNFT = this.soldNFTs.get(nftID);

    try {
      console.log(`💸 Paying royalties for NFT ${nftID} to DAO treasury`);
      
      // Prepare payment transaction
      const tx = await this.connector.client.autofill({
        TransactionType: 'Payment',
        Account: this.connector.wallet.address,
        Destination: this.daoTreasury,
        Amount: xrpl.xrpToDrops(soldNFT.royalty)
      });

      // Sign and submit transaction
      const signed = this.connector.wallet.sign(tx);
      const result = await this.connector.client.submitAndWait(signed.tx_blob);
      
      console.log(`✅ Royalty paid: ${soldNFT.royalty.toFixed(2)} XRP to DAO treasury`);
      
      return {
        success: true,
        nftID,
        txHash: result.result.hash,
        royaltyAmount: soldNFT.royalty
      };
    } catch (error) {
      console.error(`⚠️ Royalty payment error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate shareable social media content for NFT
   * @param {string} nftID - NFT ID to share
   * @returns {Object} Social media content
   */
  generateSocialContent(nftID) {
    if (!this.mintedNFTs.has(nftID)) {
      throw new Error(`NFT ${nftID} not found in minted NFTs`);
    }

    const nft = this.mintedNFTs.get(nftID);
    const metadata = nft.metadata;
    
    // Generate different content types
    const twitter = `🚀 Just minted my #XRPL Yield Proof NFT! ${metadata.yield.toFixed(2)}% APY with ${metadata.winner} strategy. #XRPLGreenDeFi #YieldDAO`;
    
    const linkedin = `I'm excited to share my latest XRPL Yield Proof NFT, showing a ${metadata.yield.toFixed(2)}% APY using the ${metadata.winner} strategy. This represents the future of transparent, community-governed DeFi on the XRP Ledger. #XRPLGreenDeFi #YieldDAO`;
    
    const discord = `**XRPL Yield Proof NFT Minted!**\n🚀 ${metadata.yield.toFixed(2)}% APY\n🌱 Strategy: ${metadata.winner}\n💰 Expected Annual Passive Income: ${((metadata.yield / 100) * 10000).toLocaleString()} XRP\n\nWho's joining the next DAO vote? Let's optimize yields together! #XRPLGreenDeFi`;
    
    return {
      twitter,
      linkedin,
      discord,
      imageUrl: metadata.image,
      metadata: nft.metadataURI
    };
  }

  /**
   * Get marketplace statistics
   * @returns {Object} Marketplace stats
   */
  getMarketplaceStats() {
    const totalMinted = this.mintedNFTs.size;
    const totalListed = this.listedNFTs.size;
    const totalSold = this.soldNFTs.size;
    
    let totalVolume = 0;
    let totalRoyalties = 0;
    
    for (const nft of this.soldNFTs.values()) {
      totalVolume += nft.price;
      totalRoyalties += nft.royalty;
    }
    
    return {
      totalMinted,
      totalListed,
      totalSold,
      totalVolume,
      totalRoyalties,
      averagePrice: totalSold > 0 ? totalVolume / totalSold : 0,
      treasuryBalance: totalRoyalties
    };
  }
}

module.exports = NFTMarketplace;
