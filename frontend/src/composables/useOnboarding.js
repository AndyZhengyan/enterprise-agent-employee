// frontend/src/composables/useOnboarding.js
// e-Agent-OS OpCenter — Onboarding Composable
import { ref } from 'vue';
import { onboardingApi, DEPARTMENTS } from '../services/api.js';

const blueprints = ref([]);
const loading = ref(false);
const error = ref(null);

async function fetchBlueprints() {
  loading.value = true;
  error.value = null;
  try {
    const res = await onboardingApi.list();
    blueprints.value = res.data;
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

function getTotalReplicas(bp) {
  return bp.versions.reduce((sum, v) => sum + v.replicas, 0);
}

function getLoad(bp) {
  const total = bp.versions.reduce((sum, v) => sum + v.replicas, 0);
  const max = bp.capacity.max;
  return max > 0 ? Math.round((total / max) * 100) : 0;
}

function getStatusLabel(status) {
  const map = {
    published: '正式上岗',
    testing: '试用期',
    staging: '灰度中',
    draft: '草稿',
    deprecated: '退役',
  };
  return map[status] || status;
}

function getStatusDot(status) {
  const map = {
    published: 'var(--success)',
    testing: 'var(--warning)',
    staging: 'var(--accent-primary)',
    draft: 'var(--text-disabled)',
    deprecated: 'var(--text-disabled)',
  };
  return map[status] || 'var(--text-disabled)';
}

function adjustTraffic(blueprintId, versionIndex, newTraffic) {
  const bp = blueprints.value.find(b => b.id === blueprintId);
  if (!bp) return;

  const versions = bp.versions.filter(v => v.status === 'published');
  if (versions.length < 2) return;

  const current = versions[versionIndex];
  const delta = current.traffic - newTraffic;
  current.traffic = newTraffic;

  // Redistribute delta among other published versions
  const others = versions.filter((_, i) => i !== versionIndex);
  const totalOthers = others.reduce((s, v) => s + v.traffic, 0);
  others.forEach(v => {
    v.traffic = totalOthers > 0
      ? Math.round(v.traffic + delta * (v.traffic / totalOthers))
      : Math.round(newTraffic / (versions.length - 1));
  });
}

function deprecateVersion(blueprintId, versionIndex) {
  return onboardingApi.deprecateVersion(blueprintId, versionIndex)
    .then(res => {
      const bp = blueprints.value.find(b => b.id === blueprintId);
      if (bp && res.data) {
        bp.versions = res.data.versions;
        bp.capacity = res.data.capacity;
      }
    });
}

function deployNewAvatar({ role, alias, department, scaling }) {
  const id = `av-${role}-${Date.now()}`;
  blueprints.value.push({
    id,
    role,
    alias,
    department,
    versions: [
      {
        version: 'v1.0.0',
        status: 'published',
        traffic: 100,
        replicas: scaling.minReplicas,
        config: { soul: {}, skills: [], tools: [], model: '' },
        scaling,
      },
    ],
    capacity: { used: scaling.minReplicas, max: scaling.maxReplicas },
  });
}

export function useOnboarding() {
  return {
    blueprints,
    departments: DEPARTMENTS,
    loading,
    error,
    fetchBlueprints,
    getTotalReplicas,
    getLoad,
    getStatusLabel,
    getStatusDot,
    adjustTraffic,
    deprecateVersion,
    deployNewAvatar,
  };
}
