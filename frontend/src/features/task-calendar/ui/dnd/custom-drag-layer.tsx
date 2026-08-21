import { useMemo } from 'react'
import { DragOverlay, useDndContext } from '@dnd-kit/core'
import { type Task, getTaskCalendarAnchor } from '@/entities/task'
import { MonthTaskBadge } from '../month-view/month-task-badge'

export function CustomDragLayer() {
  const { active } = useDndContext()

  const fallbackDate = useMemo(() => new Date(), [])

  if (!active || active.data.current?.type !== 'task') {
    return null
  }

  const task = active.data.current.task as Task

  return (
    <DragOverlay dropAnimation={null}>
      <div className='pointer-events-none opacity-80'>
        <MonthTaskBadge
          task={task}
          cellDate={new Date(getTaskCalendarAnchor(task) || fallbackDate)}
          position='none'
        />
      </div>
    </DragOverlay>
  )
}
