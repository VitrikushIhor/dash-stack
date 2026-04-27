import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/api/query-keys'
import { type Task } from '@/entities/task'
import { taskApi, type TaskFilters } from '../api/task-api'

export function useTasksQuery(
  orgId: string,
  filters?: TaskFilters
): UseQueryResult<Task[]> {
  return useQuery({
    queryKey: [QUERY_KEYS.TASKS, orgId, JSON.stringify(filters)],
    queryFn: () => taskApi.findAll(orgId, filters),
    enabled: !!orgId,
  })
}
