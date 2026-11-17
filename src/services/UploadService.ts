export interface UploadService {
  uploadDocument(file: File, parentId: number): Promise<number | undefined>
}
