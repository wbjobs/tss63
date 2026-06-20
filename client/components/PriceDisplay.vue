<template>
  <div class="price-display">
    <div class="price-card current">
      <span class="label">当前价格</span>
      <span class="value">¥{{ currentPrice }}</span>
    </div>
    <div class="price-card predicted" v-if="predictedPrice !== null">
      <span class="label">预测价格</span>
      <span class="value">¥{{ predictedPrice }}</span>
    </div>
    <div
      class="price-card sentiment"
      :class="sentimentClass"
      v-if="sentimentIndex !== null"
    >
      <span class="label">市场情绪 {{ sentimentEmoji }}</span>
      <span class="value">{{ sentimentLabel }}</span>
      <div class="bar-track">
        <div class="bar-fill" :style="{ width: `${sentimentIndex}%` }"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  currentPrice: { type: Number, default: 0 },
  predictedPrice: { type: Number, default: null },
  sentimentIndex: { type: Number, default: null },
});

const sentimentClass = computed(() => {
  const s = props.sentimentIndex ?? 50;
  if (s < 30) return "cold";
  if (s < 55) return "neutral";
  if (s < 75) return "warm";
  return "hot";
});

const sentimentLabel = computed(() => {
  return `${Math.round(props.sentimentIndex ?? 50)}`;
});

const sentimentEmoji = computed(() => {
  const s = props.sentimentIndex ?? 50;
  if (s < 30) return "🥶 冷淡";
  if (s < 55) return "😐 观望";
  if (s < 75) return "🔥 活跃";
  return "🚀 狂热";
});
</script>

<style scoped>
.price-display {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.price-card {
  background: #1e293b;
  border-radius: 12px;
  padding: 20px 28px;
  text-align: center;
  min-width: 180px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  transition: all 0.3s;
}

.price-card.current {
  border: 2px solid #3b82f6;
}

.price-card.predicted {
  border: 2px solid #f59e0b;
}

.price-card.sentiment {
  border: 2px solid;
}

.price-card.sentiment.cold {
  border-color: #06b6d4;
}
.price-card.sentiment.neutral {
  border-color: #64748b;
}
.price-card.sentiment.warm {
  border-color: #f97316;
}
.price-card.sentiment.hot {
  border-color: #ef4444;
  box-shadow: 0 0 20px rgba(239, 68, 68, 0.25);
}

.label {
  display: block;
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.value {
  display: block;
  font-size: 30px;
  font-weight: 700;
  color: #f1f5f9;
}

.price-card.current .value {
  color: #60a5fa;
}

.price-card.predicted .value {
  color: #fbbf24;
}

.price-card.sentiment.cold .value {
  color: #22d3ee;
}
.price-card.sentiment.neutral .value {
  color: #cbd5e1;
}
.price-card.sentiment.warm .value {
  color: #fb923c;
}
.price-card.sentiment.hot .value {
  color: #f87171;
}

.bar-track {
  margin-top: 10px;
  height: 6px;
  background: #0f172a;
  border-radius: 3px;
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #06b6d4, #f59e0b, #ef4444);
  border-radius: 3px;
  transition: width 0.5s ease;
}
</style>
