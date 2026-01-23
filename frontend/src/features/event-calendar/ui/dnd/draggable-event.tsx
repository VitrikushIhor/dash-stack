'use client'

import { useDraggable } from '@dnd-kit/core'
import { cn } from '@/shared/lib/utils'
import { type IEvent } from '../../model/interfaces'

interface DraggableEventProps {
  event: IEvent
  children: React.ReactNode
}

export function DraggableEvent({ event, children }: DraggableEventProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `event-${event.id}`,
      data: {
        event,
        type: 'event',
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
