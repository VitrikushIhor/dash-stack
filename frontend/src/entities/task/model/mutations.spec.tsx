import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QUERY_KEYS } from '@/shared/api/query-keys'
import {
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useBulkUpdateTasks,
  useBulkDeleteTasks,
} from './mutations'
import {
  TaskStatusEnum,
  type Task,
  type CreateTaskDto,
  type UpdateTaskDto,
} from './types'

// --- Mocks ---

const mockCreate = vi.fn()
const mockUpdate = vi.fn()
const mockDelete = vi.fn()
const mockBulkUpdate = vi.fn()
const mockBulkDelete = vi.fn()

vi.mock('../api/task-api', () => ({
  taskApi: {
    create: (orgId: string, data: CreateTaskDto) => mockCreate(orgId, data),
    update: (orgId: string, id: string, data: UpdateTaskDto) =>
      mockUpdate(orgId, id, data),
    delete: (orgId: string, id: string) => mockDelete(orgId, id),
    bulkUpdate: (
      orgId: string,
      ids: string[],
      data: { status: TaskStatusEnum }
    ) => mockBulkUpdate(orgId, ids, data),
    bulkDelete: (orgId: string, ids: string[]) => mockBulkDelete(orgId, ids),
  },
}))

// --- Test Data ---

const mockTask: Task = {
  id: 'task-123',
  title: 'Mutation Task',
  status: TaskStatusEnum.PLANNED,
  deadline: '2026-06-10T12:00:00Z',
  attachments: [],
  organizationId: 'org-1',
  createdAt: '',
  updatedAt: '',
  assignees: [],
  label: { id: 'l1', name: 'Low', color: 'blue' as const },
}

describe('Task Mutation Hooks', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    vi.clearAllMocks()
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    })
  })

  const createWrapper = () => {
    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
  }

  describe('useCreateTask', () => {
    it('creates a task and invalidates tasks list cache', async () => {
      mockCreate.mockResolvedValue(mockTask)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useCreateTask('org-1'), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.mutate({
          title: 'New Task',
          label: { name: 'Urgent', color: 'red' },
        })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockCreate).toHaveBeenCalledWith('org-1', {
        title: 'New Task',
        label: { name: 'Urgent', color: 'red' },
      })
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: [QUERY_KEYS.TASKS, 'org-1'],
      })
    })
  })

  describe('useUpdateTask', () => {
    it('updates a task and invalidates both list and specific task caches', async () => {
      mockUpdate.mockResolvedValue(mockTask)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useUpdateTask('org-1'), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.mutate({
          id: 'task-123',
          data: { title: 'Updated Title' },
        })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockUpdate).toHaveBeenCalledWith('org-1', 'task-123', {
        title: 'Updated Title',
      })
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: [QUERY_KEYS.TASKS, 'org-1'],
      })
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: [QUERY_KEYS.TASKS, 'org-1', 'task-123'],
      })
    })
  })

  describe('useDeleteTask', () => {
    it('performs optimistic deletion and invalidates query cache', async () => {
      mockDelete.mockResolvedValue(undefined)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      // Set initial task list in query cache
      const initialTasks = [mockTask]
      queryClient.setQueryData([QUERY_KEYS.TASKS, 'org-1'], initialTasks)

      const { result } = renderHook(() => useDeleteTask('org-1'), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.mutate('task-123')
      })

      // Check if cache was optimistically updated (filtered out task-123)
      await waitFor(() => {
        const currentCache = queryClient.getQueryData<Task[]>([
          QUERY_KEYS.TASKS,
          'org-1',
        ])
        expect(currentCache).toEqual([])
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockDelete).toHaveBeenCalledWith('org-1', 'task-123')
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: [QUERY_KEYS.TASKS, 'org-1'],
      })
    })

    it('rolls back optimistic deletion if api fails', async () => {
      const error = new Error('Deletion failed')
      mockDelete.mockImplementation(
        () => new Promise((_, reject) => setTimeout(() => reject(error), 50))
      )

      // Set initial task list in query cache
      const initialTasks = [mockTask]
      queryClient.setQueryData([QUERY_KEYS.TASKS, 'org-1'], initialTasks)

      const { result } = renderHook(() => useDeleteTask('org-1'), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.mutate('task-123')
      })

      // Verify immediate optimistic update
      await waitFor(() => {
        expect(queryClient.getQueryData([QUERY_KEYS.TASKS, 'org-1'])).toEqual(
          []
        )
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      // Verify rollback to previous state
      const rolledBackCache = queryClient.getQueryData<Task[]>([
        QUERY_KEYS.TASKS,
        'org-1',
      ])
      expect(rolledBackCache).toEqual(initialTasks)
    })
  })

  describe('useBulkUpdateTasks', () => {
    it('sends bulk update request and invalidates tasks list cache', async () => {
      mockBulkUpdate.mockResolvedValue(undefined)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useBulkUpdateTasks('org-1'), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.mutate({
          ids: ['1', '2'],
          data: { status: TaskStatusEnum.COMPLETED },
        })
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockBulkUpdate).toHaveBeenCalledWith('org-1', ['1', '2'], {
        status: TaskStatusEnum.COMPLETED,
      })
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: [QUERY_KEYS.TASKS, 'org-1'],
      })
    })
  })

  describe('useBulkDeleteTasks', () => {
    it('sends bulk delete request and invalidates tasks list cache', async () => {
      mockBulkDelete.mockResolvedValue(undefined)
      const invalidateSpy = vi.spyOn(queryClient, 'invalidateQueries')

      const { result } = renderHook(() => useBulkDeleteTasks('org-1'), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.mutate(['1', '2'])
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockBulkDelete).toHaveBeenCalledWith('org-1', ['1', '2'])
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: [QUERY_KEYS.TASKS, 'org-1'],
      })
    })
  })
})
