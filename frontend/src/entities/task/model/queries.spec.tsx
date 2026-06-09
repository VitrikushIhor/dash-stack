import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { type TaskFilters } from '../api/task-api'
import { useTasksQuery, useTaskQuery } from './queries'
import { TaskStatusEnum, type Task } from './types'

// --- Mocks ---

const mockFindAll = vi.fn()
const mockFindById = vi.fn()

vi.mock('../api/task-api', () => ({
  taskApi: {
    findAll: (orgId: string, filters?: TaskFilters) =>
      mockFindAll(orgId, filters),
    findById: (orgId: string, id: string) => mockFindById(orgId, id),
  },
}))

// --- Test Data ---

const mockTask: Task = {
  id: 'task-1',
  title: 'Query Task 1',
  status: TaskStatusEnum.PLANNED,
  deadline: '2026-06-10T12:00:00Z',
  attachments: [],
  organizationId: 'org-1',
  createdAt: '',
  updatedAt: '',
  assignees: [],
  label: { id: 'l1', name: 'Low', color: 'blue' as const },
}

describe('Task Query Hooks', () => {
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

  describe('useTasksQuery', () => {
    it('successfully queries all tasks when orgId is provided', async () => {
      mockFindAll.mockResolvedValue([mockTask])

      const { result } = renderHook(() => useTasksQuery('org-1'), {
        wrapper: createWrapper(),
      })

      // Initially loading
      expect(result.current.isLoading).toBe(true)

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual([mockTask])
      expect(mockFindAll).toHaveBeenCalledTimes(1)
      expect(mockFindAll).toHaveBeenCalledWith('org-1', undefined)
    })

    it('does not run query (is disabled) if orgId is empty', () => {
      const { result } = renderHook(() => useTasksQuery(''), {
        wrapper: createWrapper(),
      })

      expect(result.current.isEnabled).toBe(false)
      expect(result.current.fetchStatus).toBe('idle')
      expect(mockFindAll).not.toHaveBeenCalled()
    })

    it('submits filters correctly to the API', async () => {
      mockFindAll.mockResolvedValue([])

      const filters = {
        search: 'testing-search',
        status: [TaskStatusEnum.PLANNED],
      }
      const { result } = renderHook(() => useTasksQuery('org-1', filters), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(mockFindAll).toHaveBeenCalledWith('org-1', filters)
    })
  })

  describe('useTaskQuery', () => {
    it('successfully queries a single task by ID', async () => {
      mockFindById.mockResolvedValue(mockTask)

      const { result } = renderHook(() => useTaskQuery('org-1', 'task-1'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockTask)
      expect(mockFindById).toHaveBeenCalledTimes(1)
      expect(mockFindById).toHaveBeenCalledWith('org-1', 'task-1')
    })

    it('does not execute query if orgId or id is missing', () => {
      const { result: missingOrg } = renderHook(
        () => useTaskQuery('', 'task-1'),
        {
          wrapper: createWrapper(),
        }
      )
      expect(missingOrg.current.fetchStatus).toBe('idle')

      const { result: missingId } = renderHook(
        () => useTaskQuery('org-1', ''),
        {
          wrapper: createWrapper(),
        }
      )
      expect(missingId.current.fetchStatus).toBe('idle')

      expect(mockFindById).not.toHaveBeenCalled()
    })
  })
})
