'use client'

import { useOptimistic, useTransition, type ReactNode } from 'react'
import { parseISO, set } from 'date-fns'
import { toast } from 'sonner'
import {
  DndContext,
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core'
import { useActiveOrganization } from '@/entities/organization'
import { type Task, getTaskCalendarAnchor } from '@/entities/task'
import { CustomDragLayer } from './custom-drag-layer'

interface DndProviderWrapperProps {
  tasks: Task[]
  onTaskUpdate: (id: string, data: Partial<Task>) => void
  children: (optimisticTasks: Task[]) => ReactNode
}

export function DndProviderWrapper({
  tasks,
  onTaskUpdate,
  children,
}: DndProviderWrapperProps) {
  const { activeOrg } = useActiveOrganization()
  const activeOrgId = activeOrg?.id
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

    if (!over || !active.data.current || !activeOrgId) return

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

    startTransition(() => {
      setOptimisticTasks({ id: droppedEvent.id, dueDate: newDueDateISO })
      
      try {
        onTaskUpdate(droppedEvent.id, { dueDate: newDueDateISO })
      } catch (error) {
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
