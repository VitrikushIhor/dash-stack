import { useQuery, type UseQueryResult, skipToken } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/api'
import { taskApi } from '../api/task-api'
import { type Task } from './types'

export function useTaskQuery(
  orgId: string | null,
  id: string | null
): UseQueryResult<Task> {
  return useQuery({
    queryKey: [QUERY_KEYS.TASKS, orgId, id],
    queryFn: orgId && id ? () => taskApi.findById(orgId, id) : skipToken,
  })
}
