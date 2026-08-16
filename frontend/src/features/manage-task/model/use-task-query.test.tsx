import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type Task, TaskStatusEnum } from '@/entities/task'
import { getTaskAction } from '../server'
import { useTaskQuery } from './use-task-query'

vi.mock('../server', () => ({
  getTaskAction: vi.fn(),
}))

const mockTask: Task = {
  id: 'task-1',
  title: 'Test Task',
  status: TaskStatusEnum.PLANNED,
  dueDate: '2026-06-10T12:00:00Z',
  attachments: [],
  organizationId: 'org-1',
  createdAt: '',
  updatedAt: '',
  assignees: [],
  label: { id: 'l1', name: 'Low', color: 'blue' },
}

describe('useTaskQuery', () => {
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

  it('successfully queries a single task by ID using getTaskAction', async () => {
    vi.mocked(getTaskAction).mockResolvedValue({
      success: true,
      data: mockTask,
    })

    const { result } = renderHook(() => useTaskQuery('task-1'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockTask)
    expect(getTaskAction).toHaveBeenCalledTimes(1)
    expect(getTaskAction).toHaveBeenCalledWith({ id: 'task-1' })
  })

  it('does not execute query if id is null or empty', () => {
    const { result: nullId } = renderHook(() => useTaskQuery(null), {
      wrapper: createWrapper(),
    })
    expect(nullId.current.fetchStatus).toBe('idle')

    const { result: emptyId } = renderHook(() => useTaskQuery(''), {
      wrapper: createWrapper(),
    })
    expect(emptyId.current.fetchStatus).toBe('idle')

    expect(getTaskAction).not.toHaveBeenCalled()
  })

  it('handles error response from getTaskAction', async () => {
    vi.mocked(getTaskAction).mockResolvedValue({
      success: false,
      error: 'Task not found',
    })

    const { result } = renderHook(() => useTaskQuery('task-404'), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
    expect(result.current.error?.message).toBe('Task not found')
  })
})
