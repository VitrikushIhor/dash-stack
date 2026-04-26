import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/api/query-keys'
import { type UpdateTaskDto } from '@/entities/task'
import { taskApi } from '../api/task-api'

export function useBulkUpdateTasks(
  orgId: string
): UseMutationResult<void, Error, { ids: string[]; data: UpdateTaskDto }> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ ids, data }: { ids: string[]; data: UpdateTaskDto }) =>
      taskApi.bulkUpdate(orgId, ids, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS, orgId] })
    },
  })
}
