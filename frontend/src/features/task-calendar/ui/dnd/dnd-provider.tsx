'use client'

import { type ReactNode, useOptimistic, useTransition } from 'react'
import {
  DndContext,
  type DragEndEvent,
  MouseSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import { handleServerError } from '@/shared/api'
import { type Task } from '@/entities/task'
import {
  type CalendarTaskDateUpdate,
  getCalendarTaskDateUpdate,
  readCalendarDayDropData,
  readCalendarTaskDragData,
} from '../../model/calendar-task-move'
import { CustomDragLayer } from './custom-drag-layer'

interface DndProviderWrapperProps {
  tasks: Task[]
  onTaskUpdate: (id: string, data: CalendarTaskDateUpdate) => Promise<boolean>
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
    (state: Task[], updatedTask: Pick<Task, 'dueDate'> & { id: string }) =>
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

    if (!over) return
    const dragData = readCalendarTaskDragData(active.data.current)
    const dropData = readCalendarDayDropData(over.data.current)
    if (!dragData || !dropData) return
    const task = optimisticTasks.find((item) => item.id === dragData.taskId)
    if (!task) return

    let update: CalendarTaskDateUpdate | null
    try {
      update = getCalendarTaskDateUpdate(task, dropData)
    } catch (error) {
      handleServerError(error)
      return
    }
    if (!update) return
    const { dueDate } = update

    startTransition(async () => {
      setOptimisticTasks({ id: task.id, dueDate })

      try {
        const saved = await onTaskUpdate(task.id, {
          dueDate,
        })

        if (!saved) {
          setOptimisticTasks({
            id: task.id,
            dueDate: task.dueDate,
          })
        }
      } catch (error) {
        setOptimisticTasks({
          id: task.id,
          dueDate: task.dueDate,
        })
        handleServerError(error)
      }
    })
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {children(optimisticTasks)}
      <CustomDragLayer tasks={optimisticTasks} />
    </DndContext>
  )
}
