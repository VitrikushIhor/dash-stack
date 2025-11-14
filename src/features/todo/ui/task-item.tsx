import { useCallback, memo } from 'react'
import { EllipsisVertical } from 'lucide-react'
import { Button } from '@/shared/ui/components/ui/button'
import { Checkbox } from '@/shared/ui/components/ui/checkbox'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/components/ui/dropdown-menu'
import { Input } from '@/shared/ui/components/ui/input'
import { Label } from '@/shared/ui/components/ui/label'
import {
  useChecklist,
  useChecklistTodoActions,
} from '../model/checklist-todo-context'

interface TaskItemProps {
  taskId: string
  checklistId: string
  isEditing: boolean
  editedTitle: string
  onEditTitleChange: (title: string) => void
  onStartEdit: (taskId: string, currentTitle: string) => void
  onCancelEdit: () => void
}

export const TaskItem = memo(function TaskItem({
  taskId,
  checklistId,
  isEditing,
  editedTitle,
  onEditTitleChange,
  onStartEdit,
  onCancelEdit,
}: TaskItemProps) {
  const checklist = useChecklist(checklistId)
  const task = checklist?.tasks.find((t) => t.id === taskId)
  const { toggleTask, deleteTask, updateTask } = useChecklistTodoActions()

  const handleToggle = useCallback(() => {
    toggleTask(checklistId, taskId)
  }, [checklistId, taskId, toggleTask])

  const handleDelete = useCallback(() => {
    deleteTask(checklistId, taskId)
  }, [checklistId, taskId, deleteTask])

  const handleStartEdit = useCallback(() => {
    if (task) {
      onStartEdit(taskId, task.title)
    }
  }, [taskId, task, onStartEdit])

  const handleSaveEdit = useCallback(() => {
    const trimmedTitle = editedTitle.trim()
    if (trimmedTitle && trimmedTitle !== task?.title) {
      updateTask(checklistId, taskId, trimmedTitle)
    }
    onCancelEdit()
  }, [editedTitle, task?.title, checklistId, taskId, updateTask, onCancelEdit])

  if (!task) return null

  if (isEditing) {
    return (
      <div className='ml-5 flex items-center gap-2 p-2'>
        <Input
          value={editedTitle}
          onChange={(e) => onEditTitleChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSaveEdit()
            if (e.key === 'Escape') onCancelEdit()
          }}
          className='h-8'
          autoFocus
          maxLength={200}
        />
        <Button
          size='sm'
          onClick={handleSaveEdit}
          disabled={!editedTitle.trim()}
        >
          Save
        </Button>
        <Button size='sm' variant='ghost' onClick={onCancelEdit}>
          Cancel
        </Button>
      </div>
    )
  }

  return (
    <div className='hover:bg-accent group flex items-center justify-between gap-2 rounded p-2'>
      <Label
        htmlFor={task.id}
        className='flex flex-1 cursor-pointer items-center gap-2'
      >
        <Checkbox
          id={task.id}
          checked={task.completed}
          onCheckedChange={handleToggle}
        />
        <span
          className={task.completed ? 'text-muted-foreground line-through' : ''}
        >
          {task.title}
        </span>
      </Label>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100'
            aria-label='Actions with tasks'
          >
            <EllipsisVertical className='h-4 w-4' />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align='end'>
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleStartEdit}>Edit</DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggle}>
            {task.completed ? 'Mark as incomplete' : 'Mark as completed'}
          </DropdownMenuItem>
          <DropdownMenuItem className='text-destructive' onClick={handleDelete}>
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
})
