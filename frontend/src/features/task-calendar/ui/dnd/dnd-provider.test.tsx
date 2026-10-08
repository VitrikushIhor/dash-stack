import { type DndContextProps, type DragEndEvent } from '@dnd-kit/core'
import { act, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type Task } from '@/entities/task'
import { DndProviderWrapper } from './dnd-provider'

const boundary = vi.hoisted(
  (): { onDragEnd?: DndContextProps['onDragEnd'] } => ({})
)

vi.mock('@dnd-kit/core', async (importOriginal) => {
  const original = await importOriginal<typeof import('@dnd-kit/core')>()
  return {
    ...original,
    DndContext: (props: DndContextProps) => {
      boundary.onDragEnd = props.onDragEnd
      return <original.DndContext {...props} />
    },
  }
})

const { handleServerError } = vi.hoisted(() => ({ handleServerError: vi.fn() }))
vi.mock('@/shared/api', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/api')>()),
  handleServerError,
}))

const oldDate = new Date(2026, 9, 5, 9, 30, 12, 123)
const targetDate = new Date(2026, 9, 6)
const newDate = new Date(2026, 9, 6, 9, 30, 12, 123)
const task: Task = {
  id: 'task-1',
  title: 'Deadline',
  status: 'PLANNED',
  attachments: [],
  assignees: [],
  label: null,
  organizationId: 'org-1',
  createdAt: oldDate.toISOString(),
  updatedAt: oldDate.toISOString(),
  dueDate: oldDate.toISOString(),
}

function dragEvent(taskId = task.id, date = targetDate): DragEndEvent {
  return {
    activatorEvent: new Event('pointerup'),
    collisions: null,
    delta: { x: 0, y: 0 },
    active: {
      id: `task-${taskId}`,
      data: { current: { type: 'task', taskId } },
      rect: { current: { initial: null, translated: null } },
    },
    over: {
      id: 'target',
      disabled: false,
      data: { current: { type: 'day', date } },
      rect: {
        top: 0,
        left: 0,
        right: 100,
        bottom: 100,
        width: 100,
        height: 100,
      },
    },
  }
}

describe('calendar drag and drop', () => {
  beforeEach(() => vi.clearAllMocks())

  it('should_preserve_local_time_and_roll_back_when_saving_fails', async () => {
    let finish: ((saved: boolean) => void) | undefined
    const save = vi.fn(
      () =>
        new Promise<boolean>((resolve) => {
          finish = resolve
        })
    )
    render(
      <DndProviderWrapper tasks={[task]} onTaskUpdate={save}>
        {(tasks) => <output data-testid='date'>{tasks[0].dueDate}</output>}
      </DndProviderWrapper>
    )

    act(() => boundary.onDragEnd?.(dragEvent()))

    expect(save).toHaveBeenCalledExactlyOnceWith(task.id, {
      dueDate: newDate.toISOString(),
    })
    expect(screen.getByTestId('date')).toHaveTextContent(newDate.toISOString())
    await act(async () => finish?.(false))
    await waitFor(() =>
      expect(screen.getByTestId('date')).toHaveTextContent(
        oldDate.toISOString()
      )
    )
  })

  it('should_surface_exception_and_restore_date_when_saving_throws', async () => {
    const error = new Error('Offline')
    const save = vi.fn().mockRejectedValue(error)
    render(
      <DndProviderWrapper tasks={[task]} onTaskUpdate={save}>
        {(tasks) => <output data-testid='date'>{tasks[0].dueDate}</output>}
      </DndProviderWrapper>
    )

    await act(async () => boundary.onDragEnd?.(dragEvent()))

    expect(handleServerError).toHaveBeenCalledExactlyOnceWith(error)
    expect(screen.getByTestId('date')).toHaveTextContent(oldDate.toISOString())
  })

  it('should_ignore_unknown_tasks_and_same_date_drops_when_no_update_is_needed', () => {
    const save = vi.fn().mockResolvedValue(true)
    render(
      <DndProviderWrapper tasks={[task]} onTaskUpdate={save}>
        {() => null}
      </DndProviderWrapper>
    )

    act(() => boundary.onDragEnd?.(dragEvent('unknown')))
    act(() => boundary.onDragEnd?.(dragEvent(task.id, oldDate)))

    expect(save).not.toHaveBeenCalled()
  })
})
