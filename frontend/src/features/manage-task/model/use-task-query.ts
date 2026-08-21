'use client'

import { type UseQueryResult, skipToken, useQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/api'
import { type Task } from '@/entities/task'
import { getTaskAction } from '../server'

export function useTaskQuery(
  slug: string | null | undefined,
  id: string | null | undefined
): UseQueryResult<Task> {
  return useQuery({
    queryKey: [QUERY_KEYS.ORGANIZATIONS, slug, QUERY_KEYS.TASKS, id],
    queryFn:
      slug && id
        ? async () => {
            const res = await getTaskAction({ slug, id })
            if (!res.success) {
              throw new Error(res.error)
            }
            return res.data
          }
        : skipToken,
    enabled: !!(slug && id),
  })
}
