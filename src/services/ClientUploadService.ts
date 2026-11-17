import { logger } from '@elo/elo-base-lib'

import type { UploadService } from '@/services/UploadService'

export class ClientUploadService implements UploadService {
  constructor() {}

  async uploadDocument(file: File, parentId: number): Promise<number | undefined> {
    logger.info(`uploadDocument() file: ${file.name}, parentId: ${parentId}`)
    return -1
  }
}
