import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { CircleArrowUp, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { sleep } from '@/shared/lib/utils'
import { DataTableBulkActions } from '@/shared/ui/components/data-table/bulk-actions'
import { Button } from '@/shared/ui/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/components/ui/tooltip'
import { type TaskStatusEnum, type Task } from '@/entities/task'
import { STATUS_CONFIG, useTaskStore } from '@/features/task'
import { TasksBulkDeleteDialog } from './tasks-bulk-delete-dialog'

type TaskTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function TaskTableBulkActions<TData>({
  table,
}: TaskTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const { updateTask, deleteTask } = useTaskStore()
  const handleBulkStatusChange = (status: string) => {
    const selectedTasks = selectedRows.map((row) => row.original as Task)
    selectedTasks.forEach((task) => {
      updateTask(task.id, { status: status as TaskStatusEnum })
    })
    toast.promise(sleep(2000), {
      loading: 'Updating status...',
      success: () => {
        table.resetRowSelection()
        return `Status updated to "${status}" for ${selectedTasks.length} task${selectedTasks.length > 1 ? 's' : ''}.`
      },
      error: 'Error',
    })
    table.resetRowSelection()
  }

  const handleBulkDelete = () => {
    const selectedTasks = selectedRows.map((row) => row.original as Task)
    selectedTasks.forEach((task) => {
      deleteTask(task.id)
    })
    toast.promise(sleep(2000), {
      loading: 'Deleting tasks...',
      success: () => {
        table.resetRowSelection()
        return `Deleted ${selectedRows.length} ${
          selectedRows.length > 1 ? 'tasks' : 'task'
        }`
      },
      error: 'Error',
    })
    table.resetRowSelection()
    setShowDeleteConfirm(false)
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
