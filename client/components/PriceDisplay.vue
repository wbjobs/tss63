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
  </div>
</template>

<script setup>
defineProps({
  currentPrice: { type: Number, default: 0 },
  predictedPrice: { type: Number, default: null },
});
</script>

<style scoped>
.price-display {
  display: flex;
  gap: 24px;
  justify-content: center;
  margin-bottom: 24px;
}

.price-card {
  background: #1e293b;
  border-radius: 12px;
  padding: 20px 32px;
  text-align: center;
  min-width: 200px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.price-card.current {
  border: 2px solid #3b82f6;
}

.price-card.predicted {
  border: 2px solid #f59e0b;
}

.label {
  display: block;
  font-size: 14px;
  color: #94a3b8;
  margin-bottom: 8px;
}

.value {
  display: block;
  font-size: 32px;
  font-weight: 700;
  color: #f1f5f9;
}

.price-card.current .value {
  color: #60a5fa;
}

.price-card.predicted .value {
  color: #fbbf24;
}
</style>
