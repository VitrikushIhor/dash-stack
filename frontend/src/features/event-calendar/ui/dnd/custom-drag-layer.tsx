import { useMemo } from 'react'
import { DragOverlay, useDndContext } from '@dnd-kit/core'
import { type Task, getTaskCalendarAnchor } from '@/entities/task'
import { MonthEventBadge } from '../month-view/month-event-badge'

export function CustomDragLayer() {
  const { active } = useDndContext()

  const fallbackDate = useMemo(() => new Date(), [])

  if (!active || active.data.current?.type !== 'event') {
    return null
  }

  const event = active.data.current.event as Task

  return (
    <DragOverlay dropAnimation={null}>
      <div className='pointer-events-none opacity-80'>
        <MonthEventBadge
          event={event}
          cellDate={new Date(getTaskCalendarAnchor(event) || fallbackDate)}
          position='none'
        />
      </div>
    </DragOverlay>
  )
}
