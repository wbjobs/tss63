<template>
  <div class="price-chart">
    <h3 class="chart-title">价格走势图</h3>
    <div class="chart-container">
      <Line
        :data="chartData"
        :options="chartOptions"
      />
    </div>
  </div>
</template>

<script setup>
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Legend,
  Filler,
} from "chart.js";
import { Line } from "vue-chartjs";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Legend,
  Filler
);

const props = defineProps({
  actualPrices: { type: Array, default: () => [] },
  predictedPrices: { type: Array, default: () => [] },
  labels: { type: Array, default: () => [] },
});

const chartData = computed(() => ({
  labels: [...props.labels],
  datasets: [
    {
      label: "实际价格",
      data: [...props.actualPrices],
      borderColor: "#3b82f6",
      backgroundColor: "rgba(59, 130, 246, 0.1)",
      borderWidth: 2,
      pointRadius: 4,
      pointBackgroundColor: "#3b82f6",
      fill: true,
      tension: 0.3,
    },
    {
      label: "预测价格",
      data: [...props.predictedPrices],
      borderColor: "#f59e0b",
      backgroundColor: "rgba(245, 158, 11, 0.05)",
      borderWidth: 2,
      borderDash: [6, 4],
      pointRadius: 3,
      pointBackgroundColor: "#f59e0b",
      fill: false,
      tension: 0.3,
    },
  ],
}));

const chartOptions = Object.freeze({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 300 },
  plugins: {
    legend: {
      labels: { color: "#94a3b8", font: { size: 13 } },
    },
  },
  scales: {
    x: {
      ticks: { color: "#64748b", maxTicksLimit: 10 },
      grid: { color: "rgba(51, 65, 85, 0.5)" },
    },
    y: {
      ticks: { color: "#64748b" },
      grid: { color: "rgba(51, 65, 85, 0.5)" },
    },
  },
});
</script>

<style scoped>
.price-chart {
  background: #1e293b;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.chart-title {
  margin: 0 0 16px;
  font-size: 16px;
  color: #e2e8f0;
}

.chart-container {
  position: relative;
  height: 300px;
}
</style>
