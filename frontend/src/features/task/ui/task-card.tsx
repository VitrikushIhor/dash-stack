import { memo } from 'react'
import { format } from 'date-fns'
import { Calendar, Paperclip, ListTodo } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { AvatarGroup, LabelBadge } from '@/shared/ui'
import { Badge } from '@/shared/ui/core/badge'
import { Card, CardContent, CardHeader } from '@/shared/ui/core/card'
import { Checkbox } from '@/shared/ui/core/checkbox'
import {
  type Task,
  TaskStatusEnum,
  calculateTaskProgress,
  isTaskOverdue,
  STATUS_CONFIG,
} from '@/entities/task'
import { TaskCardActions } from './task-card-actions'

interface TaskCardProps {
  task: Task
  viewMode?: 'kanban' | 'list' | 'table'
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onTaskClick?: () => void
  className?: string
}

export const TaskCardList = memo(
  ({ task, onTaskClick, onEdit, onDelete, className }: TaskCardProps) => {
    const { totalItems, completedItems } = calculateTaskProgress(task)
    const overdue = isTaskOverdue(task)
    const isCompleted = task.status === TaskStatusEnum.COMPLETED
    const date = task.dueDate
      ? format(new Date(task.dueDate), 'dd.MM.yyyy')
      : undefined

    return (
      <Card
        className={cn(
          'w-full cursor-pointer transition-all hover:shadow-md',
          'border-l-4 p-1',
          className
        )}
        style={{ borderLeftColor: STATUS_CONFIG[task.status].color }}
        onClick={onTaskClick}
      >
        <CardContent>
          <div className='flex items-center justify-between gap-4'>
            <div className='flex min-w-0 flex-1 items-center gap-3'>
              <div className='shrink-0' onClick={(e) => e.stopPropagation()}>
                <Checkbox checked={isCompleted} />
              </div>

              <div className='min-w-0 flex-1'>
                <h3
                  className={cn(
                    'truncate text-sm font-medium',
                    isCompleted && 'text-muted-foreground line-through'
                  )}
                >
                  {task.title}
                </h3>
              </div>
            </div>

            {task.label && (
              <div className='flex shrink-0 gap-1'>
                <LabelBadge size='sm' label={task.label} />
              </div>
            )}

            <div className='flex shrink-0 items-center gap-4'>
              {totalItems > 0 && (
                <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                  <ListTodo className='h-4 w-4' />
                  <span
                    className={cn(
                      completedItems === totalItems &&
                        'font-medium text-green-600'
                    )}
                  >
                    {completedItems}/{totalItems}
                  </span>
                </div>
              )}

              {task.attachments && task.attachments.length > 0 && (
                <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                  <Paperclip className='h-3 w-3' />
                  <span>{task.attachments.length}</span>
                </div>
              )}

              {date && (
                <div
                  className={cn(
                    'flex items-center gap-1.5 text-xs',
                    overdue
                      ? 'font-medium text-red-600'
                      : 'text-muted-foreground'
                  )}
                >
                  <Calendar className='h-4 w-4' />
                  <span>{date}</span>
                </div>
              )}

              {task.assignees && task.assignees.length > 0 && (
                <AvatarGroup members={task.assignees} max={3} size='m' />
              )}

              <TaskCardActions
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                variant='vertical'
              />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }
)

export const TaskCardKanban = memo(
  ({ task, onTaskClick, onEdit, onDelete, className }: TaskCardProps) => {
    const { totalItems, completedItems } = calculateTaskProgress(task)
    const overdue = isTaskOverdue(task)
    const isCompleted = task.status === TaskStatusEnum.COMPLETED
    const date = task.dueDate
      ? format(new Date(task.dueDate), 'dd.MM.yyyy')
      : undefined

    return (
      <Card
        className={cn(
          'w-full cursor-pointer p-4 transition-all hover:shadow-lg',
          className
        )}
        onClick={onTaskClick}
      >
        <CardHeader className='p-0'>
          <div className='flex items-start justify-between gap-2'>
            {task.label && (
              <div className='mt-2 flex flex-wrap gap-1'>
                <Badge
                  variant='secondary'
                  className='px-2 py-0.5 text-xs'
                  style={{ backgroundColor: task.label.color }}
                >
                  {task.label.name}
                </Badge>
              </div>
            )}
            <div className='ml-auto'>
              <TaskCardActions
                task={task}
                onEdit={onEdit}
                onDelete={onDelete}
                variant='horizontal'
              />
            </div>
          </div>

          <h3
            className={cn(
              'text-sm leading-snug font-medium',
              isCompleted && 'text-muted-foreground line-through'
            )}
          >
            {task.title}
          </h3>
        </CardHeader>

        <CardContent className='flex flex-col gap-3 p-0'>
          <div className='flex items-center justify-between'>
            {date ? (
              <div
                className={cn(
                  'flex items-center gap-1.5 text-xs',
                  overdue ? 'font-medium text-red-600' : 'text-muted-foreground'
                )}
              >
                <Calendar className='h-4 w-4' />
                <span>{date}</span>
              </div>
            ) : (
              <div />
            )}

            {totalItems > 0 && (
              <div className='flex items-center gap-2'>
                <ListTodo className='text-muted-foreground h-4 w-4' />
                <span className='text-muted-foreground text-xs'>
                  {completedItems}/{totalItems}
                </span>
              </div>
            )}
          </div>

          <div className='flex items-center justify-between gap-2'>
            {task.attachments && task.attachments.length > 0 && (
              <div className='text-muted-foreground flex items-center gap-1 text-xs'>
                <Paperclip className='h-3 w-3' />
                <span>{task.attachments.length}</span>
              </div>
            )}

            {task.assignees && task.assignees.length > 0 && (
              <div className='flex'>
                <AvatarGroup members={task.assignees} max={3} size='m' />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
)

export const TaskCard = (props: TaskCardProps) => {
  if (props.viewMode === 'list') {
    return <TaskCardList {...props} />
  }
  return <TaskCardKanban {...props} />
}
