<script setup lang="ts">
import { ref } from 'vue'
import type { TreeNodeData, TreeKey, TreeInstance } from 'element-plus'

const selectedTreeNode = defineModel<TreeNodeData | null>('selectedTreeNode', { default: null })

const treeRef = ref<TreeInstance>()
// TODO: Baumdaten aus ELO laden (z. B. über useRepository)
const treeData = ref<TreeNodeData[]>([])

const handleNodeClick = (data: TreeNodeData) => {
  selectedTreeNode.value = data
}

/** Fügt einen neuen Knoten unter dem Elternknoten mit der Id parentKey in den Baum ein. */
const addNode = (node: TreeNodeData, parentKey: TreeKey) => {
  treeRef.value?.append(node, parentKey)
}

defineExpose({ addNode })
</script>
<template>
  <h2>RepositoryComponent</h2>
  <el-tree ref="treeRef" :data="treeData" node-key="id" @node-click="handleNodeClick" />
</template>
<style scoped></style>
