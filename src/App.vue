<script setup lang="ts">
import { ref } from 'vue'
import type { TreeNodeData } from 'element-plus'
import HistoryComponent from './components/HistoryComponent.vue'
import RepositoryComponent from './components/RepositoryComponent.vue'
import UploadComponent from './components/UploadComponent.vue'

const selectedTreeNode = ref<TreeNodeData | null>(null)
const repositoryRef = ref<InstanceType<typeof RepositoryComponent>>()

const onUploaded = (node: TreeNodeData, parentId: number) => {
  repositoryRef.value?.addNode(node, parentId)
}
</script>

<template>
  <h1>ELO Upload</h1>
  <RepositoryComponent ref="repositoryRef" v-model:selectedTreeNode="selectedTreeNode" />
  <UploadComponent :selectedTreeNode="selectedTreeNode" @uploaded="onUploaded" />
  <HistoryComponent />
</template>

<style scoped></style>
