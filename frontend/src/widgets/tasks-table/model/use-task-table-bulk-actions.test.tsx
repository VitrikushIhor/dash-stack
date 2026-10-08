import { type ReactNode } from 'react'
import {
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { act, renderHook } from '@testing-library/react'
import { NuqsTestingAdapter } from 'nuqs/adapters/testing'
import { describe, expect, it, vi } from 'vitest'
import { type Task, TaskStatusEnum } from '@/entities/task'
import {
  bulkDeleteTasksAction,
  bulkUpdateTasksAction,
} from '@/features/manage-task/server'
import { useTaskTableBulkActions } from './use-task-table-bulk-actions'

vi.mock('@/features/manage-task/server', () => ({
  bulkDeleteTasksAction: vi.fn(),
  bulkUpdateTasksAction: vi.fn(),
}))

const task: Task = {
  id: 'task-1',
  title: 'Task one',
  status: TaskStatusEnum.PLANNED,
  attachments: [],
  organizationId: 'org-1',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  assignees: [],
  label: null,
}

const wrapper = ({ children }: { children: ReactNode }) => (
  <NuqsTestingAdapter hasMemory>{children}</NuqsTestingAdapter>
)

describe('useTaskTableBulkActions', () => {
  it('should_update_selected_task_status_when_requested', async () => {
    vi.mocked(bulkUpdateTasksAction).mockResolvedValue({
      success: true,
      data: undefined,
    })

    const { result } = renderHook(
      () => {
        const table = useReactTable({
          data: [task],
          columns: [],
          initialState: { rowSelection: { '0': true } },
          getCoreRowModel: getCoreRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
        })

        return useTaskTableBulkActions('org-1', table)
      },
      { wrapper }
    )

    await act(async () => {
      await result.current.handleBulkStatusChange(TaskStatusEnum.COMPLETED)
    })

    expect(bulkUpdateTasksAction).toHaveBeenCalledWith({
      slug: 'org-1',
      ids: ['task-1'],
      data: { status: TaskStatusEnum.COMPLETED },
    })
  })

  it('should_delete_selected_task_when_confirmed', async () => {
    vi.mocked(bulkDeleteTasksAction).mockResolvedValue({
      success: true,
      data: undefined,
    })

    const { result } = renderHook(
      () => {
        const table = useReactTable({
          data: [task],
          columns: [],
          initialState: { rowSelection: { '0': true } },
          getCoreRowModel: getCoreRowModel(),
          getFilteredRowModel: getFilteredRowModel(),
        })

        return useTaskTableBulkActions('org-1', table)
      },
      { wrapper }
    )

    await act(async () => {
      await result.current.handleBulkDelete()
    })

    expect(bulkDeleteTasksAction).toHaveBeenCalledWith({
      slug: 'org-1',
      ids: ['task-1'],
    })
  })
})
