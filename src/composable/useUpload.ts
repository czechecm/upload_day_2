import type { UploadService } from '@/services/UploadService'
import { ClientUploadService } from '@/services/ClientUploadService'

export function useUpload(uploadService: UploadService = new ClientUploadService()) {
  const uploadDocument = async (file: File, parentId: number): Promise<number | undefined> => {
    const documentId = await uploadService.uploadDocument(file, parentId)
    return documentId
  }

  return { uploadDocument }
}
