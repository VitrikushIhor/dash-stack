import { useQuery, type UseQueryResult } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/api/query-keys'
import { type Task } from '@/entities/task'
import { taskApi } from '../api/task-api'

export function useTaskQuery(orgId: string, id: string): UseQueryResult<Task> {
  return useQuery({
    queryKey: [QUERY_KEYS.TASKS, orgId, id],
    queryFn: () => taskApi.findById(orgId, id),
    enabled: !!orgId && !!id,
  })
}
