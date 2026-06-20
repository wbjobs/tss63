const BOT_CONFIGS = [
  {
    id: "bot-1",
    name: "🤖 竞价先锋",
    strategy: "follow",
    minInterval: 8000,
    maxInterval: 20000,
    minMarkup: 3,
    maxMarkup: 15,
    aggression: 0.7,
    active: true,
  },
  {
    id: "bot-2",
    name: "🤖 理性炒家",
    strategy: "average",
    minInterval: 12000,
    maxInterval: 30000,
    minMarkup: 5,
    maxMarkup: 20,
    aggression: 0.5,
    active: true,
  },
  {
    id: "bot-3",
    name: "🤖 土豪玩家",
    strategy: "aggressive",
    minInterval: 6000,
    maxInterval: 15000,
    minMarkup: 10,
    maxMarkup: 50,
    aggression: 0.9,
    active: false,
  },
];

class AuctionBot {
  constructor(config, { store, onBid }) {
    this.config = config;
    this.store = store;
    this.onBid = onBid;
    this.timer = null;
    this.running = false;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this._scheduleNext();
    console.log(`[Bot] ${this.config.name} 启动，策略：${this.config.strategy}`);
  }

  stop() {
    this.running = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    console.log(`[Bot] ${this.config.name} 停止`);
  }

  setActive(active) {
    this.config.active = active;
    if (active && !this.running) this.start();
    if (!active && this.running) this.stop();
  }

  _scheduleNext() {
    if (!this.running) return;
    const delay =
      this.config.minInterval +
      Math.random() * (this.config.maxInterval - this.config.minInterval);
    this.timer = setTimeout(() => {
      this._tryBid();
      this._scheduleNext();
    }, delay);
  }

  _tryBid() {
    if (!this.running || !this.config.active) return;

    const proposedPrice = this._computeBid();
    if (proposedPrice === null) return;

    if (proposedPrice <= this.store.currentPrice) {
      return;
    }

    if (!this.store.canUserBid(this.config.id)) return;

    const bid = this.store.addBid(this.config.id, this.config.name, proposedPrice);
    if (bid && this.onBid) {
      this.onBid(bid);
    }
  }

  _computeBid() {
    const current = this.store.currentPrice;
    const bids = this.store.bids;
    const markupBase =
      this.config.minMarkup +
      Math.random() * (this.config.maxMarkup - this.config.minMarkup);
    const markup = Math.round(markupBase);

    switch (this.config.strategy) {
      case "follow":
        return current + markup;

      case "average": {
        if (bids.length < 3) return current + markup;
        const recentN = bids.slice(-Math.min(10, bids.length));
        let sum = 0;
        for (let i = 0; i < recentN.length; i++) sum += recentN[i].price;
        const avg = sum / recentN.length;
        return Math.max(current + markup, Math.round(avg * 1.02 + markup * 0.5));
      }

      case "aggressive": {
        const bonus = Math.random() < this.config.aggression ? markup * 2 : markup;
        const predicted = this.store.predictedPrice;
        if (predicted && predicted > current) {
          return Math.round(Math.max(current + bonus, predicted + markup * 0.3));
        }
        return current + bonus;
      }

      default:
        return current + markup;
    }
  }

  getStatus() {
    return {
      id: this.config.id,
      name: this.config.name,
      strategy: this.config.strategy,
      active: this.config.active,
      running: this.running,
    };
  }
}

class BotManager {
  constructor(store) {
    this.store = store;
    this.bots = BOT_CONFIGS.map((cfg) => new AuctionBot(cfg, { store }));
  }

  setOnBidHandler(onBid) {
    this.bots.forEach((bot) => (bot.onBid = onBid));
  }

  startAll() {
    this.bots.forEach((bot) => {
      if (bot.config.active) bot.start();
    });
  }

  stopAll() {
    this.bots.forEach((bot) => bot.stop());
  }

  setBotActive(botId, active) {
    const bot = this.bots.find((b) => b.config.id === botId);
    if (bot) bot.setActive(active);
  }

  setActiveCount(count) {
    const n = Math.max(0, Math.min(3, count));
    this.bots.forEach((bot, idx) => {
      bot.setActive(idx < n);
    });
  }

  getStatusList() {
    return this.bots.map((b) => b.getStatus());
  }
}

module.exports = { BotManager, BOT_CONFIGS };
