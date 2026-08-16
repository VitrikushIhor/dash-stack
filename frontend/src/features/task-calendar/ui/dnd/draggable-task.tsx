import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/shared/lib/utils'
import { type Task } from '@/entities/task'

interface DraggableTaskProps {
  task: Task
  children: React.ReactNode
}

export function DraggableTask({ task, children }: DraggableTaskProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `task-${task.id}`,
      data: {
        task,
        type: 'task',
      },
    })

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={cn(isDragging && 'opacity-40 outline-none')}
    >
      {children}
    </div>
  )
}
