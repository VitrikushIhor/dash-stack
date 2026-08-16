import { type UseQueryResult, skipToken, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/api'
import { type Task } from '@/entities/task'
import { getTaskAction } from '../server'

export function useTaskQuery(id: string | null): UseQueryResult<Task> {
  return useQuery({
    queryKey: [QUERY_KEYS.TASKS, id],
    queryFn: id
      ? async () => {
          const res = await getTaskAction({ id })
          if (!res.success) {
            throw new Error(res.error)
          }
          return res.data
        }
      : skipToken,
    enabled: !!id,
  })
}
