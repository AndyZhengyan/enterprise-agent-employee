<!-- frontend/src/views/EnablementView.vue -->
<script setup>
import { ref, onMounted } from 'vue';
import { useTools } from '../composables/useTools.js';

const { tools, loading, fetchTools, createTool, updateTool, deleteTool } = useTools();

onMounted(() => fetchTools());

const showModal = ref(false);
const editingTool = ref(null);
const form = ref({ name: '', description: '' });

function openAdd() {
  editingTool.value = null;
  form.value = { name: '', description: '' };
  showModal.value = true;
}

function openEdit(tool) {
  editingTool.value = tool;
  form.value = { name: tool.name, description: tool.description };
  showModal.value = true;
}

async function handleSubmit() {
  if (editingTool.value) {
    await updateTool(editingTool.value.id, form.value);
  } else {
    await createTool(form.value);
  }
  showModal.value = false;
}

async function handleDelete(id) {
  if (!confirm('确认删除此工具？')) return;
  await deleteTool(id);
}
</script>

<template>
  <div class="page">
    <div class="page-header">
      <div>
        <h1 class="page-title">赋能中心 · 工具货架</h1>
        <p class="page-sub">管理 Avatar 可用工具</p>
      </div>
      <button class="btn btn-primary" @click="openAdd">+ 添加工具</button>
    </div>

    <div v-if="loading" class="loading">加载中...</div>
    <div v-else class="tools-grid">
      <div v-for="tool in tools" :key="tool.id" class="tool-card">
        <div class="tool-name">{{ tool.name }}</div>
        <div class="tool-desc">{{ tool.description || '暂无描述' }}</div>
        <div class="tool-actions">
          <button class="btn btn-sm" @click="openEdit(tool)">编辑</button>
          <button class="btn btn-sm btn-danger" @click="handleDelete(tool.id)">删除</button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
        <div class="modal">
          <h3>{{ editingTool ? '编辑工具' : '添加工具' }}</h3>
          <form @submit.prevent="handleSubmit">
            <div class="form-group">
              <label>工具名称</label>
              <input v-model="form.name" :disabled="!!editingTool" required placeholder="如 web_search" />
            </div>
            <div class="form-group">
              <label>描述</label>
              <textarea v-model="form.description" rows="3" placeholder="工具用途说明"></textarea>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn" @click="showModal = false">取消</button>
              <button type="submit" class="btn btn-primary">保存</button>
            </div>
          </form>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.page-title {
  font-size: 24px;
  font-weight: 600;
  margin: 0;
}
.page-sub {
  font-size: 14px;
  color: var(--text-secondary);
  margin: 4px 0 0;
}
.tools-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
}
.tool-card {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  background: white;
}
.tool-name {
  font-weight: 600;
  font-family: monospace;
  margin-bottom: 8px;
}
.tool-desc {
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 12px;
}
.tool-actions {
  display: flex;
  gap: 8px;
}
.btn-sm {
  padding: 4px 8px;
  font-size: 12px;
}
.btn-danger {
  color: var(--danger);
  border: 1px solid var(--danger);
  background: white;
}
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex; align-items: center; justify-content: center;
}
.modal {
  background: white;
  border-radius: 12px;
  padding: 24px;
  width: 480px;
  max-width: 90vw;
}
.form-group {
  margin-bottom: 16px;
}
.form-group label {
  display: block;
  font-size: 13px;
  font-weight: 500;
  margin-bottom: 4px;
}
.form-group input, .form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 14px;
}
.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
}
.loading { padding: 40px; text-align: center; color: var(--text-secondary); }
</style>
