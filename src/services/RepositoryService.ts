import type { TreeData } from 'element-plus'

export interface RepositoryService {
  getInitRepo(): Promise<TreeData | undefined>
  getChildren(parentId: number, level?: number, max?: number): Promise<TreeData | undefined>
  getArchiveName(): Promise<string | undefined>
}
