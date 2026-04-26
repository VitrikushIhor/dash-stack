import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/api/query-keys'
import { taskApi } from '../api/task-api'

export function useBulkDeleteTasks(
  orgId: string
): UseMutationResult<void, Error, string[]> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (ids: string[]) => taskApi.bulkDelete(orgId, ids),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS, orgId] })
    },
  })
}
