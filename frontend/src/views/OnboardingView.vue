<!-- frontend/src/views/OnboardingView.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { useOnboarding } from '../composables/useOnboarding.js';
import { useAvatarConfig } from '../composables/useAvatarConfig.js';
import { useTools } from '../composables/useTools.js';
import AvatarList from '../components/onboarding/AvatarList.vue';
import BasicInfoTab from '../components/onboarding/BasicInfoTab.vue';
import SoulTab from '../components/onboarding/SoulTab.vue';
import CapabilityTab from '../components/onboarding/CapabilityTab.vue';
import DeployTab from '../components/onboarding/DeployTab.vue';

const { blueprints, fetchBlueprints } = useOnboarding();
const { currentBlueprint, config, loadConfig, saveConfig, resetConfig } = useAvatarConfig();
const { tools: allTools, fetchTools } = useTools();

onMounted(async () => {
  await fetchBlueprints();
  await fetchTools();
});

const activeTab = ref('basic');

const tabs = [
  { id: 'basic', label: '基本信息' },
  { id: 'soul', label: '灵魂' },
  { id: 'capability', label: '能力' },
  { id: 'deploy', label: '部署' },
];

async function handleSelectBlueprint(bp) {
  await loadConfig(bp.id);
  activeTab.value = 'basic';
}

async function handleNewAvatar() {
  resetConfig();
  activeTab.value = 'basic';
}

async function handleSave() {
  await saveConfig();
  alert('配置已保存');
}
</script>

<template>
  <div class="page-layout">
    <!-- Left: Avatar list -->
    <div class="sidebar">
      <div class="sidebar-header">
        <h2 class="sidebar-title">Avatar 列表</h2>
      </div>
      <AvatarList
        :blueprints="blueprints"
        :selectedId="currentBlueprint?.id"
        @select="handleSelectBlueprint"
        @new="handleNewAvatar"
      />
    </div>

    <!-- Right: Config panel -->
    <div class="config-panel">
      <div class="config-header">
        <div class="config-title">
          {{ currentBlueprint ? currentBlueprint.alias || currentBlueprint.id : '新 Avatar' }}
        </div>
        <div class="tab-bar">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="['tab-btn', { active: activeTab === tab.id }]"
            @click="activeTab = tab.id"
          >
            {{ tab.label }}
          </button>
        </div>
      </div>

      <div class="tab-content">
        <BasicInfoTab v-if="activeTab === 'basic'" :config="config" :blueprint="currentBlueprint" />
        <SoulTab v-if="activeTab === 'soul'" :config="config" />
        <CapabilityTab v-if="activeTab === 'capability'" :config="config" :allTools="allTools" />
        <DeployTab v-if="activeTab === 'deploy'" :config="config" :blueprint="currentBlueprint" @save="handleSave" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-layout {
  display: flex;
  min-height: calc(100vh - 56px);
}
.sidebar {
  width: 320px;
  border-right: 1px solid var(--border);
  flex-shrink: 0;
  overflow-y: auto;
}
.sidebar-header {
  padding: 20px;
  border-bottom: 1px solid var(--border);
}
.sidebar-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}
.config-panel {
  flex: 1;
  overflow-y: auto;
}
.config-header {
  padding: 20px 24px 0;
  border-bottom: 1px solid var(--border);
  position: sticky;
  top: 0;
  background: white;
  z-index: 1;
}
.config-title {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}
.tab-bar {
  display: flex;
  gap: 4px;
}
.tab-btn {
  padding: 8px 16px;
  border: none;
  background: none;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-secondary);
  border-bottom: 2px solid transparent;
  margin-bottom: -1px;
}
.tab-btn.active {
  color: var(--accent-primary);
  border-bottom-color: var(--accent-primary);
  font-weight: 500;
}
.tab-content {
  padding: 24px;
}
</style>
