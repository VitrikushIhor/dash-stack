import { getRouteApi } from '@tanstack/react-router'
import { cn } from '@/shared/lib/utils'
import { DataTable } from '@/shared/ui/components/data-table/data-table'
import { DataTableToolbar } from '@/shared/ui/components/data-table/toolbar'
import { type Task } from '@/entities/task'
import { useTasksTable } from '@/features/task/model/hooks/useTasksTable'

type DataTableProps = {
  data: Task[]
}

export function TasksTable({ data }: DataTableProps) {
  const { table, filterOptions } = useTasksTable({ data })

  return (
    <div
      className={cn(
        'max-sm:has-[div[role="toolbar"]]:mb-16', // Add margin bottom to the table on mobile when the toolbar is visible
        'flex flex-1 flex-col gap-4'
      )}
    >
      <DataTableToolbar
        table={table}
        searchPlaceholder='Filter by title or desc...'
        filters={[
          {
            columnId: 'status',
            title: 'Status',
            options: filterOptions.statuses,
          },
          {
            columnId: 'assignedLabels',
            title: 'Label',
            options: filterOptions.labels,
          },
          {
            columnId: 'assignedMembers',
            title: 'Members',
            options: filterOptions.members,
          },
        ]}
        dateFilters={[
          {
            columnId: 'deadline',
            title: 'Deadline',
            type: 'range',
          },
        ]}
      />
      <DataTable table={table} />
    </div>
  )
}
