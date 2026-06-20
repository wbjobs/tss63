const FIVE_MINUTES = 5 * 60 * 1000;

class AuctionStore {
  constructor() {
    this.bids = [];
    this.currentPrice = 100;
    this.predictedPrice = null;
    this.itemId = "item-001";
    this.itemName = "稀有虚拟宝石";
    this.basePrice = 100;
  }

  addBid(userId, userName, price) {
    const bid = {
      userId,
      userName,
      price,
      timestamp: Date.now(),
    };
    this.bids.push(bid);
    this.currentPrice = price;
    this.cleanup();
    return bid;
  }

  cleanup() {
    const cutoff = Date.now() - FIVE_MINUTES;
    this.bids = this.bids.filter((bid) => bid.timestamp >= cutoff);
  }

  getRecentBids() {
    this.cleanup();
    return this.bids;
  }

  getState() {
    return {
      itemId: this.itemId,
      itemName: this.itemName,
      currentPrice: this.currentPrice,
      predictedPrice: this.predictedPrice,
      basePrice: this.basePrice,
      recentBids: this.getRecentBids(),
      totalBids: this.bids.length,
    };
  }
}

module.exports = AuctionStore;
