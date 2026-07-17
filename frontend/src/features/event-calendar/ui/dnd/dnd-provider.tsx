import { parseISO } from 'date-fns'
import {
  DndContext,
  type DragEndEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  PointerSensor,
} from '@dnd-kit/core'
import { useOrgStore } from '@/entities/organization'
import {
  type Task,
  useUpdateTask,
  getTaskCalendarAnchor,
} from '@/entities/task'
import { CustomDragLayer } from './custom-drag-layer'

interface DndProviderWrapperProps {
  children: React.ReactNode
}

export function DndProviderWrapper({ children }: DndProviderWrapperProps) {
  const { activeOrgId } = useOrgStore()
  const { mutate: updateTask } = useUpdateTask(activeOrgId || '')

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

    const droppedEvent = active.data.current.event as Task
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

    updateTask({
      id: droppedEvent.id,
      data: {
        dueDate: newStartDate.toISOString(),
      },
    })
  }

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      {children}
      <CustomDragLayer />
    </DndContext>
  )
}
