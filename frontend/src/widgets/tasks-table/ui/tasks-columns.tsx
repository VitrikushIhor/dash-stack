import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { Calendar, ListTodo, Paperclip, Tag, Users } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { AvatarGroup } from '@/shared/ui/components/avatar-group'
import { DataTableColumnHeader } from '@/shared/ui/components/data-table'
import { dateRangeFilterFn } from '@/shared/ui/components/data-table/date-range-filter'
import { TablePlaceholder } from '@/shared/ui/components/data-table/table-placeholder'
import { LabelBadge } from '@/shared/ui/components/label/label-badge'
import { Checkbox } from '@/shared/ui/components/ui/checkbox'
import {
  type TaskStatusEnum,
  type Task,
  type TaskLabel,
  type TaskAssignee,
  calculateTaskProgress,
  isTaskOverdue as checkOverdue,
} from '@/entities/task'
import { TaskStatusBadge } from '@/features/task'
import { TaskTableRowActions } from './task-table-row-actions'

export const tasksColumns: ColumnDef<Task>[] = [
  {
    id: 'select',
    maxSize: 20,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && 'indeterminate')
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label='Select all'
        className='translate-y-[2px]'
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label='Select row'
        className='translate-y-[2px]'
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'title',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Title' />
    ),
    cell: ({ row }) => (
      <div className='flex space-x-2'>
        <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
          {row.getValue<string>('title')}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => (
      <div className='flex space-x-2'>
        <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
          {row.getValue<string>('description')}
        </span>
      </div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => (
      <div className='flex w-[100px] items-center gap-2'>
        <TaskStatusBadge status={row.getValue<TaskStatusEnum>('status')} />
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },

  {
    accessorKey: 'label',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Label' />
    ),
    meta: { name: 'Label' },
    cell: ({ row }) => {
      const label = row.original.label ?? null

      if (!label) {
        return (
          <TablePlaceholder
            icon={<Tag className='h-4 w-4' />}
            label='No Label'
          />
        )
      }

      return (
        <div className='flex w-[100px] flex-wrap items-center gap-1'>
          <LabelBadge key={label.id} label={label} size='sm' />
        </div>
      )
    },
    filterFn: (row, columnId, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) return true
      const label = row.getValue<TaskLabel | null>(columnId)
      if (!label) return false
      return filterValue.includes(label.name)
    },
  },

  {
    accessorKey: 'assignees',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Team Members' />
    ),
    meta: { name: 'Team Members' },
    cell: ({ row }) => {
      const assignees = row.original.assignees ?? []

      if (assignees.length === 0) {
        return (
          <TablePlaceholder
            icon={<Users className='h-4 w-4' />}
            label='No members'
          />
        )
      }

      return (
        <div className='flex w-[100px] items-center gap-2'>
          <AvatarGroup members={assignees} max={4} size='m' />
        </div>
      )
    },
    filterFn: (row, id, value: string[]) => {
      const assignees = row.getValue<TaskAssignee[]>(id)

      if (!assignees || assignees.length === 0) {
        return false
      }

      return value.some((selectedId) =>
        assignees.some((member) => member.id === selectedId)
      )
    },
  },

  {
    accessorKey: 'attachments',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Attachments' />
    ),
    cell: ({ row }) => {
      const attachments = row.original.attachments ?? []
      if (attachments.length === 0) {
        return (
          <TablePlaceholder
            icon={<Paperclip className='h-4 w-4' />}
            label='No Attachments'
          />
        )
      }
      return (
        <div className='flex w-[100px] items-center gap-2'>
          <Paperclip className='h-4 w-4' aria-hidden='true' />
          <span className='text-muted-foreground text-xs'>
            {attachments.length}
          </span>
        </div>
      )
    },
  },

  {
    accessorKey: 'checklists',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Checklists' />
    ),
    cell: ({ row }) => {
      const { totalItems, completedItems } = calculateTaskProgress(row.original)

      if (totalItems === 0) {
        return (
          <TablePlaceholder
            icon={<ListTodo className='h-4 w-4' />}
            label='No Checklists'
          />
        )
      }
      return (
        <div className='flex w-[100px] items-center gap-2'>
          <ListTodo className='text-muted-foreground h-4 w-4' />
          <span className='text-muted-foreground text-xs'>
            {completedItems}/{totalItems}
          </span>
        </div>
      )
    },
  },

  {
    accessorKey: 'deadline',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Deadline' />
    ),
    cell: ({ row }) => {
      const deadline = row.original.deadline ?? null
      const isOverdue = checkOverdue(row.original)

      if (!deadline) {
        return (
          <TablePlaceholder
            icon={<Calendar className='h-4 w-4' />}
            label='No Deadline'
          />
        )
      }
      return (
        <div className='flex w-[100px] items-center gap-2'>
          <Calendar
            className={cn(
              'h-4 w-4',
              isOverdue ? 'font-medium text-red-600' : 'text-muted-foreground'
            )}
          />
          <span className='text-muted-foreground text-xs'>
            {format(new Date(deadline), 'dd.MM.yyyy')}
          </span>
        </div>
      )
    },
    filterFn: dateRangeFilterFn,
  },

  {
    id: 'actions',
    cell: ({ row }) => <TaskTableRowActions row={row} />,
  },
]
