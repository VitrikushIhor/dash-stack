import { type Table } from '@tanstack/react-table'
import { cn } from '@/shared/lib/utils'
import { DataTable } from '@/shared/ui'
import { type Task } from '@/entities/task'
import { TaskTableBulkActions } from './task-table-bulk-actions'

type DataTableProps = {
  table: Table<Task>
}

export function TasksTable({ table }: DataTableProps) {
  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16', // Add margin bottom to the table on mobile when the toolbar is visible
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTable table={table} />

      <TaskTableBulkActions table={table} />
    </div>
  )
}
