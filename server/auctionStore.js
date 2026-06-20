const FIVE_MINUTES = 5 * 60 * 1000;
const MAX_BIDS_FOR_REGRESSION = 200;
const MIN_BID_INTERVAL_MS = 300;
const SENTIMENT_WINDOW = 60 * 1000;

class AuctionStore {
  constructor() {
    this.bids = [];
    this.currentPrice = 100;
    this.predictedPrice = null;
    this.sentimentIndex = 50;
    this.itemId = "item-001";
    this.itemName = "稀有虚拟宝石";
    this.basePrice = 100;
    this.lastBidByUser = new Map();
    this.sumX = 0;
    this.sumY = 0;
    this.sumXY = 0;
    this.sumXX = 0;
    this.n = 0;
    this.baseTime = null;
  }

  _getX(timestamp) {
    if (this.baseTime === null) {
      this.baseTime = timestamp;
    }
    return (timestamp - this.baseTime) / 1000;
  }

  canUserBid(userId) {
    const last = this.lastBidByUser.get(userId);
    if (last === undefined) return true;
    return Date.now() - last >= MIN_BID_INTERVAL_MS;
  }

  addBid(userId, userName, price) {
    const now = Date.now();
    this.lastBidByUser.set(userId, now);

    const bid = {
      userId,
      userName,
      price,
      timestamp: now,
      isBot: String(userId).startsWith("bot-"),
    };
    this.bids.push(bid);
    this.currentPrice = price;

    const x = this._getX(now);
    const y = price;
    this.sumX += x;
    this.sumY += y;
    this.sumXY += x * y;
    this.sumXX += x * x;
    this.n += 1;

    this.cleanup();
    this.sentimentIndex = this._computeSentiment();
    return bid;
  }

  cleanup() {
    const cutoff = Date.now() - FIVE_MINUTES;
    const oldLen = this.bids.length;
    this.bids = this.bids.filter((bid) => bid.timestamp >= cutoff);
    if (this.bids.length !== oldLen) {
      this._recomputeStats();
    }
  }

  _recomputeStats() {
    this.sumX = 0;
    this.sumY = 0;
    this.sumXY = 0;
    this.sumXX = 0;
    this.n = 0;
    this.baseTime = this.bids.length > 0 ? this.bids[0].timestamp : null;
    for (let i = 0; i < this.bids.length; i++) {
      const bid = this.bids[i];
      const x = this._getX(bid.timestamp);
      const y = bid.price;
      this.sumX += x;
      this.sumY += y;
      this.sumXY += x * y;
      this.sumXX += x * x;
      this.n += 1;
    }
  }

  _computeSentiment() {
    const now = Date.now();
    const cutoff = now - SENTIMENT_WINDOW;
    const recent = this.bids.filter((b) => b.timestamp >= cutoff);

    if (recent.length === 0) {
      return 50;
    }

    const bidCount = recent.length;
    const windowSec = SENTIMENT_WINDOW / 1000;
    const freq = bidCount / windowSec;

    const freqScore = Math.min(1, freq / 1.5) * 100;

    let minP = Infinity;
    let maxP = -Infinity;
    for (let i = 0; i < recent.length; i++) {
      const p = recent[i].price;
      if (p < minP) minP = p;
      if (p > maxP) maxP = p;
    }
    const avgP = (minP + maxP) / 2 || 1;
    const volatility = avgP > 0 ? ((maxP - minP) / avgP) * 100 : 0;

    const volScore = Math.min(1, volatility / 15) * 100;

    const sentiment = 0.45 * freqScore + 0.55 * volScore;
    const smoothed = (this.sentimentIndex * 0.6) + (sentiment * 0.4);

    return Math.max(0, Math.min(100, Math.round(smoothed * 10) / 10));
  }

  refreshSentiment() {
    this.sentimentIndex = this._computeSentiment();
    return this.sentimentIndex;
  }

  getRegressionStats() {
    if (this.n < 2) {
      return null;
    }
    if (this.n <= MAX_BIDS_FOR_REGRESSION) {
      return {
        n: this.n,
        sumX: this.sumX,
        sumY: this.sumY,
        sumXY: this.sumXY,
        sumXX: this.sumXX,
        baseTime: this.baseTime,
      };
    }
    const step = Math.ceil(this.n / MAX_BIDS_FOR_REGRESSION);
    let sX = 0;
    let sY = 0;
    let sXY = 0;
    let sXX = 0;
    let count = 0;
    for (let i = 0; i < this.n; i += step) {
      const bid = this.bids[i];
      const x = this._getX(bid.timestamp);
      const y = bid.price;
      sX += x;
      sY += y;
      sXY += x * y;
      sXX += x * x;
      count += 1;
    }
    return {
      n: count,
      sumX: sX,
      sumY: sY,
      sumXY: sXY,
      sumXX: sXX,
      baseTime: this.baseTime,
    };
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
      sentimentIndex: this.sentimentIndex,
      basePrice: this.basePrice,
      recentBids: this.getRecentBids(),
      totalBids: this.bids.length,
    };
  }
}

module.exports = AuctionStore;
