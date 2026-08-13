import { useQuery, type UseQueryResult, skipToken } from '@tanstack/react-query'
import { QUERY_KEYS, type PaginatedResult } from '@/shared/api'
import { taskApi, type TaskFilters } from '../api/task-api'
import { type Task } from './types'

// TODO: [Next Sprint] Migrate CalendarPage to SSR and delete this hook.
// This client-side fetcher is deprecated in favor of server-side data fetching.
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

export function useTaskQuery(
  orgId: string | null,
  id: string | null
): UseQueryResult<Task> {
  return useQuery({
    queryKey: [QUERY_KEYS.TASKS, orgId, id],
    queryFn: orgId && id ? () => taskApi.findById(orgId, id) : skipToken,
  })
}
