<!-- frontend/src/components/onboarding/CapabilityTab.vue -->
<script setup>
import { ref, computed } from 'vue';
const props = defineProps({ config: Object, allTools: Array });
const search = ref('');
const filteredTools = computed(() =>
  (props.allTools || []).filter(t => t.name.includes(search.value))
);
function toggleTool(name) {
  const list = props.config.tools_enabled;
  const idx = list.indexOf(name);
  if (idx === -1) list.push(name);
  else list.splice(idx, 1);
}
</script>
<template>
  <div class="tab-form">
    <div class="form-group">
      <label>AGENTS.md 工作流程</label>
      <textarea v-model="config.agents_content" rows="8" placeholder="输入 AGENTS.md 内容..."></textarea>
    </div>
    <div class="form-group">
      <label>模型选择</label>
      <input v-model="config.selected_model" placeholder="如 anthropic/claude-opus-4-6" />
    </div>
    <div class="form-group">
      <label>工具集</label>
      <input v-model="search" placeholder="搜索工具..." style="margin-bottom:8px" />
      <div class="tools-checkboxes">
        <label v-for="tool in filteredTools" :key="tool.id" class="tool-check">
          <input
            type="checkbox"
            :checked="config.tools_enabled.includes(tool.name)"
            @change="toggleTool(tool.name)"
          />
          <span class="tool-name">{{ tool.name }}</span>
          <span class="tool-desc">{{ tool.description }}</span>
        </label>
      </div>
    </div>
  </div>
</template>
<style scoped>
.tab-form { max-width: 720px; }
.form-group { margin-bottom: 24px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; }
.form-group textarea, .form-group input { width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 14px; font-family: monospace; resize: vertical; }
.tools-checkboxes { display: flex; flex-direction: column; gap: 8px; max-height: 300px; overflow-y: auto; border: 1px solid var(--border); border-radius: 6px; padding: 12px; }
.tool-check { display: flex; align-items: flex-start; gap: 8px; cursor: pointer; }
.tool-check input { margin-top: 2px; }
.tool-name { font-family: monospace; font-weight: 600; min-width: 140px; }
.tool-desc { font-size: 12px; color: var(--text-secondary); }
</style>
