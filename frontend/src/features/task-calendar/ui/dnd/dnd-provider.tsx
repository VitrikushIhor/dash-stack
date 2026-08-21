'use client'

import { type ReactNode, useOptimistic, useTransition } from 'react'
import { parseISO, set } from 'date-fns'
import {
  DndContext,
  type DragEndEvent,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { toast } from 'sonner'
import { type Task, getTaskCalendarAnchor } from '@/entities/task'
import { CustomDragLayer } from './custom-drag-layer'

interface DndProviderWrapperProps {
  tasks: Task[]
  onTaskUpdate: (id: string, data: Partial<Task>) => void | Promise<void>
  children: (optimisticTasks: Task[]) => ReactNode
}

export function DndProviderWrapper({
  tasks,
  onTaskUpdate,
  children,
}: DndProviderWrapperProps) {
  const [, startTransition] = useTransition()

  const [optimisticTasks, setOptimisticTasks] = useOptimistic(
    tasks,
    (state: Task[], updatedTask: Partial<Task> & { id: string }) =>
      state.map((task) =>
        task.id === updatedTask.id ? { ...task, ...updatedTask } : task
      )
  )

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

    const droppedEvent = active.data.current.task as Task
    const overData = over.data.current

    if (!droppedEvent || !overData) return

    const anchor = getTaskCalendarAnchor(droppedEvent)
    const eventStartDate = anchor ? parseISO(anchor) : new Date()

    let newStartDate: Date

    if (overData.type === 'day') {
      newStartDate = set(new Date(overData.date), {
        hours: eventStartDate.getHours(),
        minutes: eventStartDate.getMinutes(),
        seconds: eventStartDate.getSeconds(),
        milliseconds: eventStartDate.getMilliseconds(),
      })
    } else if (overData.type === 'time-block') {
      newStartDate = set(new Date(overData.date), {
        hours: overData.hour,
        minutes: overData.minute,
        seconds: 0,
        milliseconds: 0,
      })
    } else {
      return
    }

    const newDueDateISO = newStartDate.toISOString()
    if (droppedEvent.dueDate === newDueDateISO) return

    startTransition(async () => {
      setOptimisticTasks({ id: droppedEvent.id, dueDate: newDueDateISO })

      try {
        await onTaskUpdate(droppedEvent.id, { dueDate: newDueDateISO })
      } catch (error) {
        setOptimisticTasks({
          id: droppedEvent.id,
          dueDate: droppedEvent.dueDate,
        })
        // eslint-disable-next-line no-console
        console.error('[Calendar DnD Error]', error)
        toast.error('Failed to update task date.')
      }
    })
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {children(optimisticTasks)}
      <CustomDragLayer />
    </DndContext>
  )
}
