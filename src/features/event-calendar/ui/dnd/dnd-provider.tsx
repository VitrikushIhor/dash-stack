'use client'

import { formatISO, startOfDay } from 'date-fns'
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
import { type Task } from '../../model/interfaces'
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

    const droppedEvent = active.data.current.event as Task
    const overData = over.data.current

    if (!droppedEvent || !overData) return

    let newDeadline: Date

    if (overData.type === 'day') {
      newDeadline = startOfDay(new Date(overData.date))
    } else {
      return
    }

    setLocalEvents((prev) =>
      prev.map((e) =>
        e.id === droppedEvent.id
          ? {
              ...e,
              deadline: formatISO(newDeadline, { representation: 'date' }),
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
