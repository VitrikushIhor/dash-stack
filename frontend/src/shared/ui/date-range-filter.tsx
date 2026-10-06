'use client'

import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { type DateRange } from 'react-day-picker'
import { Button } from '@/shared/ui/core/button'
import { Calendar } from '@/shared/ui/core/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/core/popover'

export interface DateRangeFilterProps {
  title?: string
  value: DateRange | undefined
  onChange: (value: DateRange | undefined) => void
}

export function DateRangeFilter({
  title,
  value,
  onChange,
}: DateRangeFilterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 border-dashed'>
          <CalendarIcon className='size-4' />
          {title}
          {value && (
            <span className='ml-2 text-xs'>
              {value.from ? format(value.from, 'MMM dd') : '…'} -{' '}
              {value.to ? format(value.to, 'MMM dd') : '…'}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='range'
          selected={value}
          onSelect={onChange}
          defaultMonth={value?.from ?? value?.to}
        />
      </PopoverContent>
    </Popover>
  )
}
