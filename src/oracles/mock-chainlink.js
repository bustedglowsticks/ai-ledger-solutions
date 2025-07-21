class MockChainlink {
  async getNasdaqData() {
    return { price: 22995, change: -0.0027 };
  }
  async getETFInflow() {
    return 8300000;
  }
}

module.exports = MockChainlink; 