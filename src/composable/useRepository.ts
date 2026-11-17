import { IxRepositoryService } from '@/services/IxRepositoryService'
import type { RepositoryService } from '@/services/RepositoryService'

import { type TreeData } from 'element-plus'

export function useRepository(repositoryService: RepositoryService = new IxRepositoryService()) {
  const getInitRepo = (): Promise<TreeData | undefined> => {
    return repositoryService.getInitRepo()
  }

  const getChildren = (
    parentId: number,
    level?: number,
    max?: number,
  ): Promise<TreeData | undefined> => {
    return repositoryService.getChildren(parentId, level, max)
  }

  const getArchiveName = (): Promise<string | undefined> => {
    return repositoryService.getArchiveName()
  }

  return { getInitRepo, getChildren, getArchiveName }
}
