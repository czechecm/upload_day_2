<script setup lang="ts">
import { ref } from 'vue'
import type { TreeNodeData } from 'element-plus'
import { UploadFilled } from '@element-plus/icons-vue'
import HistoryComponent, { type UploadHistoryEntry } from './components/HistoryComponent.vue'
import RepositoryComponent from './components/RepositoryComponent.vue'
import UploadComponent from './components/UploadComponent.vue'

const MAX_HISTORY = 5

const selectedTreeNode = ref<TreeNodeData | null>(null)
const repositoryRef = ref<InstanceType<typeof RepositoryComponent>>()
const uploadHistory = ref<UploadHistoryEntry[]>([])

const onUploaded = (node: TreeNodeData, parentId: number) => {
  repositoryRef.value?.addNode(node, parentId)
  // neuester Upload oben, maximal 5 Einträge
  uploadHistory.value = [
    { id: node.id, name: node.label, time: new Date() },
    ...uploadHistory.value,
  ].slice(0, MAX_HISTORY)
}
</script>

<template>
  <div class="app-shell">
    <header class="app-header">
      <div class="brand">
        <div class="brand-logo">
          <el-icon><UploadFilled /></el-icon>
        </div>
        <div>
          <h1 class="brand-title">ELO Upload</h1>
          <p class="brand-subtitle">Dokumente schnell und sicher ins Repository übertragen</p>
        </div>
      </div>
    </header>

    <main class="app-grid">
      <RepositoryComponent ref="repositoryRef" v-model:selectedTreeNode="selectedTreeNode" class="area-repository" />
      <div class="area-side">
        <UploadComponent :selectedTreeNode="selectedTreeNode" @uploaded="onUploaded" />
        <HistoryComponent :uploads="uploadHistory" />
      </div>
    </main>
  </div>
</template>

<style scoped>
.app-shell {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
}

/* Kopfzeile */
.app-header {
  margin-bottom: 24px;
}

.brand {
  display: flex;
  align-items: center;
  gap: 14px;
}

.brand-logo {
  display: grid;
  place-items: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  font-size: 22px;
  color: #fff;
  background: linear-gradient(135deg, var(--el-color-primary), var(--el-color-primary-light-3));
  box-shadow: 0 6px 16px rgba(var(--app-primary-rgb), 0.35);
}

.brand-title {
  margin: 0;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: -0.01em;
}

.brand-subtitle {
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

/* Zwei Spalten: Repository links, Upload + Verlauf rechts */
.app-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(320px, 1fr);
  gap: 24px;
  align-items: start;
}

.area-side {
  display: flex;
  flex-direction: column;
  gap: 24px;
  min-width: 0;
}

/* Schmale Bildschirme: alles untereinander */
@media (max-width: 900px) {
  .app-shell {
    padding: 16px;
  }

  .app-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 16px;
  }

  .area-side {
    gap: 16px;
  }
}
</style>
