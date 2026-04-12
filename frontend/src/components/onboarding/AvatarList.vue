<!-- frontend/src/components/onboarding/AvatarList.vue -->
<script setup>
defineProps({ blueprints: Array, selectedId: String });
const emit = defineEmits(['select', 'new']);
</script>
<template>
  <div class="avatar-list">
    <div
      v-for="bp in blueprints"
      :key="bp.id"
      :class="['avatar-item', { selected: bp.id === selectedId }]"
      @click="emit('select', bp)"
    >
      <div class="avatar-alias">{{ bp.alias || bp.id }}</div>
      <div class="avatar-meta">{{ bp.role }} · {{ bp.department }}</div>
    </div>
    <div class="avatar-item new-item" @click="emit('new')">
      <div class="avatar-alias">+ 部署新 Avatar</div>
    </div>
  </div>
</template>
<style scoped>
.avatar-list { padding: 12px; }
.avatar-item {
  padding: 12px;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 8px;
  border: 1px solid transparent;
}
.avatar-item:hover { background: var(--bg-hover); }
.avatar-item.selected { border-color: var(--accent-primary); background: var(--bg-active); }
.avatar-alias { font-weight: 600; font-size: 14px; }
.avatar-meta { font-size: 12px; color: var(--text-secondary); margin-top: 2px; }
.new-item { color: var(--accent-primary); font-weight: 500; text-align: center; border: 1px dashed var(--border); }
</style>
