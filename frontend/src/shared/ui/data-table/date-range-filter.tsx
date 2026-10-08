import { type Column, type Row } from '@tanstack/react-table'
import {
  readFilterDate,
  readFilterDateRange,
  serializeFilterDateRange,
} from '@/shared/lib/date-range'
import { DateRangeFilter } from '@/shared/ui/date-range-filter'

interface DataTableDateFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
}

export function DataTableDateRangeFilter<TData, TValue>({
  column,
  title,
}: DataTableDateFilterProps<TData, TValue>) {
  return (
    <DateRangeFilter
      title={title}
      value={readFilterDateRange(column?.getFilterValue())}
      onChange={(range) =>
        column?.setFilterValue(serializeFilterDateRange(range))
      }
    />
  )
}

export function dateRangeFilterFn<TData>(
  row: Row<TData>,
  columnId: string,
  filterValue: unknown
): boolean {
  if (
    filterValue === undefined ||
    (Array.isArray(filterValue) && filterValue.length === 0)
  )
    return true
  const range = readFilterDateRange(filterValue)
  const date = readFilterDate(row.getValue<unknown>(columnId))
  if (!range || !date) return false
  return (!range.from || date >= range.from) && (!range.to || date <= range.to)
}
