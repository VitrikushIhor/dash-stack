import { type HttpClient, type PaginatedResult, api } from '@/shared/api'
import {
  type CreateTaskDto,
  type Task,
  type TaskStatusEnum,
  type UpdateTaskDto,
} from '../model/types'

export interface TaskFilters {
  search?: string
  status?: TaskStatusEnum[]
  assigneeIds?: string[]
  labelNames?: string[]
  dueDateFrom?: string
  dueDateTo?: string
  startDateFrom?: string
  startDateTo?: string
  page?: number
  perPage?: number
}

export function createTaskApi(client: HttpClient) {
  return {
    findAll: (
      orgId: string,
      filters?: TaskFilters
    ): Promise<PaginatedResult<Task>> => {
      const params: Record<string, string | undefined> = {
        search: filters?.search,
        dueDateFrom: filters?.dueDateFrom,
        dueDateTo: filters?.dueDateTo,
        startDateFrom: filters?.startDateFrom,
        startDateTo: filters?.startDateTo,
        status: filters?.status?.join(','),
        assigneeIds: filters?.assigneeIds?.join(','),
        labelNames: filters?.labelNames?.join(','),
        page: filters?.page?.toString(),
        perPage: filters?.perPage?.toString(),
      }

      return client.get<PaginatedResult<Task>>(
        `/organizations/${orgId}/tasks`,
        {
          params,
        }
      )
    },

    findAllUnpaginated: (
      orgId: string,
      filters?: Omit<TaskFilters, 'page' | 'perPage'>
    ): Promise<Task[]> => {
      const params: Record<string, string | undefined> = {
        search: filters?.search,
        dueDateFrom: filters?.dueDateFrom,
        dueDateTo: filters?.dueDateTo,
        startDateFrom: filters?.startDateFrom,
        startDateTo: filters?.startDateTo,
        status: filters?.status?.join(','),
        assigneeIds: filters?.assigneeIds?.join(','),
        labelNames: filters?.labelNames?.join(','),
      }

      return client.get<Task[]>(`/organizations/${orgId}/tasks/all`, {
        params,
      })
    },

    findById: (orgId: string, id: string): Promise<Task> =>
      client.get<Task>(`/organizations/${orgId}/tasks/${id}`),

    create: (orgId: string, data: CreateTaskDto): Promise<Task> =>
      client.post<Task>(`/organizations/${orgId}/tasks`, data),

    update: (orgId: string, id: string, data: UpdateTaskDto): Promise<Task> =>
      client.patch<Task>(`/organizations/${orgId}/tasks/${id}`, data),

    delete: (orgId: string, id: string): Promise<void> =>
      client.delete<void>(`/organizations/${orgId}/tasks/${id}`),

    bulkUpdate: (
      orgId: string,
      ids: string[],
      data: Partial<Pick<UpdateTaskDto, 'status'>>
    ): Promise<void> =>
      client.patch<void>(`/organizations/${orgId}/tasks/bulk/update`, {
        ids,
        ...data,
      }),

    bulkDelete: (orgId: string, ids: string[]): Promise<void> =>
      client.delete<void>(`/organizations/${orgId}/tasks/bulk`, {
        body: { ids },
      }),
  }
}

export const taskApi = createTaskApi(api)
