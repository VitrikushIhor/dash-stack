import { useOptimistic, useTransition, type ReactNode } from 'react'
import { parseISO } from 'date-fns'
import { toast } from 'sonner'
import { useAction } from '@/shared/lib/hooks/use-action'
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
import { updateTaskAction } from '@/features/manage-task/server'
import { CustomDragLayer } from './custom-drag-layer'

interface DndProviderWrapperProps {
  tasks: Task[]
  children: (optimisticTasks: Task[]) => ReactNode
}

export function DndProviderWrapper({ tasks, children }: DndProviderWrapperProps) {
  const { activeOrg } = useActiveOrganization()
  const activeOrgId = activeOrg?.id
  const [, startTransition] = useTransition()
  
  const { execute } = useAction(updateTaskAction, {
    onError: (error: unknown) => {
      // eslint-disable-next-line no-console
      console.error('[Calendar DnD Error]', error)
      toast.error('Failed to update task date.')
    },
  })

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
    
    const newDueDateISO = newStartDate.toISOString()
    if (droppedEvent.dueDate === newDueDateISO) return

    startTransition(() => {
      setOptimisticTasks({ id: droppedEvent.id, dueDate: newDueDateISO })
      
      execute({
        id: droppedEvent.id,
        data: {
          dueDate: newDueDateISO,
        },
      })
    })
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {children(optimisticTasks)}
      <CustomDragLayer />
    </DndContext>
  )
}
