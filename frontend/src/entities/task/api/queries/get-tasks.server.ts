import 'server-only'
import { type PaginationMeta, getErrorMessage } from '@/shared/api'
import { type Task } from '../../model/types'
import { type TaskFilters } from '../task-api'
import { taskServerApi } from '../task-api.server'

type GetTasksResponse = {
  data: Task[] | null
  meta: PaginationMeta | null
  error: string | null
}

export const getOrganizationTasks = async (
  slug: string,
  filters?: TaskFilters
): Promise<GetTasksResponse> => {
  try {
    const result = await taskServerApi.findAll(slug, filters)
    return { data: result.data, meta: result.meta, error: null }
  } catch (error) {
    return { data: null, meta: null, error: getErrorMessage(error) }
  }
}

type GetTasksUnpaginatedResponse = {
  data: Task[] | null
  error: string | null
}

export const getTasksUnpaginated = async (
  slug: string,
  filters?: Omit<TaskFilters, 'page' | 'perPage'>
): Promise<GetTasksUnpaginatedResponse> => {
  try {
    const result = await taskServerApi.findAllUnpaginated(slug, filters)
    return { data: result, error: null }
  } catch (error) {
    return { data: null, error: getErrorMessage(error) }
  }
}
