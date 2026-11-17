<script setup lang="ts">
import { ref } from 'vue'
import type { TreeNodeData } from 'element-plus'
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
  <h1>ELO Upload</h1>
  <RepositoryComponent ref="repositoryRef" v-model:selectedTreeNode="selectedTreeNode" />
  <UploadComponent :selectedTreeNode="selectedTreeNode" @uploaded="onUploaded" />
  <HistoryComponent :uploads="uploadHistory" />
</template>

<style scoped></style>
