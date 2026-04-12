<!-- frontend/src/components/onboarding/SoulTab.vue -->
<script setup>
defineProps({ config: Object });
</script>
<template>
  <div class="tab-form">
    <div class="form-group">
      <label>性格描述 (SOUL.md)</label>
      <textarea v-model="config.soul_content" rows="12" placeholder="输入 SOUL.md 内容..."></textarea>
    </div>
    <div class="form-group">
      <label>用户说明书 (USER.md)</label>
      <textarea v-model="config.user_content" rows="6" placeholder="输入 USER.md 内容..."></textarea>
    </div>
  </div>
</template>
<style scoped>
.tab-form { max-width: 720px; }
.form-group { margin-bottom: 20px; }
.form-group label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 6px; }
.form-group textarea { width: 100%; padding: 10px; border: 1px solid var(--border); border-radius: 6px; font-size: 14px; font-family: monospace; resize: vertical; }
</style>
