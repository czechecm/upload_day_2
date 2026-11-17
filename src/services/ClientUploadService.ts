import { logger, webApp } from '@elo/elo-base-lib'

import { Client, type Sord, EditInfoC } from '@elo/ix-client-typescript'

import type { UploadService } from '@/services/UploadService'

/**
 * Liefert den IX-Client der elo-base-lib.
 * Erst NACH initEloBaseServices() aufrufen (also innerhalb von Funktionen,
 * nicht auf Modulebene), sonst ist der ServiceContainer noch nicht initialisiert.
 */
function getClient(): Client {
  return webApp.getIxClient()
}

export class ClientUploadService implements UploadService {
  constructor() {}

  async uploadDocument(file: File, parentId: number): Promise<number | undefined> {
    logger.info(`uploadDocument() file: ${file.name}, parentId: ${parentId}`)
    if (!parentId) {
      return
    }
    const fileBuffer: ArrayBuffer = await file.arrayBuffer()
    if (!fileBuffer) {
      logger.warn(`uploadDocument() could not create files array buffer`)
      return
    }

    /*if (!client) {
    await initClient()
  }*/

    const client = getClient()

    const fileBlob = new Blob([fileBuffer], { type: file.type })
    const fileUploadResult = await client?.bUtility.upload(fileBlob)
    const streamId = fileUploadResult?.result?.streamId

    return await createDocument(streamId, file?.name, parentId, file.type)
  }
}

async function createDocument(
  streamId: string | undefined,
  fileName: string,
  parentId: number,
  contentType: string,
): Promise<number | undefined> {
  logger.info(`[SearchUtils] createDocument() streamId ${streamId}`)
  const client = getClient()
  const createDocResult = await client?.ix.createDoc({
    parentId: String(parentId),
    maskId: '0',
    editInfoZ: EditInfoC.mbSordDocAtt,
  })
  const sord: Sord | undefined = createDocResult?.result?.sord

  if (!sord) {
    logger.warn(`[SearchUtils] cound not create document`)
    return undefined
  }

  sord.name = fileName

  const checkinDocResult = await client?.ix.checkinDocEnd({
    sord,
    sordZ: EditInfoC.mbAll,
    document: {
      docs: [
        {
          version: '1.0',
          comment: 'Init version',
          contentType: contentType,
          fileData: {
            stream: {
              streamId,
            },
          },
        },
      ],
    },
  })
  logger.info(
    `[SearchUtils] createDocument() document obj id ${checkinDocResult?.result?.objId} was successfully uploaded`,
  )
  //return sord.id ? Promise.resolve() : Promise.reject(new Error('Document upload failed'))
  if (checkinDocResult?.result?.objId) {
    return Number(checkinDocResult?.result?.objId)
  } else {
    return -1
  }
}
