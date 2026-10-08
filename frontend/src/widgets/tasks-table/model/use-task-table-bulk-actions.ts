'use client'

import { type Table } from '@tanstack/react-table'
import { useQueryState } from 'nuqs'
import { parseAsBoolean } from 'nuqs/server'
import { toast } from 'sonner'
import { useAction } from '@/shared/lib'
import { type Task, type TaskStatusEnum } from '@/entities/task'
import {
  bulkDeleteTasksAction,
  bulkUpdateTasksAction,
} from '@/features/manage-task/server'

export function useTaskTableBulkActions(slug: string, table: Table<Task>) {
  const [, setDeleteConfirm] = useQueryState(
    'delete-selected-tasks',
    parseAsBoolean.withDefault(false)
  )

  const { execute: executeBulkUpdate, isPending: isUpdating } = useAction(
    bulkUpdateTasksAction,
    { onSuccess: () => table.resetRowSelection() }
  )

  const { execute: executeBulkDelete, isPending: isDeleting } = useAction(
    bulkDeleteTasksAction,
    {
      onSuccess: () => {
        table.resetRowSelection()
        void setDeleteConfirm(false)
      },
    }
  )

  const selectedIds = () =>
    table.getFilteredSelectedRowModel().rows.map((row) => row.original.id)

  const handleBulkStatusChange = async (status: TaskStatusEnum) => {
    if (!slug) return
    const ids = selectedIds()
    const toastId = toast.loading('Updating status...')

    const result = await executeBulkUpdate({
      slug,
      ids,
      data: { status },
    })

    if (result !== undefined) {
      toast.success(
        `Status updated to "${status}" for ${ids.length} task${ids.length > 1 ? 's' : ''}.`,
        { id: toastId }
      )
    } else {
      toast.dismiss(toastId)
    }
  }

  const handleBulkDelete = async () => {
    if (!slug) return
    const ids = selectedIds()
    const toastId = toast.loading('Deleting tasks...')

    const result = await executeBulkDelete({ slug, ids })

    if (result !== undefined) {
      toast.success(
        `Deleted ${ids.length} ${ids.length > 1 ? 'tasks' : 'task'}`,
        { id: toastId }
      )
    } else {
      toast.dismiss(toastId)
    }
  }

  return {
    isUpdating,
    isDeleting,
    openDeleteConfirm: () => void setDeleteConfirm(true),
    handleBulkStatusChange,
    handleBulkDelete,
  }
}
