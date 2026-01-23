'use client'

import { parseISO, differenceInMilliseconds } from 'date-fns'
import {
  DndContext,
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core'
import { useCalendar } from '../../model/contexts/calendar-context'
import { type IEvent } from '../../model/interfaces'
import { CustomDragLayer } from './custom-drag-layer'

interface DndProviderWrapperProps {
  children: React.ReactNode
}

export function DndProviderWrapper({ children }: DndProviderWrapperProps) {
  const { setLocalEvents } = useCalendar()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(MouseSensor),
    useSensor(TouchSensor)
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || !active.data.current) return

    const droppedEvent = active.data.current.event as IEvent
    const overData = over.data.current

    if (!droppedEvent || !overData) return

    const eventStartDate = parseISO(droppedEvent.startDate)
    const eventEndDate = parseISO(droppedEvent.endDate)
    const eventDurationMs = differenceInMilliseconds(
      eventEndDate,
      eventStartDate
    )

    let newStartDate: Date

    if (overData.type === 'day') {
      newStartDate = new Date(overData.date)
      newStartDate.setHours(
        eventStartDate.getHours(),
        eventStartDate.getMinutes(),
        eventStartDate.getSeconds(),
        eventStartDate.getMilliseconds()
      )
    } else if (overData.type === 'time-block') {
      newStartDate = new Date(overData.date)
      newStartDate.setHours(overData.hour, overData.minute, 0, 0)
    } else {
      return
    }

    const newEndDate = new Date(newStartDate.getTime() + eventDurationMs)

    setLocalEvents((prev) =>
      prev.map((e) =>
        e.id === droppedEvent.id
          ? {
              ...e,
              startDate: newStartDate.toISOString(),
              endDate: newEndDate.toISOString(),
            }
          : e
      )
    )
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {children}
      <CustomDragLayer />
    </DndContext>
  )
}
