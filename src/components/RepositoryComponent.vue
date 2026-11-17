<script setup lang="ts">
import { ref } from 'vue'
import type { TreeNodeData, TreeKey, TreeInstance, TreeData } from 'element-plus'

const selectedTreeNode = defineModel<TreeNodeData | null>('selectedTreeNode', { default: null })

const treeRef = ref<TreeInstance>()
// TODO: Baumdaten aus ELO laden (z. B. über useRepository)
const repositoryData = ref<TreeData[]>([])

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
  <el-tree-v2 ref="treeRef" :data="repositoryData" :height="treeHeight" @node-expand="handleNodeExpand"
    @node-collapse="handleNodeCollapse" @node-click="handleNodeClick" class="custom-tree">
    <template #default="{ node }">
      <el-icon class="node-icon" :class="{ 'is-leaf': node.isLeaf }">
        <Document v-if="node.isLeaf && !node.data.children" />
        <Folder v-else-if="!node.expanded" />
        <FolderOpened v-else />
      </el-icon>
      <span>{{ node.label }}</span>
    </template>
  </el-tree-v2>
</template>
<style scoped></style>
