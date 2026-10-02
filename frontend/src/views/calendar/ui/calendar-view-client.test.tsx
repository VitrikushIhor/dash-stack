import { act, render } from '@testing-library/react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type Task } from '@/entities/task'
import { updateTaskAction } from '@/features/manage-task/server'
import { CalendarViewClient } from './calendar-view-client'

let taskUpdate: ((id: string, data: Partial<Task>) => Promise<boolean>) | null =
  null

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))
vi.mock('@/features/manage-task/server', () => ({ updateTaskAction: vi.fn() }))
vi.mock('@/features/manage-task/model/task-search-params', () => ({
  useTaskSearchParams: () => [{}, vi.fn()],
}))
vi.mock('@/features/task-calendar', () => ({
  useCalendarSearchParams: () => [{ date: null }, vi.fn()],
  DndProviderWrapper: ({
    onTaskUpdate,
  }: {
    onTaskUpdate: (id: string, data: Partial<Task>) => Promise<boolean>
  }) => {
    taskUpdate = onTaskUpdate

    return null
  },
}))

describe('CalendarViewClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    taskUpdate = null
  })

  it('should_report_failed_update_once_and_return_failure_for_rollback', async () => {
    vi.mocked(updateTaskAction).mockResolvedValue({
      success: false,
      error: 'Could not update task',
    })
    render(<CalendarViewClient slug='acme' tasks={[]} view='month' />)

    let saved: boolean | undefined
    await act(async () => {
      saved = await taskUpdate?.('task-1', {
        dueDate: '2026-10-02T00:00:00.000Z',
      })
    })

    expect(saved).toBe(false)
    expect(toast.error).toHaveBeenCalledExactlyOnceWith('Could not update task')
  })
})
