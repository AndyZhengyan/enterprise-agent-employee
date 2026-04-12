<!-- frontend/src/components/onboarding/BasicInfoTab.vue -->
<script setup>
defineProps({ config: Object, blueprint: Object });
</script>
<template>
  <div class="tab-form">
    <div class="form-group">
      <label>Blueprint ID</label>
      <input :value="blueprint?.id || ''" disabled />
    </div>
    <div class="form-group">
      <label>Avatar 名称</label>
      <input v-model="config._alias" placeholder="如 小白" />
    </div>
    <div class="form-group">
      <label>角色</label>
      <input v-model="config._role" placeholder="如 行政专员" />
    </div>
    <div class="form-group">
      <label>部门</label>
      <input v-model="config._dept" placeholder="如 综合管理部" />
    </div>
  </div>
</template>
<style scoped>
.tab-form { max-width: 560px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; }
.form-group input { width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 14px; }
.form-group input:disabled { background: var(--bg-disabled); color: var(--text-secondary); }
</style>
