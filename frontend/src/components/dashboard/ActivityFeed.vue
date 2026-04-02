<!-- frontend/src/components/dashboard/ActivityFeed.vue -->
<!-- e-Agent-OS OpCenter — Activity Feed Timeline -->
<script setup>
const props = defineProps({
  items: { type: Array, default: () => [] },
});

const TYPE_CONFIG = {
  task_completed:   { icon: '✓', color: 'var(--success)' },
  task_failed:      { icon: '✗', color: 'var(--danger)' },
  shadow_pass:      { icon: '★', color: 'var(--warning)' },
  employee_joined:  { icon: '↑', color: 'var(--info)' },
  status_changed:   { icon: '⟳', color: 'var(--text-secondary)' },
};

function relativeTime(iso) {
  if (!iso) return '';
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return '刚刚';
  if (m < 60) return `${m}分钟前`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}小时前`;
  return `${Math.floor(h / 24)}天前`;
}
</script>

<template>
  <div class="activity-feed card">
    <h3 class="feed-title">最近动态</h3>
    <ul class="feed-list">
      <li v-for="item in items" :key="item.id" class="feed-item">
        <span
          class="feed-icon"
          :style="{ color: TYPE_CONFIG[item.type]?.color ?? 'var(--text-secondary)' }"
        >
          {{ TYPE_CONFIG[item.type]?.icon ?? '•' }}
        </span>
        <div class="feed-body">
          <span class="feed-name">{{ item.employeeName }}</span>
          <span class="feed-content">{{ item.content }}</span>
        </div>
        <span class="feed-time">{{ relativeTime(item.timestamp) }}</span>
      </li>
      <li v-if="!items.length" class="feed-empty">暂无动态</li>
    </ul>
  </div>
</template>

<style scoped>
.activity-feed { padding: var(--space-lg); }
.feed-title {
  font-family: var(--font-serif);
  font-size: 18px;
  font-weight: 500;
  margin-bottom: var(--space-lg);
  color: var(--text-primary);
}
.feed-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}
.feed-item {
  display: flex;
  align-items: flex-start;
  gap: var(--space-md);
}
.feed-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--bg-elevated);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
  margin-top: 2px;
}
.feed-body {
  flex: 1;
  font-size: 14px;
  line-height: 1.5;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.feed-name { font-weight: 500; color: var(--text-primary); }
.feed-content { color: var(--text-secondary); }
.feed-time {
  font-size: 12px;
  color: var(--text-disabled);
  white-space: nowrap;
  margin-top: 3px;
}
.feed-empty {
  font-size: 14px;
  color: var(--text-disabled);
  text-align: center;
  padding: var(--space-xl);
}
</style>
