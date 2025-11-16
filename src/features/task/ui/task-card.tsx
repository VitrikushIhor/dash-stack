import { format } from 'date-fns'
import {
  Calendar,
  Paperclip,
  ListTodo,
  MoreVertical,
  MoreHorizontal,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { AvatarGroup } from '@/shared/ui/components/avatar-group'
import { LabelBadge } from '@/shared/ui/components/label/label-badge'
import { Badge } from '@/shared/ui/components/ui/badge'
import { Button } from '@/shared/ui/components/ui/button'
import { Card, CardContent, CardHeader } from '@/shared/ui/components/ui/card'
import { Checkbox } from '@/shared/ui/components/ui/checkbox'
import { type Task, TaskStatusEnum } from '@/entities/task'

interface TaskCardProps {
  task: Task
  variant?: 'kanban' | 'list'
  onTaskClick?: (taskId: string) => void
  className?: string
}

export const TaskCard = ({
  task,
  variant = 'kanban',
  onTaskClick,
  className,
}: TaskCardProps) => {
  const {
    id,
    title,
    status,
    assignedMembers = [],
    deadline,
    assignedLabels = [],
    checklists = [],
    attachment = [],
  } = task

  const totalTasks = checklists.reduce(
    (acc, checklist) => acc + checklist.tasks.length,
    0
  )
  const completedTasks = checklists.reduce(
    (acc, checklist) =>
      acc + checklist.tasks.filter((task) => task.completed).length,
    0
  )

  const isOverdue =
    deadline &&
    new Date(deadline) < new Date() &&
    status !== TaskStatusEnum.COMPLETED

  const handleCardClick = () => {
    onTaskClick?.(id)
  }

  const date = deadline ? format(deadline, 'dd.MM.yyyy') : undefined

  const isCompleted = status === TaskStatusEnum.COMPLETED
  const isPlanned = status === TaskStatusEnum.PLANNED
  const isUpcoming = status === TaskStatusEnum.UPCOMING

  if (variant === 'list') {
    return (
      <Card
        className={cn(
          'w-full cursor-pointer transition-all hover:shadow-md',
          'border-l-4 p-1',
          isCompleted && 'border-l-green-500',
          isUpcoming && 'border-l-blue-500',
          isPlanned && 'border-l-gray-400',
          className
        )}
        onClick={handleCardClick}
      >
        <CardContent>
          <div className='flex items-center justify-between gap-4'>
            {/* Left Section - Status & Title */}
            <div className='flex min-w-0 flex-1 items-center gap-3'>
              <button
                className='shrink-0'
                onClick={(e) => {
                  e.stopPropagation()
                  // Handle status toggle
                }}
              >
                <Checkbox checked={isCompleted} />
              </button>

              <div className='min-w-0 flex-1'>
                <h3
                  className={cn(
                    'truncate text-sm font-medium',
                    isCompleted && 'text-muted-foreground line-through'
                  )}
                >
                  {title}
                </h3>
              </div>
            </div>

            {/* Middle Section - Labels */}
            {assignedLabels.length > 0 && (
              <div className='flex shrink-0 gap-1'>
                {assignedLabels.map((label) => (
                  <LabelBadge size='sm' label={label} key={label.id} />
                ))}
              </div>
            )}

            {/* Right Section - Meta Info */}
            <div className='flex shrink-0 items-center gap-4'>
              {/* Checklist Progress */}
              {totalTasks > 0 && (
                <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                  <ListTodo className='h-4 w-4' />
                  <span
                    className={cn(
                      completedTasks === totalTasks &&
                        'font-medium text-green-600'
                    )}
                  >
                    {completedTasks}/{totalTasks}
                  </span>
                </div>
              )}

              {/* Attachments Count */}
              {attachment.length > 0 && (
                <div className='text-muted-foreground flex items-center gap-1.5 text-xs'>
                  <Paperclip className='h-4 w-4' />
                  <span>{attachment.length}</span>
                </div>
              )}

              {/* Due Date */}
              {date && (
                <div
                  className={cn(
                    'flex items-center gap-1.5 text-xs',
                    isOverdue
                      ? 'font-medium text-red-600'
                      : 'text-muted-foreground'
                  )}
                >
                  <Calendar className='h-4 w-4' />
                  <span>{date}</span>
                </div>
              )}

              {/* Assigned Members */}
              {assignedMembers.length > 0 && (
                <div className='flex -space-x-2'>
                  <AvatarGroup members={assignedMembers} max={3} size='m' />
                </div>
              )}

              {/* More Options */}
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8'
                onClick={(e) => {
                  e.stopPropagation()
                  // Handle more options
                }}
              >
                <MoreVertical className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Kanban variant
  return (
    <Card
      className={cn(
        'w-full cursor-pointer p-4 transition-all hover:shadow-lg',
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className='p-0'>
        {/* Labels */}
        <div className='flex items-start justify-between gap-2'>
          {assignedLabels.length > 0 && (
            <div className='mt-2 flex flex-wrap gap-1'>
              {assignedLabels.map((label) => (
                <Badge
                  key={label.id}
                  variant='secondary'
                  className='px-2 py-0.5 text-xs'
                  style={{ backgroundColor: label.color }}
                >
                  {label.name}
                </Badge>
              ))}
            </div>
          )}
          <Button
            variant='ghost'
            size='icon'
            className='h-6 w-6'
            onClick={(e) => {
              e.stopPropagation()
              // Handle more options
            }}
          >
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </div>

        <h3
          className={cn(
            'text-sm leading-snug font-medium',
            status === TaskStatusEnum.COMPLETED &&
              'text-muted-foreground line-through'
          )}
        >
          {title}
        </h3>
      </CardHeader>

      <CardContent className='flex flex-col gap-3 p-0'>
        {/* Checklist Progress */}
        <div className='flex items-center justify-between'>
          {/* Due Date */}
          {date ? (
            <div
              className={cn(
                'flex items-center gap-1.5 text-xs',
                isOverdue ? 'font-medium text-red-600' : 'text-muted-foreground'
              )}
            >
              <Calendar className='h-4 w-4' />
              <span>{date}</span>
            </div>
          ) : (
            <div />
          )}
          <div className='flex items-center gap-2'>
            <ListTodo className='text-muted-foreground h-4 w-4' />
            <span className='text-muted-foreground text-xs'>
              {completedTasks}/{totalTasks}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className='flex items-center justify-between gap-2'>
          {/* Right Side */}
          {/* Attachments */}
          {attachment.length > 0 && (
            <div className='text-muted-foreground flex items-center gap-1 text-xs'>
              <Paperclip className='h-4 w-4' />
              <span>{attachment.length}</span>
            </div>
          )}

          {/* Assigned Members */}
          {assignedMembers.length > 0 && (
            <div className='flex'>
              <AvatarGroup members={assignedMembers} max={3} size='m' />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
