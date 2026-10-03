import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { describe, expect, it, vi } from 'vitest'
import { getTaskAction } from '../server'
import { DeleteTaskModal } from './delete-task-modal'

vi.mock('../server', () => ({
  getTaskAction: vi.fn(),
  deleteTaskAction: vi.fn(),
}))

describe('DeleteTaskModal', () => {
  it('should_show_only_loading_state_while_task_lookup_is_pending', () => {
    vi.mocked(getTaskAction).mockImplementation(() => new Promise(() => {}))
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <NuqsTestingAdapter searchParams='?delete-task=task-1' hasMemory>
          <DeleteTaskModal slug='org-1' />
        </NuqsTestingAdapter>
      </QueryClientProvider>
    )

    expect(
      screen.getByRole('alertdialog').querySelector('[aria-busy="true"]')
    ).toBeVisible()
    expect(screen.queryByText('Could not load task')).not.toBeInTheDocument()
  })

  it('should_keep_dialog_open_with_retry_when_task_lookup_fails', async () => {
    vi.mocked(getTaskAction).mockResolvedValue({
      success: false,
      error: 'Task unavailable',
    })
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <NuqsTestingAdapter searchParams='?delete-task=task-1' hasMemory>
          <DeleteTaskModal slug='org-1' />
        </NuqsTestingAdapter>
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Task unavailable')).toBeVisible()
    })
    expect(screen.getByRole('alertdialog')).toBeVisible()
    expect(screen.getByRole('button', { name: 'Retry' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'Delete' })).toBeDisabled()
  })
})
