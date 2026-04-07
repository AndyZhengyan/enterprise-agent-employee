// frontend/src/composables/useOracle.js
// e-Agent-OS OpCenter — Oracle Composable
import { ref } from 'vue';
import { oracleApi } from '../services/api.js';

const archives = ref([]);
const selected = ref(null);
const total = ref(0);
const loading = ref(false);
const error = ref(null);
const activeSource = ref('');

async function fetchArchives(source = '') {
  loading.value = true;
  error.value = null;
  activeSource.value = source;
  try {
    const res = await oracleApi.list({ source });
    archives.value = res.data.items;
    total.value = res.data.total;
  } catch (e) {
    error.value = e?.message || String(e);
  } finally {
    loading.value = false;
  }
}

async function selectArchive(archive) {
  if (!archive) {
    selected.value = null;
    return;
  }
  loading.value = true;
  error.value = null;
  try {
    const res = await oracleApi.get(archive.id);
    selected.value = res.data;
  } catch (e) {
    error.value = e?.message || String(e);
  } finally {
    loading.value = false;
  }
}

export function useOracle() {
  return {
    archives,
    selected,
    total,
    loading,
    error,
    activeSource,
    fetchArchives,
    selectArchive,
  };
}
