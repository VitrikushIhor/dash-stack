import { cn } from '@/shared/lib/utils'
import { type TEventColor } from '../model/types'
import { calendarTaskIndicatorColors } from './calendar-task-palette'

interface CalendarTaskIndicatorProps {
  color: TEventColor
  size?: 'small' | 'normal'
  className?: string
}

export function CalendarTaskIndicator({
  color,
  size = 'normal',
  className,
}: CalendarTaskIndicatorProps) {
  return (
    <div
      aria-hidden='true'
      className={cn(
        'shrink-0 rounded-full',
        size === 'small' ? 'size-1.5' : 'size-2',
        calendarTaskIndicatorColors[color],
        className
      )}
    />
  )
}
