<template>
  <div class="auction-room">
    <header class="room-header">
      <h1 class="room-title">🔨 实时竞拍房间</h1>
      <div class="room-info">
        <span class="item-name">{{ state.itemName }}</span>
        <span class="user-count">{{ state.userCount }} 人在线</span>
      </div>
    </header>

    <PriceDisplay
      :currentPrice="state.currentPrice"
      :predictedPrice="state.predictedPrice"
      :sentimentIndex="state.sentimentIndex"
    />

    <PriceChart
      :actualPrices="state.chartActualPrices"
      :predictedPrices="state.chartPredictedPrices"
      :sentiments="state.chartSentiments"
      :labels="state.chartLabels"
    />

    <BidInput
      :currentPrice="state.currentPrice"
      :predictedPrice="state.predictedPrice"
      @bid="handleBid"
    />

    <div class="bot-panel" v-if="state.bots.length > 0">
      <div class="panel-header">
        <h3 class="panel-title">🤖 机器人管理员</h3>
        <span class="panel-hint">管理员开关自动出价机器人</span>
      </div>
      <div class="bot-grid">
        <div
          v-for="bot in state.bots"
          :key="bot.id"
          class="bot-card"
          :class="{ active: bot.active }"
        >
          <div class="bot-name">{{ bot.name }}</div>
          <div class="bot-meta">
            <span class="bot-strategy">策略：{{ strategyLabel(bot.strategy) }}</span>
            <span class="bot-status">{{ bot.active ? "运行中" : "已停止" }}</span>
          </div>
          <button
            class="bot-toggle"
            :class="{ on: bot.active }"
            @click="toggleBot(bot.id, !bot.active)"
          >
            {{ bot.active ? "关闭" : "开启" }}
          </button>
        </div>
      </div>
    </div>

    <div class="bid-history">
      <h3 class="history-title">出价记录</h3>
      <ul class="history-list">
        <li
          v-for="(bid, idx) in [...state.recentBids].reverse()"
          :key="idx"
          class="history-item"
          :class="{ bot: bid.isBot }"
        >
          <span class="bid-user">
            {{ bid.userName }}
            <span v-if="bid.isBot" class="bot-tag">BOT</span>
          </span>
          <span class="bid-price">¥{{ bid.price }}</span>
          <span class="bid-time">{{ formatTime(bid.timestamp) }}</span>
        </li>
      </ul>
      <p v-if="state.recentBids.length === 0" class="empty-hint">暂无出价记录</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { state, submitBid, toggleBot } = useAuction();

function formatTime(ts: number) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

function strategyLabel(s: string) {
  switch (s) {
    case "follow":
      return "跟随最高价";
    case "average":
      return "基于均价";
    case "aggressive":
      return "激进加价";
    default:
      return s;
  }
}

function handleBid(price: number, onResult?: (success: boolean, err?: string) => void) {
  submitBid(price, onResult);
}
</script>

<style scoped>
.auction-room {
  max-width: 860px;
  margin: 0 auto;
  padding: 32px 20px;
  min-height: 100vh;
}

.room-header {
  text-align: center;
  margin-bottom: 32px;
}

.room-title {
  font-size: 28px;
  color: #f1f5f9;
  margin: 0 0 8px;
}

.room-info {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
}

.item-name {
  font-size: 16px;
  color: #94a3b8;
}

.user-count {
  font-size: 14px;
  color: #22c55e;
  background: rgba(34, 197, 94, 0.1);
  padding: 4px 12px;
  border-radius: 12px;
}

.bot-panel {
  background: #1e293b;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  border: 1px solid #334155;
}

.panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.panel-title {
  margin: 0;
  font-size: 16px;
  color: #e2e8f0;
}

.panel-hint {
  font-size: 12px;
  color: #64748b;
}

.bot-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
}

.bot-card {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 10px;
  padding: 14px;
  transition: all 0.2s;
}

.bot-card.active {
  border-color: #a855f7;
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.1), #0f172a);
}

.bot-name {
  font-size: 15px;
  font-weight: 600;
  color: #e2e8f0;
  margin-bottom: 6px;
}

.bot-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  font-size: 12px;
}

.bot-strategy {
  color: #94a3b8;
}

.bot-status {
  color: #ef4444;
}

.bot-card.active .bot-status {
  color: #22c55e;
}

.bot-toggle {
  width: 100%;
  padding: 6px 10px;
  border: none;
  border-radius: 6px;
  background: #334155;
  color: #cbd5e1;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.bot-toggle:hover {
  background: #475569;
}

.bot-toggle.on {
  background: linear-gradient(135deg, #7c3aed, #a855f7);
  color: white;
}

.bid-history {
  background: #1e293b;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.history-title {
  margin: 0 0 12px;
  font-size: 16px;
  color: #e2e8f0;
}

.history-list {
  list-style: none;
  padding: 0;
  margin: 0;
  max-height: 280px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #334155;
}

.history-item.bot {
  background: rgba(168, 85, 247, 0.05);
}

.history-item:last-child {
  border-bottom: none;
}

.bid-user {
  color: #60a5fa;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
}

.bot-tag {
  font-size: 10px;
  padding: 1px 6px;
  border-radius: 4px;
  background: #7c3aed;
  color: white;
  font-weight: 700;
}

.history-item.bot .bid-user {
  color: #c084fc;
}

.bid-price {
  color: #fbbf24;
  font-weight: 700;
  font-size: 16px;
}

.bid-time {
  color: #64748b;
  font-size: 13px;
}

.empty-hint {
  text-align: center;
  color: #64748b;
  padding: 20px 0;
}
</style>
