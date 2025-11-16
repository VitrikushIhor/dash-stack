import { Plus } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/components/ui/button'
import { ScrollArea } from '@/shared/ui/components/ui/scroll-area'
import { type Task, TaskStatusEnum } from '@/entities/task'
import { AddTaskDialog, TaskCard } from '@/features/task'

interface KanbanColumnProps {
  title: string
  status: TaskStatusEnum
  color: string
  tasks: Task[]
  taskCount: number
  openTaskCount: number
  onTaskClick?: (taskId: string) => void
  onTaskMove?: (taskId: string, newStatus: TaskStatusEnum) => void
  className?: string
}

export const KanbanColumn = ({
  title,
  status,
  color,
  tasks,
  taskCount,
  openTaskCount,
  onTaskClick,
  onTaskMove: _onTaskMove,
  className,
}: KanbanColumnProps) => {
  const isCompleted = status === TaskStatusEnum.COMPLETED

  return (
    <div
      className={cn(
        'flex h-full max-w-[380px] min-w-[380px] flex-col gap-5',
        'bg-muted/30 border-border rounded-lg border p-4',
        className
      )}
    >
      {/* Column Header */}
      <div className='flex flex-col gap-5'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <div
              className='h-2 w-2 rounded-full'
              style={{ backgroundColor: color }}
            />
            <h2 className='text-base font-semibold'>{title}</h2>
            <span className='text-muted-foreground text-sm'>
              {isCompleted
                ? `${taskCount} completed ${taskCount === 1 ? 'task' : 'tasks'}`
                : `${openTaskCount} open ${openTaskCount === 1 ? 'task' : 'tasks'}`}
            </span>
          </div>
        </div>

        {/* Create Task Button */}
        <AddTaskDialog
          status={status}
          trigger={
            <Button variant={'secondary'} size={'sm'} className='w-full'>
              <Plus className='mr-2 h-4 w-4' />
              Create Task
            </Button>
          }
        />
      </div>

      {/* Tasks List */}
      <ScrollArea className='flex-1'>
        <div className='space-y-3'>
          {tasks.length === 0 ? (
            <div className='text-muted-foreground flex h-32 items-center justify-center text-sm'>
              No tasks in this column
            </div>
          ) : (
            tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                variant='kanban'
                onTaskClick={onTaskClick}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
