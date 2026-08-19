'use client'

import { cn } from '@/shared/lib'
import { DataTable } from '@/shared/ui/data-table'
import { type Task } from '@/entities/task'
import { useTasksTableState } from '../model/use-tasks-table'
import { TaskTableBulkActions } from './task-table-bulk-actions'
import { tasksColumns } from './tasks-columns'

interface TasksTableViewProps {
  slug: string
  tasks: Task[]
  pageCount: number
}

export function TasksTableView({
  slug,
  tasks,
  pageCount,
}: TasksTableViewProps) {
  const table = useTasksTableState({
    data: tasks,
    columns: tasksColumns,
    pageCount,
  })

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16', // Add margin bottom to the table on mobile when the toolbar is visible
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTable table={table} />

      <TaskTableBulkActions slug={slug} table={table} />
    </div>
  )
}
