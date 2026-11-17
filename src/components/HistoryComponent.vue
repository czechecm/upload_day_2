<script setup lang="ts">
import { Clock, Document } from '@element-plus/icons-vue'

export interface UploadHistoryEntry {
  id: number
  name: string
  time: Date
}

defineProps<{
  uploads: UploadHistoryEntry[]
}>()

const formatTime = (time: Date) => time.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
</script>
<template>
  <el-card class="panel" shadow="never">
    <template #header>
      <div class="panel-header">
        <div class="panel-title">
          <el-icon><Clock /></el-icon>
          <span>Letzte Uploads</span>
        </div>
        <el-tag v-if="uploads.length" size="small" type="info" effect="plain" round>{{ uploads.length }}</el-tag>
      </div>
    </template>

    <el-empty v-if="!uploads.length" description="Noch keine Uploads" :image-size="64" class="history-empty" />

    <ul v-else class="history-list">
      <li v-for="entry in uploads" :key="`${entry.id}-${entry.time.getTime()}`" class="history-item">
        <span class="history-icon">
          <el-icon><Document /></el-icon>
        </span>
        <span class="history-name" :title="entry.name">{{ entry.name }}</span>
        <time class="history-time" :datetime="entry.time.toISOString()">{{ formatTime(entry.time) }}</time>
      </li>
    </ul>
  </el-card>
</template>
<style scoped>
.history-empty {
  padding: 8px 0;
}

.history-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 4px;
}

.history-item + .history-item {
  border-top: 1px solid var(--el-border-color-lighter);
}

.history-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  font-size: 16px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
}

.history-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: 500;
}

.history-time {
  flex-shrink: 0;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--el-text-color-secondary);
}
</style>
