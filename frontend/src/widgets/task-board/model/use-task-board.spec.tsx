import { act, renderHook } from '@testing-library/react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { type Task, TaskStatusEnum } from '@/entities/task'
import { updateTaskAction } from '@/features/manage-task/server'
import { useTaskBoard } from './use-task-board'

// --- Mocks ---
vi.mock('@/features/manage-task/server', () => ({
  updateTaskAction: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    error: vi.fn(),
  },
}))

// --- Test Data ---
const mockTask: Task = {
  id: 'task-1',
  title: 'Task 1',
  status: TaskStatusEnum.PLANNED,
  dueDate: '2026-06-10T12:00:00Z',
  attachments: [],
  organizationId: 'org-1',
  createdAt: '',
  updatedAt: '',
  assignees: [],
  label: { id: 'l1', name: 'Low', color: 'blue' as const },
}

const mockTasks = [mockTask]

describe('useTaskBoard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with grouped tasks', () => {
    const { result } = renderHook(() => useTaskBoard(mockTasks))
    expect(result.current.displayColumns[TaskStatusEnum.PLANNED]).toHaveLength(
      1
    )
    expect(result.current.displayColumns[TaskStatusEnum.UPCOMING]).toHaveLength(
      0
    )
  })

  it('updates dragState on handleValueChange', () => {
    const { result } = renderHook(() => useTaskBoard(mockTasks))

    act(() => {
      result.current.handleValueChange({
        ...result.current.displayColumns,
        [TaskStatusEnum.PLANNED]: [],
        [TaskStatusEnum.UPCOMING]: [mockTask],
      })
    })

    expect(result.current.displayColumns[TaskStatusEnum.PLANNED]).toHaveLength(
      0
    )
    expect(result.current.displayColumns[TaskStatusEnum.UPCOMING]).toHaveLength(
      1
    )
  })

  it('cancels drag and reverts state on handleDragCancel', () => {
    const { result } = renderHook(() => useTaskBoard(mockTasks))

    act(() => {
      result.current.handleDragStart()
      result.current.handleValueChange({
        ...result.current.displayColumns,
        [TaskStatusEnum.PLANNED]: [],
        [TaskStatusEnum.UPCOMING]: [mockTask],
      })
    })

    expect(result.current.displayColumns[TaskStatusEnum.UPCOMING]).toHaveLength(
      1
    )

    act(() => {
      result.current.handleDragCancel()
    })

    // Should revert back to initial
    expect(result.current.displayColumns[TaskStatusEnum.PLANNED]).toHaveLength(
      1
    )
    expect(result.current.displayColumns[TaskStatusEnum.UPCOMING]).toHaveLength(
      0
    )
  })

  it('optimistically updates and calls updateTaskAction on handleDragEnd', async () => {
    let resolveAction: (val: unknown) => void
    const actionPromise = new Promise((resolve) => {
      resolveAction = resolve
    })
    vi.mocked(updateTaskAction).mockReturnValue(
      actionPromise as unknown as ReturnType<typeof updateTaskAction>
    )

    const { result } = renderHook(() => useTaskBoard(mockTasks, 'org-1'))

    act(() => {
      result.current.handleDragStart()
      result.current.handleValueChange({
        ...result.current.displayColumns,
        [TaskStatusEnum.PLANNED]: [],
        [TaskStatusEnum.UPCOMING]: [mockTask],
      })
    })

    act(() => {
      result.current.handleDragEnd()
    })

    expect(updateTaskAction).toHaveBeenCalledWith({
      slug: 'org-1',
      id: 'task-1',
      data: { status: TaskStatusEnum.UPCOMING },
    })

    // Optimistic state remains while pending
    expect(result.current.displayColumns[TaskStatusEnum.UPCOMING]).toHaveLength(
      1
    )

    await act(async () => {
      resolveAction!({ success: true, data: mockTask })
    })
  })

  it('reverts optimistic state and shows toast on failed updateTaskAction', async () => {
    vi.mocked(updateTaskAction).mockResolvedValue({
      success: false,
      error: 'Failed',
    })

    const { result } = renderHook(() => useTaskBoard(mockTasks, 'org-1'))

    act(() => {
      result.current.handleDragStart()
      result.current.handleValueChange({
        ...result.current.displayColumns,
        [TaskStatusEnum.PLANNED]: [],
        [TaskStatusEnum.UPCOMING]: [mockTask],
      })
    })

    await act(async () => {
      result.current.handleDragEnd()
    })

    expect(updateTaskAction).toHaveBeenCalled()
    expect(toast.error).toHaveBeenCalledWith('Failed to move task')

    // Should revert back to initial since it failed
    expect(result.current.displayColumns[TaskStatusEnum.PLANNED]).toHaveLength(
      1
    )
    expect(result.current.displayColumns[TaskStatusEnum.UPCOMING]).toHaveLength(
      0
    )
  })
})
