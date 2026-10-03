import { type Table } from '@tanstack/react-table'
import { CircleArrowUp, Trash2 } from 'lucide-react'
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
import { STATUS_CONFIG, type Task } from '@/entities/task'
import { useTaskTableBulkActions } from '../model/use-task-table-bulk-actions'
import { TasksBulkDeleteDialog } from './tasks-bulk-delete-dialog'

type TaskTableBulkActionsProps = {
  slug: string
  table: Table<Task>
}

export function TaskTableBulkActions({
  slug,
  table,
}: TaskTableBulkActionsProps) {
  const {
    isUpdating,
    isDeleting,
    openDeleteConfirm,
    handleBulkStatusChange,
    handleBulkDelete,
  } = useTaskTableBulkActions(slug, table)

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
              onClick={openDeleteConfirm}
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

      <TasksBulkDeleteDialog table={table} handleDelete={handleBulkDelete} />
    </>
  )
}
