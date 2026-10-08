import {
  readFilterDateRange,
  serializeFilterDateRange,
} from '@/shared/lib/date-range'
import { DateRangeFilter } from '@/shared/ui/date-range-filter'

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
  return (
    <DateRangeFilter
      title={title}
      value={readFilterDateRange(value)}
      onChange={(range) => onChange(serializeFilterDateRange(range))}
    />
  )
}
