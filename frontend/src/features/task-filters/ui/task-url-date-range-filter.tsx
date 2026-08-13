import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import { Calendar } from '@/shared/ui/core/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/core/popover'

interface TaskUrlDateRangeFilterProps {
  title?: string
  value: string[]
  onChange: (value: string[] | undefined) => void
}

export function TaskUrlDateRangeFilter({
  title,
  value,
  onChange,
}: TaskUrlDateRangeFilterProps) {
  // value is expected to be [startTimestamp, endTimestamp]
  const hasValue = value && value.length === 2

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 border-dashed'>
          <CalendarIcon className='size-4' />
          {title}
          {hasValue && (
            <span className='ml-2 text-xs'>
              {format(new Date(Number(value[0])), 'MMM dd')} -{' '}
              {format(new Date(Number(value[1])), 'MMM dd')}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='range'
          selected={
            hasValue
              ? {
                  from: new Date(Number(value[0])),
                  to: new Date(Number(value[1])),
                }
              : undefined
          }
          onSelect={(range) => {
            onChange(
              range?.from && range?.to
                ? [
                    range.from.getTime().toString(),
                    range.to.getTime().toString(),
                  ]
                : undefined
            )
          }}
        />
      </PopoverContent>
    </Popover>
  )
}
