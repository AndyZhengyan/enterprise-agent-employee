<!-- frontend/src/components/onboarding/ArchiveDetail.vue -->
<!-- e-Agent-OS OpCenter — Oracle Archive Detail -->
<script setup>
import { computed } from 'vue';
import { marked } from 'marked';

const props = defineProps({
  archive: {
    type: Object,
    default: null,
  },
});

function sourceLabel(source) {
  return source === 'avatar' ? 'Avatar 记忆' : '导入档案';
}

function formatTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

// Render markdown with marked, sanitize defaults
const renderedContent = computed(() => {
  if (!props.archive || !props.archive.content) return '';
  return marked(props.archive.content);
});
</script>

<template>
  <div class="detail-panel">
    <!-- 未选中状态 -->
    <div v-if="!archive" class="detail-empty">
      <div class="empty-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          <line x1="9" y1="8" x2="15" y2="8"/>
          <line x1="9" y1="12" x2="13" y2="12"/>
        </svg>
      </div>
      <p class="empty-text">选择一份档案查看内容</p>
    </div>

    <!-- 详情内容 -->
    <template v-else>
      <!-- 头部 -->
      <div class="detail-header">
        <span class="source-tag" :class="archive.source">
          {{ sourceLabel(archive.source) }}
        </span>
        <h2 class="detail-title">{{ archive.title }}</h2>
        <div class="detail-meta">
          <span class="meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            {{ archive.contributor }}
          </span>
          <span class="meta-item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10"/>
              <polyline points="12 6 12 12 16 14"/>
            </svg>
            {{ formatTime(archive.createdAt) }}
          </span>
        </div>

        <!-- 标签 -->
        <div v-if="archive.tags && archive.tags.length > 0" class="detail-tags">
          <span v-for="tag in archive.tags" :key="tag" class="tag">{{ tag }}</span>
        </div>
      </div>

      <!-- Markdown 内容 -->
      <div class="detail-content markdown-body" v-html="renderedContent"></div>
    </template>
  </div>
</template>

<style scoped>
.detail-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.detail-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-md);
  color: var(--text-disabled);
}

.empty-icon {
  opacity: 0.4;
}

.empty-text {
  font-size: 14px;
  margin: 0;
}

.detail-header {
  padding: var(--space-lg) var(--space-lg) var(--space-md);
  flex-shrink: 0;
  border-bottom: 1px solid var(--border-subtle);
}

.source-tag {
  display: inline-flex;
  align-items: center;
  padding: 2px 10px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: var(--space-sm);
}

.source-tag.avatar {
  background: color-mix(in srgb, #1976D2 12%, transparent);
  color: #1976D2;
}

.source-tag.import {
  background: color-mix(in srgb, #388E3C 12%, transparent);
  color: #388E3C;
}

.detail-title {
  font-family: var(--font-serif);
  font-size: 20px;
  font-weight: 400;
  color: var(--text-primary);
  margin: 0 0 var(--space-sm);
  line-height: 1.4;
}

.detail-meta {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-bottom: var(--space-sm);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  color: var(--text-disabled);
  font-family: var(--font-mono);
}

.detail-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.tag {
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  font-size: 12px;
  color: var(--text-disabled);
}

/* Markdown body styles */
.detail-content {
  flex: 1;
  overflow-y: auto;
  padding: var(--space-lg);
}

.markdown-body {
  font-size: 14px;
  line-height: 1.7;
  color: var(--text-primary);
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3) {
  font-family: var(--font-serif);
  font-weight: 400;
  color: var(--text-primary);
  margin-top: var(--space-lg);
  margin-bottom: var(--space-sm);
}

.markdown-body :deep(h1) { font-size: 20px; }
.markdown-body :deep(h2) { font-size: 17px; }
.markdown-body :deep(h3) { font-size: 15px; }

.markdown-body :deep(p) {
  margin: 0 0 var(--space-md);
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  padding-left: var(--space-lg);
  margin: 0 0 var(--space-md);
}

.markdown-body :deep(li) {
  margin-bottom: 4px;
}

.markdown-body :deep(code) {
  font-family: var(--font-mono);
  font-size: 12px;
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 4px;
  padding: 1px 5px;
  color: var(--accent-primary);
}

.markdown-body :deep(pre) {
  background: var(--bg-elevated);
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  padding: var(--space-md);
  overflow-x: auto;
  margin: 0 0 var(--space-md);
}

.markdown-body :deep(pre code) {
  background: none;
  border: none;
  padding: 0;
  color: var(--text-primary);
  font-size: 12px;
  line-height: 1.6;
}

.markdown-body :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 0 0 var(--space-md);
  font-size: 13px;
}

.markdown-body :deep(th) {
  background: var(--bg-elevated);
  font-size: 12px;
  font-weight: 600;
  color: var(--text-secondary);
  text-align: left;
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--border-subtle);
}

.markdown-body :deep(td) {
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--border-subtle);
  color: var(--text-primary);
}

.markdown-body :deep(blockquote) {
  border-left: 3px solid var(--accent-primary);
  margin: 0 0 var(--space-md);
  padding: var(--space-sm) var(--space-md);
  background: color-mix(in srgb, var(--accent-primary) 6%, transparent);
  border-radius: 0 6px 6px 0;
  color: var(--text-secondary);
}

.markdown-body :deep(hr) {
  border: none;
  border-top: 1px solid var(--border-subtle);
  margin: var(--space-lg) 0;
}

.markdown-body :deep(input[type="checkbox"]) {
  margin-right: 6px;
  accent-color: var(--accent-primary);
}

.markdown-body :deep(a) {
  color: var(--accent-primary);
  text-decoration: none;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}
</style>
