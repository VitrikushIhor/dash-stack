import { GripVertical, Plus } from 'lucide-react'
import { KanbanColumn, KanbanColumnHandle } from '@/shared/ui/components/kanban'
import { Button } from '@/shared/ui/components/ui/button'
import { ScrollArea } from '@/shared/ui/components/ui/scroll-area'
import { type Task, TaskStatusEnum } from '@/entities/task'
import {
  AddTaskDialog,
  ChecklistTodoProvider,
  TASK_COLUMN_TITLES,
  TASK_STATUS_COLORS,
} from '@/features/task'
import { KanbanTaskCard } from './kanban-task-card'

interface TaskColumnProps
  extends Omit<React.ComponentProps<typeof KanbanColumn>, 'children'> {
  tasks: Task[]
}

export function KanbanTaskColum({ value, tasks, ...props }: TaskColumnProps) {
  const isCompleted = value === TaskStatusEnum.COMPLETED

  return (
    <KanbanColumn
      value={value}
      {...props}
      className='bg-muted/30 flex flex-col gap-5 p-4'
    >
      <div className='flex flex-col gap-5'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div
              className='h-2 w-2 rounded-full'
              style={{
                backgroundColor: TASK_STATUS_COLORS[value as TaskStatusEnum],
              }}
            />
            <h2 className='text-base font-semibold'>
              {TASK_COLUMN_TITLES[value as TaskStatusEnum]}
            </h2>
            <span className='text-muted-foreground text-sm'>
              {isCompleted
                ? `${tasks.length} completed ${tasks.length === 1 ? 'task' : 'tasks'}`
                : `${tasks.length} open ${tasks.length === 1 ? 'task' : 'tasks'}`}
            </span>
          </div>
          <KanbanColumnHandle asChild>
            <Button variant='ghost' size='icon'>
              <GripVertical className='h-4 w-4' />
            </Button>
          </KanbanColumnHandle>
        </div>
        <ChecklistTodoProvider>
          <AddTaskDialog
            status={value as TaskStatusEnum}
            trigger={
              <Button variant={'secondary'} size={'sm'} className='w-full'>
                <Plus className='mr-2 h-4 w-4' />
                Create Task
              </Button>
            }
          />
        </ChecklistTodoProvider>
      </div>
      <ScrollArea className='flex-1'>
        <div className='space-y-3'>
          {tasks.length === 0 ? (
            <div className='text-muted-foreground flex h-32 items-center justify-center text-sm'>
              No tasks in this column
            </div>
          ) : (
            tasks.map((task) => (
              <KanbanTaskCard key={task.id} task={task} asHandle />
            ))
          )}
        </div>
      </ScrollArea>
    </KanbanColumn>
  )
}
