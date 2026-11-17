<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import type { TreeNodeData, TreeKey, TreeData, TreeNode, ElTreeV2 } from 'element-plus'
import { logger } from '@elo/elo-base-lib';
import { Document, Folder, FolderOpened } from '@element-plus/icons-vue'
import { useRepository } from '@/composable/useRepository';

const { getInitRepo, getChildren, getArchiveName } = useRepository()

const selectedTreeNode = defineModel<TreeNodeData | null>('selectedTreeNode', { default: null })

const treeRef = ref<InstanceType<typeof ElTreeV2>>()
const repositoryData = ref<TreeData>([])

async function initDefaultRepo() {
  logger.info("initDefaultRepo()")
  const children = await getInitRepo()
  repositoryData.value = children ?? []
}

const archiveName = ref<string | undefined>('')
onMounted(async () => {
  await initDefaultRepo()
  archiveName.value = await getArchiveName()
})

const handleNodeClick = (data: TreeNodeData) => {
  selectedTreeNode.value = data
}

const parentIds: number[] = []

interface EloNode {
  id: number,
  label: string,
  isLeaf: boolean
  children?: []
}

const handleNodeExpand = async (data: TreeNodeData, node: TreeNode) => {
  logger.info("data: " + data.label + " node: " + (node as EloNode).label)
  const archiveName = await getArchiveName()
  if ((node as EloNode).label === archiveName) {
    treeHeight.value = ((node as EloNode).children?.length ?? 1) * 20
  }
  if (!data.isLeaf && data.children.length === 0) {
    const newChildren = await getChildren(data.id)
    data.children = newChildren ?? []
    repositoryData.value = [...repositoryData.value]
    await nextTick()
    if (repositoryData.value[0]?.children) {
      parentIds.length = 0
      await getParentIdsToOpen("CzechECMLOCAL", 1, data.label, data.id, repositoryData.value[0].children)
      parentIds.reverse()
      parentIds.push(data.id)
      logger.info(`getParentIdsToOpenTest() parentIdsToOpenTest: ${parentIds}`)
    }
    treeRef.value?.setExpandedKeys(parentIds)
    await nextTick()
  }
}

const getParentIdsToOpen = async (name: string, id: number, folder: string, searchId: number, children: TreeData) => {
  logger.info(`- getParentIdsToOpen() Search in: ${name} id: ${id} searching for: ${folder} searchId: ${searchId} children length ${children.length}`)
  if (parentIds.includes(id)) {
    return; // Exit the function early if the searchId is already found
  }
  if (children.length > 0) {
    for (const child of children) {
      if (child.id === searchId) {
        parentIds.push(id)
        if (id === 1) {
          break;
        } else {
          if (repositoryData.value[0]) {
            await getParentIdsToOpen("CzechECMLOCAL", 1, name, id, repositoryData.value[0].children)
          }
        }
      } else {
        if (child.children && child.children.length > 0) {
          await getParentIdsToOpen(child.label, child.id, folder, searchId, child.children ?? [])
        }
      }
    }
  } else {
    logger.info(`- getParentIdsToOpen() Search in: ${name} canceld, no children found`)
  }
}

const handleNodeCollapse = async (data: TreeNodeData, node: TreeNode) => {
  logger.info('[UploadDoc] handleNodeCollapse', (node as EloNode).label)
  const archiveName = await getArchiveName()
  if ((node as EloNode).label === archiveName) {
    treeHeight.value = 30
  }
}

/** Liefert den Pfad (Wurzel … Zielknoten) zum Knoten mit der angegebenen Id. */
const findPath = (nodes: TreeData, key: TreeKey): TreeNodeData[] | undefined => {
  for (const n of nodes) {
    if (n.id === key) return [n]
    if (n.children) {
      const path = findPath(n.children, key)
      if (path) return [n, ...path]
    }
  }
  return undefined
}

/**
 * Fügt einen neu hochgeladenen Knoten unter dem Elternknoten parentKey ein,
 * klappt den Pfad dorthin auf und selektiert den neuen Knoten.
 */
const addNode = async (node: TreeNodeData, parentKey: TreeKey) => {
  const path = findPath(repositoryData.value, parentKey)
  const parent = path?.at(-1)
  if (!path || !parent) {
    logger.warn(`[UploadDoc] addNode() parent ${parentKey} not found in tree`)
    return
  }

  if (!parent.children || parent.children.length === 0) {
    // Kinder wurden noch nie geladen → komplett aus ELO laden (enthält das neue Dokument)
    parent.children = (await getChildren(parent.id)) ?? []
  }
  if (!parent.children.some((c: TreeNodeData) => c.id === node.id)) {
    parent.children = [...parent.children, node]
  }
  repositoryData.value = [...repositoryData.value]
  await nextTick()

  // gesamten Pfad bis zum Elternknoten aufklappen, damit der neue Knoten sichtbar ist
  treeRef.value?.setExpandedKeys(path.map((n) => n.id))
  treeRef.value?.setCurrentKey(node.id)
  selectedTreeNode.value = parent.children.find((c: TreeNodeData) => c.id === node.id) ?? node

  await nextTick()
  treeRef.value?.scrollToNode(node.id, 'center')
}

defineExpose({ addNode })

const treeHeight = ref(30)
</script>

<template>
  <h2>RepositoryComponent</h2>
  <el-tree-v2 ref="treeRef" :data="repositoryData" :height="treeHeight" highlight-current @node-expand="handleNodeExpand"
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
<style scoped>
.node-icon {
  margin-right: 5px;
  color: var(--el-color-warning);
}
</style>
