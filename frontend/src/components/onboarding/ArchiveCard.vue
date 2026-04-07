<!-- frontend/src/components/onboarding/ArchiveCard.vue -->
<!-- e-Agent-OS OpCenter — Oracle Archive Card -->
<script setup>
const props = defineProps({
  archive: {
    type: Object,
    required: true,
  },
  selected: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['select']);

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  });
}

function sourceLabel(source) {
  if (source === 'avatar') return 'Avatar 记忆';
  if (source === 'import') return '导入档案';
  return '未知来源';
}
</script>

<template>
  <div
    class="archive-card"
    :class="{ selected }"
    @click="emit('select', archive)"
    role="button"
    :aria-selected="selected"
  >
    <!-- 卡片头部：来源标签 -->
    <div class="card-header">
      <span class="source-tag" :class="archive.source">
        {{ sourceLabel(archive.source) }}
      </span>
    </div>

    <!-- 标题 -->
    <div class="card-title">{{ archive.title }}</div>

    <!-- 贡献者 + 时间 -->
    <div class="card-meta">
      <span class="card-contributor">{{ archive.contributor }}</span>
      <span class="card-sep">·</span>
      <span class="card-date">{{ formatDate(archive.createdAt) }}</span>
    </div>

    <!-- 摘要 -->
    <div class="card-summary">{{ archive.summary }}</div>

    <!-- 标签 -->
    <div v-if="archive.tags && archive.tags.length > 0" class="card-tags">
      <span v-for="tag in archive.tags" :key="tag" class="tag">{{ tag }}</span>
    </div>
  </div>
</template>

<style scoped>
.archive-card {
  padding: var(--space-md);
  border-bottom: 1px solid var(--border-subtle);
  cursor: pointer;
  transition: background-color 0.12s;
  border-left: 3px solid transparent;
  background: var(--bg-card);
}

.archive-card:hover {
  background: var(--bg-elevated);
}

.archive-card.selected {
  background: var(--bg-elevated);
  border-left-color: var(--accent-primary);
}

.card-header {
  margin-bottom: 6px;
}

.source-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
}

.source-tag.avatar {
  background: color-mix(in srgb, #1976D2 15%, transparent);
  color: #1976D2;
}

.source-tag.import {
  background: color-mix(in srgb, #388E3C 15%, transparent);
  color: #388E3C;
}

.card-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
  line-height: 1.4;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-bottom: 6px;
}

.card-contributor {
  font-size: 12px;
  color: var(--text-secondary);
}

.card-sep {
  color: var(--text-disabled);
  font-size: 12px;
}

.card-date {
  font-size: 12px;
  color: var(--text-disabled);
  font-family: var(--font-mono);
}

.card-summary {
  font-size: 12px;
  color: var(--text-secondary);
  line-height: 1.5;
  margin-bottom: 8px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  padding: 1px 6px;
  border-radius: 6px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  font-size: 11px;
  color: var(--text-disabled);
}
</style>
