import type { TreeData } from 'element-plus'
import type { RepositoryService } from './RepositoryService'

import { logger, ixService } from '@elo/elo-base-lib'
import { SordC, EditInfoC, LockC, type Sord, type FindResult } from '@elo/ix-client-typescript'

export class IxRepositoryService implements RepositoryService {
  constructor() {}

  async getInitRepo(): Promise<TreeData | undefined> {
    const data: TreeData = []
    try {
      const sords = await findChildren(1, 1, 50)
      if (sords) {
        logger.info(`getChildren() found ${sords.length} sords`)
        for (const sord of sords) {
          if (SordC.LBT_DOCUMENT && SordC.LBT_DOCUMENT_MAX && sord.type) {
            const lbt_document: number = SordC.LBT_DOCUMENT
            const lbt_document_max: number = SordC.LBT_DOCUMENT_MAX
            if (lbt_document <= sord.type && sord.type < lbt_document_max) {
              data.push({ id: sord.id, label: sord.name, isLeaf: true })
            } else {
              data.push({ id: sord.id, label: sord.name, children: [], isLeaf: false })
            }
          }
        }
        //Create a root node for the repository and set its children to the retrieved data
        const archive: TreeData = []
        const archiveName = await this.getArchiveName()
        if (archiveName) {
          archive.push({ id: 1, label: archiveName, children: [], isLeaf: false })
        } else {
          return archive
        }

        if (archive[0]) {
          archive[0].children = data
        }
        return archive
      }
    } catch (error) {
      logger.warn(error)
      return data
    }
  }

  async getChildren(
    parentId: number,
    level: number = 1,
    max: number = 50,
  ): Promise<TreeData | undefined> {
    logger.info(`getChildren() nodeId ${parentId} level ${level} max ${max}`)
    const resultArray: TreeData = []
    try {
      const sords = await findChildren(parentId, level, max)
      if (sords) {
        logger.info(`getChildren() found ${sords.length} sords`)
        for (const sord of sords) {
          if (SordC.LBT_DOCUMENT && SordC.LBT_DOCUMENT_MAX && sord.type) {
            const lbt_document: number = SordC.LBT_DOCUMENT
            const lbt_document_max: number = SordC.LBT_DOCUMENT_MAX
            if (lbt_document <= sord.type && sord.type < lbt_document_max) {
              resultArray.push({ id: sord.id, label: sord.name, isLeaf: true })
            } else {
              resultArray.push({ id: sord.id, label: sord.name, children: [], isLeaf: false })
            }
          }
        }
        return resultArray
      }
    } catch (error) {
      logger.warn(error)
      return resultArray
    }
  }

  async getArchiveName(): Promise<string | undefined> {
    const editInfo = await ixService.callIxEndpoint('checkoutSord', {
      objId: '1',
      editInfoZ: EditInfoC.mbSord,
      lockZ: LockC.NO,
    })
    return editInfo.sord?.name
  }
}

async function findChildren(
  parentId: number,
  level: number = 1,
  max: number = 50,
): Promise<Sord[] | undefined> {
  const findResult: FindResult = await ixService.callIxEndpoint('findFirstSords', {
    sordZ: SordC.mbMin,
    max: max,
    findInfo: {
      findChildren: {
        endLevel: level,
        mainParent: true,
        parentId: String(parentId),
      },
      findByIndex: {},
    },
  })
  const sords: Sord[] | undefined = findResult.sords
  await ixService.callIxEndpoint('findClose', {
    searchId: findResult.searchId,
  })
  return sords
}
