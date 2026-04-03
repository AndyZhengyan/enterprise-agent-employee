<!-- frontend/src/components/onboarding/AvatarCard.vue -->
<!-- e-Agent-OS OpCenter — 单个 Blueprint 卡片，含版本列表 -->
<script setup>
const props = defineProps({
  blueprint: { type: Object, required: true },
});

const emit = defineEmits(['deploy-version']);

const STATUS_LABEL = {
  published: '正式上岗',
  testing: '试用期',
  staging: '灰度中',
  draft: '草稿',
  deprecated: '退役',
};

const STATUS_COLOR = {
  published: 'var(--success)',
  testing: 'var(--warning)',
  staging: 'var(--accent-primary)',
  draft: 'var(--text-disabled)',
  deprecated: 'var(--text-disabled)',
};

const DEPLOYED_STATUS_COLOR = {
  published: 'var(--success)',
  testing: 'var(--warning)',
  staging: 'var(--accent-primary)',
  draft: 'var(--text-disabled)',
  deprecated: 'var(--text-disabled)',
};

function capacityColor(pct) {
  if (pct >= 80) return 'var(--danger)';
  if (pct >= 60) return 'var(--warning)';
  return 'var(--success)';
}

function totalReplicas(bp) {
  return bp.versions.reduce((s, v) => s + v.replicas, 0);
}
function loadPct(bp) {
  const total = totalReplicas(bp);
  return bp.capacity.max > 0 ? Math.round((total / bp.capacity.max) * 100) : 0;
}
</script>

<template>
  <div class="avatar-card">
    <!-- 卡片头部 -->
    <div class="card-header">
      <div class="card-title">
        <span class="role-name">{{ blueprint.role }}</span>
        <span class="role-alias">{{ blueprint.alias }}</span>
      </div>
      <div class="card-dept">{{ blueprint.department }}</div>
    </div>

    <!-- 版本列表 -->
    <div class="version-list">
      <div
        v-for="v in blueprint.versions"
        :key="v.version"
        class="version-row"
        :class="{ 'version-row--offline': v.traffic === 0 }"
      >
        <span class="v-tag">{{ v.version }}</span>
        <span
          class="v-status-dot"
          :style="{ background: STATUS_COLOR[v.status] }"
        ></span>
        <span class="v-status-label">{{ STATUS_LABEL[v.status] }}</span>
        <span class="v-replicas">{{ v.replicas }}分身</span>
        <span class="v-traffic" v-if="v.traffic > 0">{{ v.traffic }}%</span>
        <span class="v-traffic v-traffic--zero" v-else>—</span>
        <button class="v-btn">调流</button>
        <button class="v-btn v-btn--danger" v-if="v.status !== 'deprecated'">下线</button>
      </div>
    </div>

    <!-- 底部：容量条 + 部署按钮 -->
    <div class="card-footer">
      <div class="capacity-row">
        <span class="capacity-label">容量</span>
        <span class="capacity-numbers">
          {{ totalReplicas(blueprint) }}/{{ blueprint.capacity.max }}
        </span>
        <div class="capacity-track">
          <div
            class="capacity-fill"
            :style="{
              width: `${loadPct(blueprint)}%,
              background: ${capacityColor(loadPct(blueprint))}`
            }"
          ></div>
        </div>
        <span
          v-if="loadPct(blueprint) >= 80"
          class="capacity-warn"
          title="接近容量上限"
        >⚠️</span>
        <span class="capacity-pct">{{ loadPct(blueprint) }}%</span>
      </div>
      <button class="btn-deploy" @click="$emit('deploy-version', blueprint)">
        + 部署新版本
      </button>
    </div>
  </div>
</template>

<style scoped>
.avatar-card {
  background: var(--bg-card);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-subtle);
  padding: 16px 18px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.card-header {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.role-name {
  font-family: var(--font-serif);
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
}

.role-alias {
  font-size: 12px;
  color: var(--text-secondary);
}

.card-dept {
  font-size: 11px;
  color: var(--text-disabled);
  margin-left: auto;
}

/* 版本列表 */
.version-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px 0;
  border-top: 1px solid var(--border-subtle);
  border-bottom: 1px solid var(--border-subtle);
}

.version-row {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.version-row--offline {
  opacity: 0.5;
}

.v-tag {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-secondary);
  min-width: 60px;
}

.v-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  flex-shrink: 0;
}

.v-status-label {
  font-size: 11px;
  color: var(--text-secondary);
  min-width: 44px;
}

.v-replicas {
  font-size: 11px;
  color: var(--text-secondary);
  min-width: 36px;
}

.v-traffic {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-primary);
  min-width: 28px;
  text-align: right;
}
.v-traffic--zero {
  color: var(--text-disabled);
}

.v-btn {
  font-size: 11px;
  color: var(--text-secondary);
  background: none;
  border: none;
  padding: 2px 4px;
  cursor: pointer;
  border-radius: 3px;
  transition: color 120ms, background 120ms;
  margin-left: auto;
}
.v-btn:hover {
  color: var(--text-primary);
  background: var(--bg-elevated);
}
.v-btn--danger:hover {
  color: var(--danger);
  background: rgba(184, 74, 60, 0.06);
}

/* 容量条 */
.card-footer {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.capacity-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.capacity-label {
  font-size: 11px;
  color: var(--text-disabled);
  min-width: 24px;
}

.capacity-numbers {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-secondary);
  min-width: 36px;
}

.capacity-track {
  flex: 1;
  height: 3px;
  background: var(--bg-elevated);
  border-radius: 2px;
  overflow: hidden;
}

.capacity-fill {
  height: 100%;
  border-radius: 2px;
  transition: width 400ms ease;
}

.capacity-warn {
  font-size: 11px;
}

.capacity-pct {
  font-family: var(--font-mono);
  font-size: 11px;
  color: var(--text-secondary);
  min-width: 28px;
  text-align: right;
}

.btn-deploy {
  width: 100%;
  padding: 7px 0;
  font-size: 12px;
  font-weight: 500;
  color: var(--accent-primary);
  background: transparent;
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background 120ms, border-color 120ms;
  font-family: var(--font-sans);
}
.btn-deploy:hover {
  background: var(--bg-elevated);
  border-color: var(--accent-primary);
}
</style>
