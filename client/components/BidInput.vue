<template>
  <div class="bid-input">
    <div class="input-row">
      <input
        v-model.number="bidAmount"
        type="number"
        :min="currentPrice + 1"
        :placeholder="`最低 ¥${currentPrice + 1}`"
        class="bid-field"
        :disabled="submitting"
        @keyup.enter="submitBid"
      />
      <button class="bid-btn" @click="submitBid" :disabled="submitting">
        {{ submitting ? "出价中..." : "出价" }}
      </button>
    </div>
    <div class="quick-bids">
      <button
        v-for="increment in quickIncrements"
        :key="increment"
        class="quick-btn"
        :disabled="submitting"
        @click="bidAmount = currentPrice + increment"
      >
        +{{ increment }}
      </button>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  currentPrice: { type: Number, default: 0 },
  predictedPrice: { type: Number, default: null },
});

const emit = defineEmits(["bid"]);

const bidAmount = ref(props.currentPrice + 10);
const submitting = ref(false);

const quickIncrements = [5, 10, 50, 100];

watch(
  () => props.currentPrice,
  (newPrice) => {
    if (bidAmount.value <= newPrice) {
      bidAmount.value = newPrice + 10;
    }
  }
);

function submitBid() {
  if (submitting.value) return;
  if (!bidAmount.value || bidAmount.value <= props.currentPrice) return;

  if (props.predictedPrice !== null && bidAmount.value < props.predictedPrice) {
    const confirmed = window.confirm(
      `出价 ¥${bidAmount.value} 低于预测价格 ¥${props.predictedPrice}，出价可能偏低，确认提交吗？`
    );
    if (!confirmed) return;
  }

  submitting.value = true;
  emit("bid", bidAmount.value, (success, errMsg) => {
    submitting.value = false;
    if (!success && errMsg) {
      alert(errMsg);
    }
  });
}
</script>

<style scoped>
.bid-input {
  margin-bottom: 24px;
}

.input-row {
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
}

.bid-field {
  flex: 1;
  padding: 12px 16px;
  border-radius: 8px;
  border: 2px solid #334155;
  background: #1e293b;
  color: #f1f5f9;
  font-size: 18px;
  outline: none;
  transition: border-color 0.2s;
}

.bid-field:focus {
  border-color: #3b82f6;
}

.bid-field:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.bid-btn {
  padding: 12px 32px;
  border-radius: 8px;
  border: none;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.1s, opacity 0.2s;
}

.bid-btn:hover:not(:disabled) {
  transform: scale(1.02);
}

.bid-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.quick-bids {
  display: flex;
  gap: 8px;
}

.quick-btn {
  padding: 8px 16px;
  border-radius: 6px;
  border: 1px solid #475569;
  background: #0f172a;
  color: #94a3b8;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover:not(:disabled) {
  background: #1e293b;
  color: #e2e8f0;
  border-color: #3b82f6;
}

.quick-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
