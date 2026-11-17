<script setup lang="ts">
export interface UploadHistoryEntry {
  id: number
  name: string
  time: Date
}

defineProps<{
  uploads: UploadHistoryEntry[]
}>()

const formatTime = (time: Date) => time.toLocaleTimeString('de-DE')
</script>
<template>
  <h2>HistoryComponent</h2>
  <el-table :data="uploads" empty-text="Noch keine Uploads" style="max-width: 450px">
    <el-table-column label="Uhrzeit" width="100">
      <template #default="{ row }">{{ formatTime(row.time) }}</template>
    </el-table-column>
    <el-table-column prop="name" label="Dokument" />
  </el-table>
</template>
<style scoped></style>
