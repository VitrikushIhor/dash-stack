import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, act, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { QUERY_KEYS } from '@/shared/api'
import { useUpdateTask } from './mutations'
import { TaskStatusEnum, type Task, type UpdateTaskDto } from './types'

// --- Mocks ---

const mockUpdate = vi.fn()

vi.mock('../api/task-api', () => ({
  taskApi: {
    update: (orgId: string, id: string, data: UpdateTaskDto) =>
      mockUpdate(orgId, id, data),
  },
}))

// --- Test Data ---

const mockTask: Task = {
  id: 'task-123',
  title: 'Mutation Task',
  status: TaskStatusEnum.PLANNED,
  dueDate: '2026-06-10T12:00:00Z',
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
})
