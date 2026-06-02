import { endOfDay, format, isSameDay, parseISO, startOfDay } from 'date-fns'
import { type VariantProps } from 'class-variance-authority'
import { cn } from '@/shared/lib/utils'
import { useCalendar } from '../../model/calendar-context'
import { type IEvent } from '../../model/types'
import { DraggableEvent } from '../dnd/draggable-event'
import { EventDetailsDialog } from '../event-details-dialog'
import { eventBadgeVariants } from '../variants'

interface IProps extends Omit<
  VariantProps<typeof eventBadgeVariants>,
  'color' | 'multiDayPosition'
> {
  event: IEvent
  cellDate: Date
  eventCurrentDay?: number
  eventTotalDays?: number
  className?: string
  position?: 'first' | 'middle' | 'last' | 'none'
}

export function MonthEventBadge({
  event,
  cellDate,
  eventCurrentDay,
  eventTotalDays,
  className,
  position: propPosition,
}: IProps) {
  const { badgeVariant } = useCalendar()

  const itemStart = startOfDay(parseISO(event.startDate))
  const itemEnd = endOfDay(parseISO(event.endDate))

  if (cellDate < itemStart || cellDate > itemEnd) return null

  let position: 'first' | 'middle' | 'last' | 'none' | undefined

  if (propPosition) {
    position = propPosition
  } else if (eventCurrentDay && eventTotalDays) {
    position = 'none'
  } else if (isSameDay(itemStart, itemEnd)) {
    position = 'none'
  } else if (isSameDay(cellDate, itemStart)) {
    position = 'first'
  } else if (isSameDay(cellDate, itemEnd)) {
    position = 'last'
  } else {
    position = 'middle'
  }

  const renderBadgeText = ['first', 'none'].includes(position)

  const color = (
    badgeVariant === 'dot' ? `${event.color}-dot` : event.color
  ) as VariantProps<typeof eventBadgeVariants>['color']

  const eventBadgeClasses = cn(
    eventBadgeVariants({ color, multiDayPosition: position, className })
  )

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (e.currentTarget instanceof HTMLElement) e.currentTarget.click()
    }
  }

  return (
    <DraggableEvent event={event}>
      <EventDetailsDialog event={event}>
        <div
          role='button'
          tabIndex={0}
          className={eventBadgeClasses}
          onKeyDown={handleKeyDown}
        >
          <div className='flex items-center gap-1.5 truncate'>
            {!['middle', 'last'].includes(position) &&
              ['mixed', 'dot'].includes(badgeVariant) && (
                <svg
                  width='8'
                  height='8'
                  viewBox='0 0 8 8'
                  className='event-dot shrink-0'
                >
                  <circle cx='4' cy='4' r='4' />
                </svg>
              )}

            {renderBadgeText && (
              <p className='flex-1 truncate font-semibold'>
                {eventCurrentDay && (
                  <span className='text-xs'>
                    Day {eventCurrentDay} of {eventTotalDays} •{' '}
                  </span>
                )}
                {event.title}
              </p>
            )}
          </div>

          {renderBadgeText && (
            <span>{format(new Date(event.startDate), 'h:mm a')}</span>
          )}
        </div>
      </EventDetailsDialog>
    </DraggableEvent>
  )
}
