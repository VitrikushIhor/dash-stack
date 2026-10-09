import { useDroppable } from '@dnd-kit/core'
import { cn } from '@/shared/lib/utils'
import { type CalendarDayDropData } from '../../model/calendar-task-move'
import { type ICalendarCell } from '../../model/types'

interface DroppableDayCellProps {
  cell: ICalendarCell
  children: React.ReactNode
}

export function DroppableDayCell({ cell, children }: DroppableDayCellProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `day-${cell.date.toISOString()}`,
    data: {
      type: 'day',
      date: cell.date,
    } satisfies CalendarDayDropData,
  })

  return (
    <div
      ref={setNodeRef}
      className={cn('h-full w-full', isOver && 'bg-accent/50')}
    >
      {children}
    </div>
  )
}
