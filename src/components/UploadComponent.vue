<script setup lang="ts">
import { logger } from '@elo/elo-base-lib'
import { type Ref, ref } from 'vue'
import type { UploadUserFile, UploadRequestOptions, ElUpload, TreeNodeData } from 'element-plus'
import { ElMessageBox } from 'element-plus' //'element-plus/lib' nicht verwenden (CommonJS)
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

  ElMessageBox.alert('The file upload was successfully.', 'Upload Successfully', {
    confirmButtonText: 'OK',
    type: 'info',
  })
}

</script>
<template>
  <h2>UploadComponent</h2>
  <el-upload ref="uploadRef" v-model:file-list="fileList" class="upload-demo" action="" :limit="1"
    :on-exceed="handleExceed" :auto-upload="false" :http-request="customUpload">
    <template #trigger>
      <el-button type="primary">Select file</el-button>
    </template>
    <el-button class="ml-3" :type="fileList.length > 0 && selectedTreeNode ? 'success' : 'danger'"
      :disabled="!(fileList.length > 0)" @click="submitUpload">
      Upload to Repository
    </el-button>
    <template #tip>
      <div class="el-upload__tip text-red">
        limit 1 file, the new file is simply discarded, and the old one remains.
      </div>
    </template>
  </el-upload>
</template>
<style scoped></style>
