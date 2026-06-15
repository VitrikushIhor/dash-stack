import { MoreVertical, MoreHorizontal } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/core/dropdown-menu'
import { type Task } from '@/entities/task'

interface TaskCardActionsProps {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  variant?: 'vertical' | 'horizontal'
}

export const TaskCardActions = ({
  task,
  onEdit,
  onDelete,
  variant = 'vertical',
}: TaskCardActionsProps) => {
  const Icon = variant === 'vertical' ? MoreVertical : MoreHorizontal

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Button
          variant='ghost'
          size='icon'
          className='h-8 w-8'
          onClick={(e) => e.stopPropagation()}
          aria-label='Task actions'
        >
          <Icon className='h-4 w-4' />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='end'>
        <DropdownMenuLabel>Actions</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={(e) => {
            e.preventDefault()
            onEdit?.(task)
          }}
        >
          Edit Task
        </DropdownMenuItem>
        <DropdownMenuItem
          className='text-destructive'
          onSelect={(e) => {
            e.preventDefault()
            onDelete?.(task)
          }}
        >
          Delete Task
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
