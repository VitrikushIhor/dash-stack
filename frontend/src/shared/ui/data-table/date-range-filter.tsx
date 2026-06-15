/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from 'date-fns'
import { type FilterFn, type Row, type Column } from '@tanstack/react-table'
import { CalendarIcon } from 'lucide-react'
import { Button } from '@/shared/ui/core/button'
import { Calendar } from '@/shared/ui/core/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/shared/ui/core/popover'

type DataTableDateFilterProps<TData, TValue> = {
  column?: Column<TData, TValue>
  title?: string
}

export function DataTableDateRangeFilter<TData, TValue>({
  column,
  title,
}: DataTableDateFilterProps<TData, TValue>) {
  const filterValue = column?.getFilterValue() as [string, string] | undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant='outline' size='sm' className='h-8 border-dashed'>
          <CalendarIcon className='size-4' />
          {title}
          {filterValue && (
            <span className='ml-2 text-xs'>
              {format(new Date(Number(filterValue[0])), 'MMM dd')} -{' '}
              {format(new Date(Number(filterValue[1])), 'MMM dd')}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='range'
          selected={
            filterValue
              ? {
                  from: new Date(Number(filterValue[0])),
                  to: new Date(Number(filterValue[1])),
                }
              : undefined
          }
          onSelect={(range) => {
            column?.setFilterValue(
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

// eslint-disable-next-line react-refresh/only-export-components
export const dateRangeFilterFn: FilterFn<any> = (
  row: Row<any>,
  columnId: string,
  filterValue: unknown
): boolean => {
  const cellValue = row.getValue(columnId)
  if (!cellValue) return false

  const cellDate = new Date(cellValue as Date).getTime()
  const [start, end] = filterValue as [string, string]

  if (start && end) {
    return cellDate >= Number(start) && cellDate <= Number(end)
  }
  if (start) return cellDate >= Number(start)
  if (end) return cellDate <= Number(end)

  return true
}
