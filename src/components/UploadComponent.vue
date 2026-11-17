<script setup lang="ts">
import { logger } from '@elo/elo-base-lib'
import { type Ref, ref, computed } from 'vue'
import type { UploadUserFile, UploadRequestOptions, ElUpload, TreeNodeData } from 'element-plus'
import { ElMessage, ElMessageBox } from 'element-plus' //'element-plus/lib' nicht verwenden (CommonJS)
import { FolderOpened, Pointer, Upload, UploadFilled } from '@element-plus/icons-vue'
import { useUpload } from '@/composable/useUpload';

const { uploadDocument } = useUpload()

const fileList: Ref<UploadUserFile[]> = ref<UploadUserFile[]>([])

const handleExceed = (files: File[], fileList: File[]) => {
  logger.info('[UploadDoc]handleExceed() files:', files, 'fileList:', fileList)
  ElMessageBox.alert('You can only upload one file at a time. The new file is discarded, and the old one remains.', 'File Limit Exceeded', {
    confirmButtonText: 'OK',
    type: 'warning',
  })
}

const uploadRef: Ref<InstanceType<typeof ElUpload> | null> = ref(null)

const props = defineProps<{
  selectedTreeNode: TreeNodeData | null
}>()

const emit = defineEmits<{
  uploaded: [node: TreeNodeData, parentId: number]
}>()

const uploading = ref(false)

/** Ein Ordner (kein Dokument) ist als Ziel ausgewählt */
const isFolderSelected = computed(() => !!props.selectedTreeNode && !props.selectedTreeNode.isLeaf)
const canUpload = computed(() => fileList.value.length > 0 && isFolderSelected.value && !uploading.value)

const targetLabel = computed(() => {
  if (!props.selectedTreeNode) return 'Bitte links einen Ordner auswählen'
  if (props.selectedTreeNode.isLeaf) return 'Dokument gewählt – bitte einen Ordner auswählen'
  return props.selectedTreeNode.label
})

const submitUpload = () => {
  uploadRef.value?.submit()
}

const customUpload = async (options: UploadRequestOptions) => {
  if (props.selectedTreeNode?.isLeaf) {
    logger.warn(`[UploadDoc] customUpload() the selected element is a document`)
    ElMessageBox.alert('Failed to upload the document. Please select a sord.', 'Select Error', {
      confirmButtonText: 'OK',
      type: 'error',
    })
    uploadRef.value?.clearFiles();
    return
  }

  const parentId: number = props.selectedTreeNode?.id ?? 0

  uploading.value = true
  try {
    const documentId = await uploadDocument(options.file as File, parentId)
    if (documentId === undefined) {
      logger.warn(`[UploadDoc] customUpload() documentId is undefined, upload failed`)
      ElMessageBox.alert('Failed to upload the document. Please try again.', 'Upload Error', {
        confirmButtonText: 'OK',
        type: 'error',
      })
      uploadRef.value?.clearFiles();
      return
    }

    const newNode: TreeNodeData = {
      id: documentId,
      label: options.file?.name,
      isLeaf: true
    }
    // Prop nicht selbst ändern – Elternkomponente informieren, die den Baum aktualisiert
    emit('uploaded', newNode, parentId)
    uploadRef.value?.clearFiles()

    ElMessage.success({ message: `„${options.file?.name}“ wurde hochgeladen`, grouping: true })
  } finally {
    uploading.value = false
  }
}

</script>
<template>
  <el-card class="panel" shadow="never">
    <template #header>
      <div class="panel-header">
        <div class="panel-title">
          <el-icon><UploadFilled /></el-icon>
          <span>Upload</span>
        </div>
      </div>
    </template>

    <!-- Zielordner -->
    <div class="target" :class="{ 'is-empty': !isFolderSelected }">
      <div class="target-icon">
        <el-icon>
          <FolderOpened v-if="isFolderSelected" />
          <Pointer v-else />
        </el-icon>
      </div>
      <div class="target-text">
        <span class="target-caption">Zielordner</span>
        <span class="target-name" :title="targetLabel">{{ targetLabel }}</span>
      </div>
    </div>

    <!-- Datei-Auswahl per Drag & Drop -->
    <el-upload ref="uploadRef" v-model:file-list="fileList" class="dropzone" drag action="" :limit="1"
      :on-exceed="handleExceed" :auto-upload="false" :http-request="customUpload">
      <el-icon class="dropzone-icon"><UploadFilled /></el-icon>
      <div class="dropzone-text">Datei hierher ziehen oder <em>auswählen</em></div>
      <div class="dropzone-hint">Eine Datei pro Upload</div>
    </el-upload>

    <el-button type="primary" size="large" class="upload-button" :disabled="!canUpload" :loading="uploading"
      @click="submitUpload">
      <el-icon v-if="!uploading" class="el-icon--left"><Upload /></el-icon>
      In Repository hochladen
    </el-button>
  </el-card>
</template>
<style scoped>
/* Zielordner */
.target {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  margin-bottom: 16px;
  border-radius: 10px;
  background: var(--el-color-primary-light-9);
  border: 1px solid var(--el-color-primary-light-7);
  transition: background-color 0.2s, border-color 0.2s;
}

.target.is-empty {
  background: var(--el-fill-color-lighter);
  border: 1px dashed var(--el-border-color);
}

.target-icon {
  display: grid;
  place-items: center;
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  font-size: 18px;
  color: var(--el-color-warning);
  background: var(--el-bg-color);
}

.target.is-empty .target-icon {
  color: var(--el-text-color-placeholder);
}

.target-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.target-caption {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--el-text-color-secondary);
}

.target-name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  font-weight: 600;
}

.target.is-empty .target-name {
  font-weight: 400;
  color: var(--el-text-color-secondary);
}

/* Drop-Zone */
.dropzone :deep(.el-upload-dragger) {
  padding: 28px 16px;
  border-radius: 12px;
  border-width: 2px;
  background: var(--el-fill-color-blank);
  transition: border-color 0.2s, background-color 0.2s;
}

.dropzone :deep(.el-upload-dragger:hover),
.dropzone :deep(.el-upload-dragger.is-dragover) {
  background: var(--el-color-primary-light-9);
}

.dropzone-icon {
  font-size: 44px;
  color: var(--el-color-primary-light-3);
  margin-bottom: 8px;
}

.dropzone-text {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.dropzone-text em {
  font-style: normal;
  font-weight: 600;
  color: var(--el-color-primary);
}

.dropzone-hint {
  margin-top: 4px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.dropzone :deep(.el-upload-list) {
  margin-top: 8px;
}

/* Upload-Button */
.upload-button {
  width: 100%;
  margin-top: 16px;
  border-radius: 10px;
  font-weight: 600;
}
</style>
