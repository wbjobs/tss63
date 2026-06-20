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
  sentiments: { type: Array, default: () => [] },
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
      pointRadius: 3,
      pointBackgroundColor: "#3b82f6",
      fill: true,
      tension: 0.3,
      yAxisID: "y",
    },
    {
      label: "预测价格",
      data: [...props.predictedPrices],
      borderColor: "#f59e0b",
      backgroundColor: "rgba(245, 158, 11, 0.05)",
      borderWidth: 2,
      borderDash: [6, 4],
      pointRadius: 2,
      pointBackgroundColor: "#f59e0b",
      fill: false,
      tension: 0.3,
      yAxisID: "y",
    },
    {
      label: "市场情绪指数",
      data: [...props.sentiments],
      borderColor: "#ef4444",
      backgroundColor: "rgba(239, 68, 68, 0.05)",
      borderWidth: 2,
      borderDash: [3, 3],
      pointRadius: 2,
      pointBackgroundColor: "#ef4444",
      fill: false,
      tension: 0.35,
      yAxisID: "y1",
    },
  ],
}));

const chartOptions = Object.freeze({
  responsive: true,
  maintainAspectRatio: false,
  animation: { duration: 300 },
  interaction: {
    mode: "index",
    intersect: false,
  },
  plugins: {
    legend: {
      labels: { color: "#94a3b8", font: { size: 13 } },
    },
    tooltip: {
      backgroundColor: "rgba(15, 23, 42, 0.95)",
      titleColor: "#e2e8f0",
      bodyColor: "#cbd5e1",
      borderColor: "#334155",
      borderWidth: 1,
    },
  },
  scales: {
    x: {
      ticks: { color: "#64748b", maxTicksLimit: 10 },
      grid: { color: "rgba(51, 65, 85, 0.5)" },
    },
    y: {
      type: "linear",
      display: true,
      position: "left",
      title: { display: true, text: "价格 (¥)", color: "#60a5fa" },
      ticks: { color: "#64748b" },
      grid: { color: "rgba(51, 65, 85, 0.5)" },
    },
    y1: {
      type: "linear",
      display: true,
      position: "right",
      min: 0,
      max: 100,
      title: { display: true, text: "情绪 (0-100)", color: "#f87171" },
      ticks: { color: "#64748b" },
      grid: { drawOnChartArea: false },
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
  height: 320px;
}
</style>
