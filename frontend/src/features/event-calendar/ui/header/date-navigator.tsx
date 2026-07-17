import { useMemo } from 'react'
import { formatDate } from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Badge } from '@/shared/ui/core/badge'
import { Button } from '@/shared/ui/core/button'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/core/tooltip'
import { type Task } from '@/entities/task'
import { getEventsCount, navigateDate, rangeText } from '../../lib/helpers'
import { useCalendar } from '../../model/calendar-context'
import { type TCalendarView } from '../../model/types'

interface IProps {
  view: TCalendarView
  events: Task[]
}

export function DateNavigator({ view, events }: IProps) {
  const { selectedDate, setSelectedDate } = useCalendar()

  const month = formatDate(selectedDate, 'MMMM')
  const year = selectedDate.getFullYear()

  const eventCount = useMemo(
    () => getEventsCount(events, selectedDate, view),
    [events, selectedDate, view]
  )

  const handlePrevious = () =>
    setSelectedDate(navigateDate(selectedDate, view, 'previous'))
  const handleNext = () =>
    setSelectedDate(navigateDate(selectedDate, view, 'next'))

  return (
    <div className='space-y-0.5'>
      <div className='flex items-center gap-2'>
        <span className='text-lg font-semibold'>
          {month} {year}
        </span>
        <Badge variant='outline' className='px-1.5'>
          {eventCount} events
        </Badge>
      </div>

      <div className='flex items-center gap-2'>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              className='size-6.5 px-0 [&_svg]:size-4.5'
              onClick={handlePrevious}
            >
              <ChevronLeft />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Previous</TooltipContent>
        </Tooltip>

        <p className='text-muted-foreground text-sm'>
          {rangeText(view, selectedDate)}
        </p>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='outline'
              className='size-6.5 px-0 [&_svg]:size-4.5'
              onClick={handleNext}
            >
              <ChevronRight />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Next</TooltipContent>
        </Tooltip>
      </div>
    </div>
  )
}
