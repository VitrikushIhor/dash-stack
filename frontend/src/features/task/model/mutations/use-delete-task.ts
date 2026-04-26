import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/api/query-keys'
import { type Task } from '@/entities/task'
import { taskApi } from '../api/task-api'

export function useDeleteTask(
  orgId: string
): UseMutationResult<void, Error, string> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => taskApi.delete(orgId, id),
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: [QUERY_KEYS.TASKS, orgId] })

      const previousTasks = queryClient.getQueryData<Task[]>([
        QUERY_KEYS.TASKS,
        orgId,
      ])

      if (previousTasks) {
        queryClient.setQueryData<Task[]>([QUERY_KEYS.TASKS, orgId], (old) =>
          old?.filter((task) => task.id !== id)
        )
      }

      return { previousTasks }
    },
    onError: (_err, _id, context) => {
      if (context?.previousTasks) {
        queryClient.setQueryData(
          [QUERY_KEYS.TASKS, orgId],
          context.previousTasks
        )
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS, orgId] })
    },
  })
}
