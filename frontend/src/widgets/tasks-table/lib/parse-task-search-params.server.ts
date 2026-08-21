import 'server-only'
import { type TaskFilters, type TaskStatusEnum } from '@/entities/task'
import { tasksSearchParamsCache } from '@/features/task-filters/server'
import { parseDateSafe } from './filters'

export function getParsedTaskFilters(
  searchParams: Record<string, string | string[] | undefined>,
  override?: { page?: number; perPage?: number }
): TaskFilters {
  const parsedParams = tasksSearchParamsCache.parse(searchParams)

  return {
    search: parsedParams.filter || undefined,
    status:
      parsedParams.status.length > 0
        ? (parsedParams.status as TaskStatusEnum[])
        : undefined,
    assigneeIds:
      parsedParams.members.length > 0 ? parsedParams.members : undefined,
    labelNames:
      parsedParams.labels.length > 0 ? parsedParams.labels : undefined,
    dueDateFrom: parseDateSafe(parsedParams.dueDate[0]),
    dueDateTo: parseDateSafe(parsedParams.dueDate[1]),
    page: override?.page ?? parsedParams.page,
    perPage: override?.perPage ?? parsedParams.perPage,
  }
}
