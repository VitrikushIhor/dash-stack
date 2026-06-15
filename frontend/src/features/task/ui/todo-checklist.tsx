import { useState, useCallback, useMemo, memo } from 'react'
import { Plus, ChevronDown, ChevronUp, EllipsisVertical } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/core/dropdown-menu'
import { Input } from '@/shared/ui/core/input'
import {
  useChecklist,
  useChecklistTodoActions,
} from '../model/store/checklist-todo-context'
import { TodoItem } from './todo-item'

interface TodoChecklistProps {
  checklistId: string
}

export const TodoChecklist = memo(function TodoChecklist({
  checklistId,
}: TodoChecklistProps) {
  const checklist = useChecklist(checklistId)
  const { updateChecklistName, deleteChecklist, addTask } =
    useChecklistTodoActions()

  const [isExpanded, setIsExpanded] = useState(true)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedName, setEditedName] = useState(checklist?.name || '')
  const [editedTaskId, setEditedTaskId] = useState<string | null>(null)
  const [editedTaskTitle, setEditedTaskTitle] = useState('')

  const toggleExpanded = useCallback(() => {
    setIsExpanded((prev) => !prev)
  }, [])

  const handleNameSave = useCallback(() => {
    const trimmedName = editedName.trim()
    if (trimmedName && trimmedName !== checklist?.name) {
      updateChecklistName(checklistId, trimmedName)
    }
    setIsEditingName(false)
  }, [editedName, checklist?.name, checklistId, updateChecklistName])

  const handleNameCancel = useCallback(() => {
    setEditedName(checklist?.name || '')
    setIsEditingName(false)
  }, [checklist?.name])

  const handleAddTask = useCallback(() => {
    const trimmedTitle = newTaskTitle.trim()
    if (trimmedTitle) {
      addTask(checklistId, trimmedTitle)
      setNewTaskTitle('')
      setIsAdding(false)
    }
  }, [newTaskTitle, checklistId, addTask])

  const handleDelete = useCallback(() => {
    deleteChecklist(checklistId)
  }, [checklistId, deleteChecklist])

  const startEditingName = useCallback(() => {
    setIsEditingName(true)
  }, [])

  const startAddingTask = useCallback(() => {
    setIsAdding(true)
  }, [])

  const cancelAddingTask = useCallback(() => {
    setIsAdding(false)
    setNewTaskTitle('')
  }, [])

  const startEditingTask = useCallback(
    (taskId: string, currentTitle: string) => {
      setEditedTaskId(taskId)
      setEditedTaskTitle(currentTitle)
    },
    []
  )

  const completedCount = useMemo(
    () => checklist?.items?.filter((task) => task.completed).length || 0,
    [checklist?.items]
  )

  const progressText = useMemo(
    () => `${completedCount}/${checklist?.items?.length || 0}`,
    [completedCount, checklist?.items?.length]
  )

  if (!checklist) return null

  return (
    <div className='space-y-2 rounded-lg border p-4'>
      <div className='flex items-center justify-between'>
        <div className='flex flex-1 items-center gap-2'>
          <Button
            variant='ghost'
            size='icon'
            onClick={toggleExpanded}
            className='h-8 w-8'
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? (
              <ChevronUp className='h-4 w-4' />
            ) : (
              <ChevronDown className='h-4 w-4' />
            )}
          </Button>

          {isEditingName ? (
            <div className='flex flex-1 items-center gap-2'>
              <Input
                value={editedName}
                onChange={(e) => setEditedName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleNameSave()
                  if (e.key === 'Escape') handleNameCancel()
                }}
                className='h-8'
                autoFocus
                maxLength={100}
              />
              <Button size='sm' onClick={handleNameSave}>
                Save
              </Button>
              <Button size='sm' variant='ghost' onClick={handleNameCancel}>
                Cancel
              </Button>
            </div>
          ) : (
            <div className='flex flex-1 items-center gap-2'>
              <button
                className='focus-visible:ring-primary cursor-pointer rounded text-left font-semibold outline-none focus-visible:ring-2'
                onClick={toggleExpanded}
                type='button'
              >
                {checklist.name}
              </button>
              {(checklist?.items?.length ?? 0) > 0 && (
                <span className='text-muted-foreground text-sm'>
                  {progressText}
                </span>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='ml-auto h-8 w-8'
                    aria-label='Actions with checklist'
                  >
                    <EllipsisVertical className='h-4 w-4' />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={startEditingName}>
                    Edit name
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className='text-destructive'
                    onClick={handleDelete}
                  >
                    Delete checklist
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>

      {isExpanded && (
        <div className='space-y-1'>
          {(checklist?.items?.length ?? 0) === 0 && !isAdding && (
            <p className='text-muted-foreground ml-5 py-2 text-sm'>
              No tasks in this checklist
            </p>
          )}

          {(checklist?.items || []).map((task) => (
            <TodoItem
              key={task.id}
              taskId={task.id}
              checklistId={checklistId}
              isEditing={editedTaskId === task.id}
              editedTitle={editedTaskTitle}
              onEditTitleChange={setEditedTaskTitle}
              onStartEdit={startEditingTask}
              onCancelEdit={() => setEditedTaskId(null)}
            />
          ))}

          {isAdding ? (
            <div className='ml-5 flex gap-2'>
              <Input
                placeholder='Task name'
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleAddTask()
                  if (e.key === 'Escape') cancelAddingTask()
                }}
                autoFocus
                maxLength={200}
              />
              <Button
                size='sm'
                onClick={handleAddTask}
                disabled={!newTaskTitle.trim()}
              >
                Add
              </Button>
              <Button size='sm' variant='ghost' onClick={cancelAddingTask}>
                Cancel
              </Button>
            </div>
          ) : (
            <Button
              size='sm'
              onClick={startAddingTask}
              variant='ghost'
              className='text-primary hover:bg-accent ml-5 w-full justify-start text-sm'
            >
              <Plus className='mr-2 h-4 w-4' />
              Add task
            </Button>
          )}
        </div>
      )}
    </div>
  )
})
