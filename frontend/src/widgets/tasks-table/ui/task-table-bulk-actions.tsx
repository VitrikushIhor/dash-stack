import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { CircleArrowUp, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAction } from '@/shared/lib'
import { Button } from '@/shared/ui/core/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/core/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/core/tooltip'
import { DataTableBulkActions } from '@/shared/ui/data-table'
import { STATUS_CONFIG, type Task, type TaskStatusEnum } from '@/entities/task'
import {
  bulkDeleteTasksAction,
  bulkUpdateTasksAction,
} from '@/features/manage-task/server'
import { TasksBulkDeleteDialog } from './tasks-bulk-delete-dialog'

type TaskTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function TaskTableBulkActions<TData>({
  table,
}: TaskTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const { execute: executeBulkUpdate, isPending: isUpdating } = useAction(
    bulkUpdateTasksAction,
    {
      onSuccess: () => table.resetRowSelection(),
    }
  )

  const { execute: executeBulkDelete, isPending: isDeleting } = useAction(
    bulkDeleteTasksAction,
    {
      onSuccess: () => {
        table.resetRowSelection()
        setShowDeleteConfirm(false)
      },
    }
  )

  const handleBulkStatusChange = async (status: string) => {
    const selectedIds = selectedRows.map((row) => (row.original as Task).id)
    const toastId = toast.loading('Updating status...')

    const result = await executeBulkUpdate({
      ids: selectedIds,
      data: { status: status as TaskStatusEnum },
    })

    if (result !== undefined) {
      toast.success(
        `Status updated to "${status}" for ${selectedIds.length} task${selectedIds.length > 1 ? 's' : ''}.`,
        { id: toastId }
      )
    } else {
      toast.dismiss(toastId)
    }
  }

  const handleBulkDelete = async () => {
    const selectedIds = selectedRows.map((row) => (row.original as Task).id)
    const toastId = toast.loading('Deleting tasks...')

    const result = await executeBulkDelete(selectedIds)

    if (result !== undefined) {
      toast.success(
        `Deleted ${selectedIds.length} ${selectedIds.length > 1 ? 'tasks' : 'task'}`,
        { id: toastId }
      )
    } else {
      toast.dismiss(toastId)
    }
  }

  return (
    <>
      <DataTableBulkActions table={table} entityName='task'>
        <DropdownMenu>
          <Tooltip>
            <TooltipTrigger asChild>
              <DropdownMenuTrigger asChild>
                <Button
                  variant='outline'
                  size='icon'
                  className='size-8'
                  aria-label='Update status'
                  title='Update status'
                  disabled={isUpdating}
                >
                  <CircleArrowUp />
                  <span className='sr-only'>Update status</span>
                </Button>
              </DropdownMenuTrigger>
            </TooltipTrigger>
            <TooltipContent>
              <p>Update status</p>
            </TooltipContent>
          </Tooltip>
          <DropdownMenuContent sideOffset={14}>
            {Object.values(STATUS_CONFIG).map((config) => (
              <DropdownMenuItem
                key={config.label}
                defaultValue={config.label}
                onClick={() => handleBulkStatusChange(config.value)}
              >
                {config.icon && (
                  <config.icon className='text-muted-foreground size-4' />
                )}
                {config.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='destructive'
              size='icon'
              onClick={() => setShowDeleteConfirm(true)}
              className='size-8'
              aria-label='Delete selected tasks'
              title='Delete selected tasks'
              disabled={isDeleting}
            >
              <Trash2 />
              <span className='sr-only'>Delete selected tasks</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Delete selected tasks</p>
          </TooltipContent>
        </Tooltip>
      </DataTableBulkActions>

      <TasksBulkDeleteDialog
        open={showDeleteConfirm}
        onOpenChange={(open) => {
          setShowDeleteConfirm(!open)
        }}
        table={table}
        handleDelete={handleBulkDelete}
      />
    </>
  )
}
