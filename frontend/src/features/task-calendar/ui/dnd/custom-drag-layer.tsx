import { DragOverlay, useDndContext } from '@dnd-kit/core'
import { type Task, getTaskCalendarAnchor } from '@/entities/task'
import { readCalendarTaskDragData } from '../../model/calendar-task-move'
import { MonthTaskBadge } from '../month-view/month-task-badge'

export function CustomDragLayer({ tasks }: { tasks: Task[] }) {
  const { active } = useDndContext()
  const data = readCalendarTaskDragData(active?.data.current)
  if (!data) return null
  const task = tasks.find((item) => item.id === data.taskId)
  if (!task) return null
  const anchor = getTaskCalendarAnchor(task)
  if (!anchor) return null

  return (
    <DragOverlay dropAnimation={null}>
      <div className='pointer-events-none opacity-80'>
        <MonthTaskBadge task={task} cellDate={new Date(anchor)} />
      </div>
    </DragOverlay>
  )
}
