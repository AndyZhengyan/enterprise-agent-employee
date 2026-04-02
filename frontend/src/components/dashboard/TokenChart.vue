<!-- frontend/src/components/dashboard/TokenChart.vue -->
<!-- e-Agent-OS OpCenter — Token Consumption Bar Chart -->
<script setup>
import { ref, onMounted, watch } from 'vue';
import {
  Chart,
  BarController,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
} from 'chart.js';

Chart.register(BarController, BarElement, CategoryScale, LinearScale, Tooltip);

const props = defineProps({
  data: { type: Array, default: () => [] }, // [{ date, value }]
});

const canvas = ref(null);
let chart = null;

function formatTick(v) {
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}K`;
  return v;
}

function renderChart() {
  if (!canvas.value) return;
  if (chart) { chart.destroy(); chart = null; }
  chart = new Chart(canvas.value, {
    type: 'bar',
    data: {
      labels: props.data.map(d => d.date),
      datasets: [{
        data: props.data.map(d => d.value),
        backgroundColor: 'rgba(45, 91, 123, 0.7)',
        borderRadius: 4,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${formatTick(ctx.raw)} Token`,
          },
        },
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
            callback: (v) => formatTick(v),
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
    <h3 class="chart-title">近7天 Token 消耗</h3>
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
