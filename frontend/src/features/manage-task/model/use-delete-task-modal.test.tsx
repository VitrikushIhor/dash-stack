import { type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { describe, expect, it, vi } from 'vitest'
import { deleteTaskAction, getTaskAction } from '../server'
import { useDeleteTaskModal } from './use-delete-task-modal'

vi.mock('../server', () => ({
  getTaskAction: vi.fn(),
  deleteTaskAction: vi.fn(),
}))

describe('useDeleteTaskModal', () => {
  it('should_delete_selected_task_when_confirmed', async () => {
    vi.mocked(getTaskAction).mockResolvedValue({
      success: true,
      data: { id: 'task-1', title: 'Task one' },
    } as Awaited<ReturnType<typeof getTaskAction>>)
    vi.mocked(deleteTaskAction).mockResolvedValue({
      success: true,
      data: undefined,
    })
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        <NuqsTestingAdapter searchParams='?delete-task=task-1' hasMemory>
          {children}
        </NuqsTestingAdapter>
      </QueryClientProvider>
    )

    const { result } = renderHook(() => useDeleteTaskModal('org-1'), {
      wrapper,
    })

    await waitFor(() => expect(result.current.selectedTask?.id).toBe('task-1'))
    await act(async () => result.current.handleDelete())

    expect(deleteTaskAction).toHaveBeenCalledWith({
      slug: 'org-1',
      id: 'task-1',
    })
    await waitFor(() => expect(result.current.isOpen).toBe(false))
  })
})
