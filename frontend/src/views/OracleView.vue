<!-- frontend/src/views/OracleView.vue -->
<!-- e-Agent-OS OpCenter — Oracle 档案中心 -->
<script setup>
import { onMounted } from 'vue';
import { useOracle } from '../composables/useOracle.js';
import ArchiveCard from '../components/onboarding/ArchiveCard.vue';
import ArchiveDetail from '../components/onboarding/ArchiveDetail.vue';

const {
  archives,
  selected,
  total,
  loading,
  error,
  activeSource,
  fetchArchives,
  selectArchive,
} = useOracle();

const SOURCES = [
  { key: '', label: '全部' },
  { key: 'avatar', label: 'Avatar 记忆' },
  { key: 'import', label: '导入档案' },
];

onMounted(() => {
  fetchArchives(activeSource.value);
});

function handleFilter(source) {
  fetchArchives(source);
}
</script>

<template>
  <div class="page">
    <!-- 页面头部 -->
    <div class="page-header">
      <div>
        <h1 class="page-title">档案中心</h1>
        <p class="page-sub">Avatar 长期记忆 · 共 {{ total }} 份档案</p>
      </div>
    </div>

    <!-- 左右分栏主体 -->
    <div class="oracle-body">
      <!-- 左面板：来源筛选 + 档案列表 -->
      <div class="left-panel">
        <!-- 来源筛选 -->
        <div class="filter-bar">
          <button
            v-for="src in SOURCES"
            :key="src.key"
            class="filter-btn"
            :class="{ active: activeSource === src.key }"
            @click="handleFilter(src.key)"
          >
            {{ src.label }}
          </button>
        </div>

        <!-- 加载状态 -->
        <div v-if="loading && archives.length === 0" class="list-loading">
          <div class="spinner"></div>
          <p>加载中…</p>
        </div>

        <!-- 空状态 -->
        <div v-else-if="archives.length === 0" class="list-empty">
          <p>暂无档案</p>
        </div>

        <!-- 错误状态 -->
        <div v-else-if="error" class="list-empty">
          <p>加载失败</p>
        </div>

        <!-- 档案卡片列表 -->
        <div v-else class="card-list">
          <ArchiveCard
            v-for="archive in archives"
            :key="archive.id"
            :archive="archive"
            :selected="selected && selected.id === archive.id"
            @select="selectArchive"
          />
        </div>
      </div>

      <!-- 右面板：档案详情 -->
      <div class="right-panel">
        <ArchiveDetail :archive="selected" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  max-width: 1400px;
  margin: 0 auto;
  padding: var(--space-xl) var(--space-lg);
  min-height: calc(100vh - 56px);
  display: flex;
  flex-direction: column;
}

.page-header {
  margin-bottom: var(--space-lg);
  flex-shrink: 0;
}

.page-title {
  font-family: var(--font-serif);
  font-size: 24px;
  font-weight: 400;
  color: var(--text-primary);
  margin: 0 0 4px;
}

.page-sub {
  font-size: 13px;
  color: var(--text-disabled);
  margin: 0;
}

/* 左右分栏 */
.oracle-body {
  display: flex;
  gap: var(--space-lg);
  flex: 1;
  min-height: 0;
  height: calc(100vh - 160px);
}

/* 左面板：固定 360px + 可滚动 */
.left-panel {
  width: 360px;
  flex-shrink: 0;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--bg-card);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* 筛选栏 */
.filter-bar {
  display: flex;
  gap: var(--space-xs);
  padding: var(--space-sm) var(--space-md);
  border-bottom: 1px solid var(--border-subtle);
  flex-shrink: 0;
}

.filter-btn {
  flex: 1;
  padding: 5px 8px;
  border-radius: 6px;
  border: 1px solid var(--border-subtle);
  background: var(--bg-card);
  font-size: 12px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.12s;
}

.filter-btn:hover {
  background: var(--bg-elevated);
  color: var(--text-primary);
}

.filter-btn.active {
  background: color-mix(in srgb, var(--accent-primary) 12%, transparent);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
  font-weight: 600;
}

/* 卡片列表 */
.card-list {
  overflow-y: auto;
  flex: 1;
}

/* 右面板：flex:1 + 可滚动 */
.right-panel {
  flex: 1;
  border: 1px solid var(--border-subtle);
  border-radius: 8px;
  background: var(--bg-card);
  overflow: hidden;
}

/* 列表内状态 */
.list-loading,
.list-empty {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
  color: var(--text-disabled);
  font-size: 13px;
}

.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-subtle);
  border-top-color: var(--accent-primary);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

.list-empty {
  text-align: center;
  padding: 40px;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .oracle-body {
    flex-direction: column;
    height: auto;
  }

  .left-panel {
    width: 100%;
    height: 400px;
  }
}
</style>
