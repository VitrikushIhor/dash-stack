import { memo } from 'react'
import { cn } from '@/shared/lib/utils'
import { AvatarGroup } from '@/shared/ui/avatar-group'
import { Card, CardContent } from '@/shared/ui/core/card'
import { Checkbox } from '@/shared/ui/core/checkbox'
import { LabelBadge } from '@/entities/label'
import { STATUS_CONFIG } from '../../model/task-status-config'
import { type Task } from '../../model/types'
import { TaskCardActions } from '../task-card-actions'
import { TaskDate, TaskProgress, TaskAttachments } from './task-card-elements'
import { useTaskCardData } from './use-task-card-data'

export interface TaskCardProps {
  task: Task

  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  onTaskClick?: () => void
  className?: string
}

export const TaskCardList = memo(
  ({ task, onTaskClick, onEdit, onDelete, className }: TaskCardProps) => {
    const data = useTaskCardData(task)

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
              <button
                type='button'
                className='shrink-0'
                onClick={(e) => e.stopPropagation()}
              >
                <Checkbox checked={data.isCompleted} />
              </button>

              <div className='min-w-0 flex-1'>
                <h3
                  className={cn(
                    'truncate text-sm font-medium',
                    data.isCompleted && 'text-muted-foreground line-through'
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
              <TaskProgress
                completed={data.completedItems}
                total={data.totalItems}
              />
              <TaskAttachments count={task.attachments?.length || 0} />

              {data.date && (
                <TaskDate date={data.date} overdue={data.overdue} />
              )}

              {data.hasAssignees && (
                <AvatarGroup members={task.assignees!} max={3} size='m' />
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
