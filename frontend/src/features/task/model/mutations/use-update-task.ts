import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/api/query-keys'
import { type Task, type UpdateTaskDto } from '@/entities/task'
import { taskApi } from '../api/task-api'

export function useUpdateTask(
  orgId: string
): UseMutationResult<Task, Error, { id: string; data: UpdateTaskDto }> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTaskDto }) =>
      taskApi.update(orgId, id, data),
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS, orgId] })
      queryClient.invalidateQueries({
        queryKey: [QUERY_KEYS.TASKS, orgId, variables.id],
      })
    },
  })
}
