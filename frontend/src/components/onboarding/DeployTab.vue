<!-- frontend/src/components/onboarding/DeployTab.vue -->
<script setup>
defineProps({ config: Object, blueprint: Object });
const emit = defineEmits(['save']);
</script>
<template>
  <div class="deploy-tab">
    <div class="summary-section">
      <h3>基本信息</h3>
      <div class="summary-item">ID: {{ blueprint?.id || '新 Avatar' }}</div>
    </div>
    <div class="summary-section">
      <h3>灵魂预览</h3>
      <pre class="preview-box">{{ config.soul_content || '(未填写)' }}</pre>
    </div>
    <div class="summary-section">
      <h3>能力</h3>
      <div>模型: {{ config.selected_model || '(未选择)' }}</div>
      <div>工具: {{ config.tools_enabled?.join(', ') || '(未选择)' }}</div>
    </div>
    <button class="btn btn-primary deploy-btn" @click="emit('save')">
      保存并部署
    </button>
  </div>
</template>
<style scoped>
.deploy-tab { max-width: 720px; }
.summary-section { margin-bottom: 24px; }
.summary-section h3 { font-size: 14px; font-weight: 600; margin-bottom: 8px; color: var(--text-secondary); }
.summary-item { font-size: 14px; margin-bottom: 4px; }
.preview-box { background: var(--bg-disabled); padding: 12px; border-radius: 6px; font-size: 13px; font-family: monospace; white-space: pre-wrap; max-height: 200px; overflow-y: auto; }
.deploy-btn { width: 100%; padding: 12px; font-size: 16px; }
</style>
