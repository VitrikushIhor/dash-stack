import { type ReactNode } from 'react'
import { act, render, screen } from '@testing-library/react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type Task } from '@/entities/task'
import { updateTaskAction } from '@/features/manage-task/server'
import { CalendarViewClient } from './calendar-view-client'

let taskUpdate: ((id: string, data: Partial<Task>) => Promise<boolean>) | null =
  null
let renderCalendarChildren = false

vi.mock('sonner', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}))
vi.mock('@/features/manage-task/server', () => ({ updateTaskAction: vi.fn() }))
vi.mock('@/features/manage-task/model/task-search-params', () => ({
  useTaskSearchParams: () => [{}, vi.fn()],
}))
vi.mock('@/features/task-calendar', () => ({
  useCalendarSearchParams: () => [{ date: null }, vi.fn()],
  CalendarView: ({ view, tasks }: { view: string; tasks: Task[] }) => (
    <div data-testid='calendar-view'>
      {view}:{tasks.length}
    </div>
  ),
  CalendarHeader: () => null,
  DndProviderWrapper: ({
    onTaskUpdate,
    children,
    tasks,
  }: {
    onTaskUpdate: (id: string, data: Partial<Task>) => Promise<boolean>
    children: (tasks: Task[]) => ReactNode
    tasks: Task[]
  }) => {
    taskUpdate = onTaskUpdate

    return renderCalendarChildren ? children(tasks) : null
  },
}))

describe('CalendarViewClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    taskUpdate = null
    renderCalendarChildren = false
  })

  it('should_select_calendar_view_with_the_requested_mode', () => {
    renderCalendarChildren = true

    render(<CalendarViewClient slug='acme' tasks={[]} view='year' />)

    expect(screen.getByTestId('calendar-view')).toHaveTextContent('year:0')
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
