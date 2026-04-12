// frontend/src/composables/useAvatarConfig.js
import { ref } from 'vue';
import { onboardingApi } from '../services/api.js';

const currentBlueprint = ref(null);
const config = ref({
  soul_content: '',
  agents_content: '',
  user_content: '',
  tools_enabled: [],
  selected_model: '',
});

async function loadConfig(bpId) {
  const res = await onboardingApi.getConfig(bpId);
  currentBlueprint.value = res.data;
  config.value = {
    soul_content: res.data.soul_content || '',
    agents_content: res.data.agents_content || '',
    user_content: res.data.user_content || '',
    tools_enabled: res.data.tools_enabled || [],
    selected_model: res.data.selected_model || '',
  };
}

async function saveConfig() {
  if (!currentBlueprint.value) return;
  await onboardingApi.saveConfig(currentBlueprint.value.id, config.value);
}

function resetConfig() {
  currentBlueprint.value = null;
  config.value = { soul_content: '', agents_content: '', user_content: '', tools_enabled: [], selected_model: '' };
}

export function useAvatarConfig() {
  return { currentBlueprint, config, loadConfig, saveConfig, resetConfig };
}
