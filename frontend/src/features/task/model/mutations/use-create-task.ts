import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/api/query-keys'
import { type Task, type CreateTaskDto } from '@/entities/task'
import { taskApi } from '../api/task-api'

export function useCreateTask(
  orgId: string
): UseMutationResult<Task, Error, CreateTaskDto> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTaskDto) => taskApi.create(orgId, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS, orgId] })
    },
  })
}
