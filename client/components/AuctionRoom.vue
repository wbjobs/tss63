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
    />

    <PriceChart
      :actualPrices="state.chartActualPrices"
      :predictedPrices="state.chartPredictedPrices"
      :labels="state.chartLabels"
    />

    <BidInput
      :currentPrice="state.currentPrice"
      :predictedPrice="state.predictedPrice"
      @bid="handleBid"
    />

    <div class="bid-history">
      <h3 class="history-title">出价记录</h3>
      <ul class="history-list">
        <li
          v-for="(bid, idx) in [...state.recentBids].reverse()"
          :key="idx"
          class="history-item"
        >
          <span class="bid-user">{{ bid.userName }}</span>
          <span class="bid-price">¥{{ bid.price }}</span>
          <span class="bid-time">{{ formatTime(bid.timestamp) }}</span>
        </li>
      </ul>
      <p v-if="state.recentBids.length === 0" class="empty-hint">暂无出价记录</p>
    </div>
  </div>
</template>

<script setup lang="ts">
const { state, submitBid } = useAuction();

function formatTime(ts: number) {
  const d = new Date(ts);
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

function handleBid(price: number) {
  submitBid(price);
}
</script>

<style scoped>
.auction-room {
  max-width: 800px;
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
  max-height: 240px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  border-bottom: 1px solid #334155;
}

.history-item:last-child {
  border-bottom: none;
}

.bid-user {
  color: #60a5fa;
  font-weight: 500;
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
