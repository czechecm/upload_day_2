import type { UploadService } from '@/services/UploadService'
import { ClientUploadService } from '@/services/ClientUploadService'

export async function uploadDocument(
  file: File,
  parentId: number,
  uploadService: UploadService = new ClientUploadService(),
): Promise<number | undefined> {
  const objId: number | undefined = await uploadService.uploadDocument(file, parentId)
  return objId
}
