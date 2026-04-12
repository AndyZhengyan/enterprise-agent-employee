// frontend/src/composables/useTools.js
import { ref } from 'vue';
import { toolsApi } from '../services/api.js';

const tools = ref([]);
const loading = ref(false);

async function fetchTools() {
  loading.value = true;
  const res = await toolsApi.list();
  tools.value = res.data;
  loading.value = false;
}

async function createTool({ name, description }) {
  const res = await toolsApi.create({ name, description });
  tools.value.push(res.data);
  return res.data;
}

async function updateTool(id, { description }) {
  const res = await toolsApi.update(id, { description });
  const idx = tools.value.findIndex(t => t.id === id);
  if (idx !== -1) tools.value[idx] = res.data;
  return res.data;
}

async function deleteTool(id) {
  await toolsApi.delete(id);
  tools.value = tools.value.filter(t => t.id !== id);
}

export function useTools() {
  return { tools, loading, fetchTools, createTool, updateTool, deleteTool };
}
