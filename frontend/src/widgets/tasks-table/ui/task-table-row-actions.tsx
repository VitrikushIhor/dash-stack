import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { type Row } from '@tanstack/react-table'
import { PencilIcon, Trash2 } from 'lucide-react'
import { Button } from '@/shared/ui/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from '@/shared/ui/components/ui/dropdown-menu'
import { type Task } from '@/entities/task'
import { useTaskModalStore } from '@/features/manage-task'

type DataTableRowActionsProps<TData> = {
  row: Row<TData>
}

export function TaskTableRowActions<TData>({
  row,
}: DataTableRowActionsProps<TData>) {
  const task = row.original as Task
  const { openEdit, openDelete } = useTaskModalStore()

  const openEditDialog = () => {
    openEdit(task)
  }

  const openDeleteDialog = () => {
    openDelete(task)
  }

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          className='data-[state=open]:bg-muted flex h-8 w-8 p-0'
        >
          <DotsHorizontalIcon className='h-4 w-4' />
          <span className='sr-only'>Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end' className='w-[160px]'>
        <DropdownMenuItem onClick={openEditDialog}>
          Edit
          <DropdownMenuShortcut>
            <PencilIcon className='h-4 w-4' />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={openDeleteDialog}>
          Delete
          <DropdownMenuShortcut>
            <Trash2 className='h-4 w-4' />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
