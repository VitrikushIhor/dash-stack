import { format } from 'date-fns'
import { type FilterFn, type Row, type Column } from '@tanstack/react-table'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
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

export function DataTableDateFilter<TData, TValue>({
  column,
  title,
}: DataTableDateFilterProps<TData, TValue>) {
  const filterValue = column?.getFilterValue() as string | undefined

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          size='sm'
          className={cn('h-8 border-dashed', filterValue && 'border-solid')}
        >
          <CalendarIcon className='size-4' />
          {title}
          {filterValue && (
            <span className='ml-2 text-xs'>
              {format(new Date(Number(filterValue)), 'MMM dd, yyyy')}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-auto p-0' align='start'>
        <Calendar
          mode='single'
          selected={filterValue ? new Date(Number(filterValue)) : undefined}
          onSelect={(date) => {
            column?.setFilterValue(date?.getTime()?.toString())
          }}
        />
      </PopoverContent>
    </Popover>
  )
}

// eslint-disable-next-line react-refresh/only-export-components, @typescript-eslint/no-explicit-any
export const dateFilterFn: FilterFn<any> = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  row: Row<any>,
  columnId: string,
  filterValue: string
): boolean => {
  const cellValue = row.getValue(columnId)
  if (!cellValue) return false

  const cellDate = new Date(cellValue as Date).getTime()
  const filterDate = Number(filterValue)

  const cellDateOnly = new Date(cellDate).setHours(0, 0, 0, 0)
  const filterDateOnly = new Date(filterDate).setHours(0, 0, 0, 0)

  return cellDateOnly === filterDateOnly
}
