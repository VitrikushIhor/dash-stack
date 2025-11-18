import { KanbanItem } from '@/shared/ui/components/kanban'
import { type Task } from '@/entities/task'
import { TaskCard } from '@/features/task'

interface BoardCardProps
  extends Omit<React.ComponentProps<typeof KanbanItem>, 'value'> {
  task: Task
  onEdit?: (task: Task) => void
}

export const KanbanTaskCard = ({
  task,
  onTaskClick,
  onEdit,
  ...props
}: BoardCardProps & { onTaskClick?: (taskId: string) => void }) => {
  const handleCardClick = () => {
    if (onTaskClick) onTaskClick(task.id)
  }

  const handleCardKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleCardClick()
    }
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
      <div
        role='button'
        tabIndex={0}
        aria-label={`View task: ${task.title}`}
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        onPointerDown={handlePointerDown}
        className='outline-none'
      >
        <TaskCard
          task={task}
          variant='kanban'
          onEdit={onEdit}
          onTaskClick={onTaskClick}
        />
      </div>
    </KanbanItem>
  )
}
