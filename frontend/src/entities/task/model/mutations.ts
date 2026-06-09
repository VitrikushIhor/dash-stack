import {
  useMutation,
  useQueryClient,
  type UseMutationResult,
} from '@tanstack/react-query'
import { QUERY_KEYS } from '@/shared/api/query-keys'
import { taskApi } from '../api/task-api'
import { type Task, type CreateTaskDto, type UpdateTaskDto } from './types'

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

export function useBulkUpdateTasks(
  orgId: string
): UseMutationResult<
  void,
  Error,
  { ids: string[]; data: Partial<Pick<UpdateTaskDto, 'status'>> }
> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      ids,
      data,
    }: {
      ids: string[]
      data: Partial<Pick<UpdateTaskDto, 'status'>>
    }) => taskApi.bulkUpdate(orgId, ids, data),
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.TASKS, orgId] })
    },
  })
}

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
