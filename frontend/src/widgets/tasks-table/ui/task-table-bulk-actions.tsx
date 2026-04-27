import { useState } from 'react'
import { type Table } from '@tanstack/react-table'
import { CircleArrowUp, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
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
import { useOrgStore } from '@/features/organization'
import {
  STATUS_CONFIG,
  useBulkUpdateTasks,
  useBulkDeleteTasks,
} from '@/features/task'
import { TasksBulkDeleteDialog } from './tasks-bulk-delete-dialog'

type TaskTableBulkActionsProps<TData> = {
  table: Table<TData>
}

export function TaskTableBulkActions<TData>({
  table,
}: TaskTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const selectedRows = table.getFilteredSelectedRowModel().rows

  const { activeOrgId } = useOrgStore()
  const { mutateAsync: bulkUpdate } = useBulkUpdateTasks(activeOrgId || '')
  const { mutateAsync: bulkDelete } = useBulkDeleteTasks(activeOrgId || '')

  const handleBulkStatusChange = async (status: string) => {
    if (!activeOrgId) {
      toast.error('No organization selected')
      return
    }

    const selectedIds = selectedRows.map((row) => (row.original as Task).id)

    toast.promise(
      bulkUpdate({
        ids: selectedIds,
        data: { status: status as TaskStatusEnum },
      }),
      {
        loading: 'Updating status...',
        success: () => {
          table.resetRowSelection()
          return `Status updated to "${status}" for ${selectedIds.length} task${selectedIds.length > 1 ? 's' : ''}.`
        },
        error: 'Failed to update tasks',
      }
    )
  }

  const handleBulkDelete = async () => {
    if (!activeOrgId) {
      toast.error('No organization selected')
      return
    }

    const selectedIds = selectedRows.map((row) => (row.original as Task).id)

    toast.promise(bulkDelete(selectedIds), {
      loading: 'Deleting tasks...',
      success: () => {
        table.resetRowSelection()
        setShowDeleteConfirm(false)
        return `Deleted ${selectedIds.length} ${
          selectedIds.length > 1 ? 'tasks' : 'task'
        }`
      },
      error: 'Failed to delete tasks',
    })
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
                  disabled={!activeOrgId}
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
              disabled={!activeOrgId}
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
