<!-- frontend/src/components/dashboard/TaskTrend.vue -->
<!-- e-Agent-OS OpCenter — Task Completion Trend Line Chart -->
<script setup>
import { ref, onMounted, watch } from 'vue';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from 'chart.js';

Chart.register(LineController, LineElement, PointElement, CategoryScale, LinearScale, Tooltip);

const props = defineProps({
  data: { type: Array, default: () => [] }, // [{ date, value }]
});

const canvas = ref(null);
let chart = null;

function renderChart() {
  if (!canvas.value) return;
  if (chart) { chart.destroy(); chart = null; }
  chart = new Chart(canvas.value, {
    type: 'line',
    data: {
      labels: props.data.map(d => d.date),
      datasets: [{
        data: props.data.map(d => d.value),
        borderColor: 'var(--status-active)',
        backgroundColor: 'rgba(74, 124, 89, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: 'var(--status-active)',
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: (ctx) => ` ${ctx.raw} 任务` } },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: 'var(--text-secondary)', font: { size: 11 } },
        },
        y: {
          grid: { color: 'var(--border-subtle)' },
          ticks: {
            color: 'var(--text-secondary)',
            font: { family: 'JetBrains Mono', size: 11 },
          },
        },
      },
    },
  });
}

onMounted(() => { renderChart(); });
watch(() => props.data, () => { renderChart(); });
</script>

<template>
  <div class="chart-card card">
    <h3 class="chart-title">近7天任务完成趋势</h3>
    <div class="chart-wrap">
      <canvas ref="canvas"></canvas>
    </div>
  </div>
</template>

<style scoped>
.chart-card { padding: var(--space-lg); }
.chart-title {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 500;
  margin-bottom: var(--space-lg);
  color: var(--text-primary);
}
.chart-wrap { height: 180px; position: relative; }
</style>
