import { api } from '@/shared/api/api-client'
import {
  type Task,
  type CreateTaskDto,
  type UpdateTaskDto,
  type TaskStatusEnum,
} from '@/entities/task'

export interface TaskFilters {
  search?: string
  status?: TaskStatusEnum[]
  assigneeIds?: string[]
  labelNames?: string[]
  deadlineFrom?: string
  deadlineTo?: string
}

export const taskApi = {
  findAll: (orgId: string, filters?: TaskFilters): Promise<Task[]> => {
    const params: Record<string, string | undefined> = {
      search: filters?.search,
      deadlineFrom: filters?.deadlineFrom,
      deadlineTo: filters?.deadlineTo,
      status: filters?.status?.join(','),
      assigneeIds: filters?.assigneeIds?.join(','),
      labelNames: filters?.labelNames?.join(','),
    }

    return api.get<Task[]>(`/organizations/${orgId}/tasks`, {
      params,
    })
  },

  findById: (orgId: string, id: string): Promise<Task> =>
    api.get<Task>(`/organizations/${orgId}/tasks/${id}`),

  create: (orgId: string, data: CreateTaskDto): Promise<Task> =>
    api.post<Task>(`/organizations/${orgId}/tasks`, data),

  update: (orgId: string, id: string, data: UpdateTaskDto): Promise<Task> =>
    api.patch<Task>(`/organizations/${orgId}/tasks/${id}`, data),

  delete: (orgId: string, id: string): Promise<void> =>
    api.delete<void>(`/organizations/${orgId}/tasks/${id}`),

  bulkUpdate: (
    orgId: string,
    ids: string[],
    data: Partial<Pick<UpdateTaskDto, 'status'>>
  ): Promise<void> =>
    api.patch<void>(`/organizations/${orgId}/tasks/bulk/update`, {
      ids,
      ...data,
    }),

  bulkDelete: (orgId: string, ids: string[]): Promise<void> =>
    api.delete<void>(`/organizations/${orgId}/tasks/bulk`, { data: { ids } }),
}
