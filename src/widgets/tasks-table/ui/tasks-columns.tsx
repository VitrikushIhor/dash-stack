import { format } from 'date-fns'
import { type ColumnDef } from '@tanstack/react-table'
import { Calendar, ListTodo, Paperclip, Tag, Users } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { AvatarGroup } from '@/shared/ui/components/avatar-group'
import { DataTableColumnHeader } from '@/shared/ui/components/data-table'
import { dateRangeFilterFn } from '@/shared/ui/components/data-table/date-range-filter'
import { LabelBadge } from '@/shared/ui/components/label/label-badge'
import { type Label } from '@/shared/ui/components/label/types.label'
import { Checkbox } from '@/shared/ui/components/ui/checkbox'
import { TaskStatusEnum, type Task } from '@/entities/task'
import { type TeamMember } from '@/entities/team'
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
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('title')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'description',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Description' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex space-x-2'>
          <span className='max-w-32 truncate font-medium sm:max-w-72 md:max-w-[31rem]'>
            {row.getValue('description')}
          </span>
        </div>
      )
    },
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => {
      return (
        <div className='flex w-[100px] items-center gap-2'>
          <TaskStatusBadge status={row.getValue('status')} />
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },

  {
    accessorKey: 'assignedLabels',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Label' />
    ),
    meta: { name: 'Label' },
    cell: ({ row }) => {
      const assignedLabels = row.original.assignedLabels

      if (assignedLabels?.length === 0) {
        return (
          <div className='flex w-[100px] items-center gap-2'>
            <span
              className='text-muted-foreground flex items-center gap-2 text-sm'
              tabIndex={0}
              aria-label='No checklists'
              role='note'
            >
              <Tag className='h-4 w-4' aria-hidden='true' />
              <span>No Labels</span>
            </span>
          </div>
        )
      }

      return (
        <div className='flex w-[100px] items-center gap-2'>
          {assignedLabels?.map((label) => (
            <LabelBadge key={label.id} label={label} size='sm' />
          ))}
        </div>
      )
    },
    filterFn: (row, columnId, filterValue: string[]) => {
      if (!filterValue || filterValue.length === 0) return true
      const assignedLabels = row.getValue(columnId) as Label[]
      return (
        assignedLabels?.some((label) => filterValue.includes(label.name)) ??
        false
      )
    },
  },

  {
    accessorKey: 'assignedMembers',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Team Members' />
    ),
    meta: { name: 'Team Members' },
    cell: ({ row }) => {
      const assignedMembers = row.original.assignedMembers ?? []

      if (assignedMembers.length === 0) {
        return (
          <div className='flex w-[100px] items-center gap-2'>
            <span
              className='text-muted-foreground flex items-center gap-2 text-sm'
              tabIndex={0}
              aria-label='No team members'
              role='note'
            >
              <Users className='h-4 w-4' aria-hidden='true' />
              <span>No members</span>
            </span>
          </div>
        )
      }

      return (
        <div className='flex w-[100px] items-center gap-2'>
          <AvatarGroup members={assignedMembers} max={4} size='m' />
        </div>
      )
    },
    filterFn: (row, id, value) => {
      const assignedMembers = row.getValue(id) as TeamMember[] | undefined

      if (!assignedMembers || assignedMembers.length === 0) {
        return false
      }

      return value.some((selectedId: string) =>
        assignedMembers.some((member) => member.id === selectedId)
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
          <div className='flex w-[100px] items-center gap-2'>
            <span
              className='text-muted-foreground flex items-center gap-2 text-sm'
              tabIndex={0}
              aria-label='No attachments'
              role='note'
            >
              <Paperclip className='h-4 w-4' aria-hidden='true' />
              <span>No Attachments</span>
            </span>
          </div>
        )
      }
      return (
        <div className='flex w-[100px] items-center gap-2'>
          <Paperclip className='h-4 w-4' aria-hidden='true' />
          <span>{attachments.length}</span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },

  {
    accessorKey: 'checklists',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Checklists' />
    ),
    cell: ({ row }) => {
      const checklists = row.original.checklists ?? []

      const totalTasks = checklists.reduce(
        (acc, checklist) => acc + checklist.tasks.length,
        0
      )
      const completedTasks = checklists.reduce(
        (acc, checklist) =>
          acc + checklist.tasks.filter((task) => task.completed).length,
        0
      )
      if (checklists.length === 0) {
        return (
          <div className='flex w-[100px] items-center gap-2'>
            <span
              className='text-muted-foreground flex items-center gap-2 text-sm'
              tabIndex={0}
              aria-label='No checklists'
              role='note'
            >
              <ListTodo className='h-4 w-4' aria-hidden='true' />
              <span>No Checklists</span>
            </span>
          </div>
        )
      }
      return (
        <div className='flex w-[100px] items-center gap-2'>
          <ListTodo className='text-muted-foreground h-4 w-4' />
          <span className='text-muted-foreground text-xs'>
            {completedTasks}/{totalTasks}
          </span>
        </div>
      )
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },

  {
    accessorKey: 'deadline',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Deadline' />
    ),

    cell: ({ row }) => {
      const deadline = row.original.deadline ?? null
      const isOverdue =
        deadline &&
        new Date(deadline) < new Date() &&
        row.original.status !== TaskStatusEnum.COMPLETED

      if (!deadline) {
        return (
          <div className='flex w-[100px] items-center gap-2'>
            <span
              className='text-muted-foreground flex items-center gap-2 text-sm'
              tabIndex={0}
              aria-label='No checklists'
              role='note'
            >
              <Calendar className='h-4 w-4' aria-hidden='true' />
              <span>No Deadline</span>
            </span>
          </div>
        )
      }
      return (
        <div className='flex w-[100px] items-center gap-2'>
          <Calendar
            className={cn(
              'h-4 w-4',
              isOverdue ? 'font-medium text-red-600' : 'ext-muted-foreground'
            )}
          />
          <span className='text-muted-foreground text-xs'>
            {format(deadline, 'dd.MM.yyyy')}
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
