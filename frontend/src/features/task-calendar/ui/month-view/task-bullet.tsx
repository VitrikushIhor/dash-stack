import { type TEventColor } from '../../model/types'
import { CalendarTaskIndicator } from '../calendar-task-indicator'

export function TaskBullet({
  color,
  className,
}: {
  color: TEventColor
  className: string
}) {
  return <CalendarTaskIndicator color={color} className={className} />
}
