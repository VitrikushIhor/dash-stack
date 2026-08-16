import { memo } from 'react'
import { cn } from '@/shared/lib/utils'
import { AvatarGroup } from '@/shared/ui/avatar-group'
import { Badge } from '@/shared/ui/core/badge'
import { Card, CardContent, CardHeader } from '@/shared/ui/core/card'
import { TaskCardActions } from '../task-card-actions'
import { TaskDate, TaskProgress, TaskAttachments } from './task-card-elements'
import { type TaskCardProps } from './task-card-list'
import { useTaskCardData } from './use-task-card-data'

export const TaskCardKanban = memo(
  ({ task, onTaskClick, onEdit, onDelete, className }: TaskCardProps) => {
    const data = useTaskCardData(task)

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
              data.isCompleted && 'text-muted-foreground line-through'
            )}
          >
            {task.title}
          </h3>
        </CardHeader>

        <CardContent className='mt-3 flex flex-col gap-3 p-0'>
          <div className='flex items-center justify-between'>
            <TaskDate date={data.date} overdue={data.overdue} />
            <TaskProgress
              completed={data.completedItems}
              total={data.totalItems}
            />
          </div>

          <div className='flex items-center justify-between gap-2'>
            <TaskAttachments count={task.attachments?.length || 0} />
            {data.hasAssignees && (
              <div className='flex'>
                <AvatarGroup members={task.assignees!} max={3} size='m' />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }
)
