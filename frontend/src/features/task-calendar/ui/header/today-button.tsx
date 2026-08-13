'use client'

import { formatDate, isToday } from 'date-fns'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/shared/ui/core/tooltip'

interface IProps {
  selectedDate: Date
  setParams: (params: { date: Date | null }) => void
}

export function TodayButton({ selectedDate, setParams }: IProps) {
  const today = new Date()
  const isCurrentToday = isToday(selectedDate)

  const handleClick = () => setParams({ date: today })

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className='focus-visible:ring-ring flex size-14 flex-col items-start overflow-hidden rounded-lg border focus-visible:ring-1 focus-visible:outline-none disabled:opacity-50'
          onClick={handleClick}
          disabled={isCurrentToday}
        >
          <p className='bg-primary text-primary-foreground flex h-6 w-full items-center justify-center text-center text-xs font-semibold'>
            {formatDate(today, 'MMM').toUpperCase()}
          </p>
          <p className='flex w-full items-center justify-center text-lg font-bold'>
            {today.getDate()}
          </p>
        </button>
      </TooltipTrigger>
      <TooltipContent>Go to today</TooltipContent>
    </Tooltip>
  )
}
