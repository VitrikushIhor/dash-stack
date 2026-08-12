import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { QUERY_KEYS, type PaginatedResult } from '@/shared/api'
import { taskApi, type TaskFilters } from '../api/task-api'
import { type Task } from './types'

export function useTasksQuery(
  orgId: string,
  filters?: TaskFilters
): UseQueryResult<PaginatedResult<Task>> {
  return useQuery({
    queryKey: [QUERY_KEYS.TASKS, orgId, JSON.stringify(filters)],
    queryFn: () => taskApi.findAll(orgId, filters),
    enabled: !!orgId,
  })
}

export function useTaskQuery(orgId: string, id: string): UseQueryResult<Task> {
  return useQuery({
    queryKey: [QUERY_KEYS.TASKS, orgId, id],
    queryFn: () => taskApi.findById(orgId, id),
    enabled: !!orgId && !!id,
  })
}
