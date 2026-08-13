'use client'

import { memo } from 'react'
import { KanbanItem } from '@/shared/ui/kanban'
import { TaskCard, type Task, type TaskViewMode } from '@/entities/task'

interface BoardCardProps extends Omit<
  React.ComponentProps<typeof KanbanItem>,
  'value'
> {
  task: Task
  onEdit?: (task: Task) => void
  onDelete?: (task: Task) => void
  viewMode: TaskViewMode
}

export const TaskBoardCard = memo(
  ({
    task,
    onTaskClick,
    onEdit,
    onDelete,
    viewMode,
    ...props
  }: BoardCardProps & { onTaskClick?: (taskId: string) => void }) => {
    const handleCardClick = () => {
      if (onTaskClick) onTaskClick(task.id)
    }

    const handlePointerDown = (event: React.PointerEvent) => {
      const target = event.target as HTMLElement
      if (
        target.closest('button') ||
        target.closest('[role="menuitem"]') ||
        target.closest('[data-radix-dropdown-menu-trigger]') ||
        target.closest('[data-radix-dropdown-menu-content]')
      ) {
        event.preventDefault()
        event.stopPropagation()
      }
    }

    return (
      <KanbanItem value={task.id} asChild {...props}>
        <div onPointerDown={handlePointerDown} className='outline-none'>
          <TaskCard
            task={task}
            viewMode={viewMode}
            onEdit={onEdit}
            onDelete={onDelete}
            onTaskClick={handleCardClick}
          />
        </div>
      </KanbanItem>
    )
  }
)

TaskBoardCard.displayName = 'TaskBoardCard'
