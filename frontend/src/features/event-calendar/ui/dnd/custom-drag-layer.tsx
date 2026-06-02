'use client'

import { DragOverlay, useDndContext } from '@dnd-kit/core'
import { type IEvent } from '../../model/types'
import { MonthEventBadge } from '../month-view/month-event-badge'

export function CustomDragLayer() {
  const { active } = useDndContext()

  if (!active || active.data.current?.type !== 'event') {
    return null
  }

  const event = active.data.current.event as IEvent

  return (
    <DragOverlay dropAnimation={null}>
      <div className='pointer-events-none opacity-80'>
        <MonthEventBadge
          event={event}
          cellDate={new Date(event.startDate)}
          position='none'
        />
      </div>
    </DragOverlay>
  )
}
