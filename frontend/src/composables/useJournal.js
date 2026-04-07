// frontend/src/composables/useJournal.js
// e-Agent-OS OpCenter — Journal Composable
import { ref } from 'vue';
import { journalApi } from '../services/api.js';

const executions = ref([]);
const selected = ref(null);
const total = ref(0);
const loading = ref(false);
const error = ref(null);

const filters = ref({
  status: 'all',
  role: 'all',
  dept: 'all',
  q: '',
});

const ROLES = ['软件工程师', '法务专员', '行政专员', '合同专员'];
const DEPTS = ['技术研发部', '法务合规部', '综合管理部', '商务运营部'];

async function fetchExecutions() {
  loading.value = true;
  error.value = null;
  try {
    const res = await journalApi.list(filters.value);
    executions.value = res.data.items;
    total.value = res.data.total;
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}

function selectItem(item) {
  selected.value = item;
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatTime(iso) {
  const d = new Date(iso);
  const date = d.toLocaleDateString('zh-CN', {
    month: '2-digit',
    day: '2-digit',
  });
  const time = d.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return `${date} ${time}`;
}

function formatTimeShort(iso) {
  const d = new Date(iso);
  return d.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

export function useJournal() {
  return {
    executions,
    selected,
    total,
    loading,
    error,
    filters,
    roles: ROLES,
    depts: DEPTS,
    fetchExecutions,
    selectItem,
    formatDuration,
    formatTime,
    formatTimeShort,
  };
}
