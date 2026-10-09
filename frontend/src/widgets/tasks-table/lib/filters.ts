import { type ColumnFiltersState } from '@tanstack/react-table'
import { readFilterDate } from '@/shared/lib/date-range'

export function parseDateSafe(val: string | undefined): string | undefined {
  return readFilterDate(val)?.toISOString()
}

export function mapSearchParamsToColumnFilters(searchParams: {
  status: string[]
  labels: string[]
  members: string[]
  dueDate: string[]
}): ColumnFiltersState {
  const filters: ColumnFiltersState = []

  if (searchParams.status.length > 0) {
    filters.push({ id: 'status', value: searchParams.status })
  }
  if (searchParams.labels.length > 0) {
    filters.push({ id: 'label', value: searchParams.labels })
  }
  if (searchParams.members.length > 0) {
    filters.push({ id: 'assignees', value: searchParams.members })
  }
  if (searchParams.dueDate.length > 0) {
    const dates = searchParams.dueDate
      .map(readFilterDate)
      .filter((date): date is Date => date !== undefined)

    if (dates.length > 0) {
      filters.push({ id: 'dueDate', value: dates })
    }
  }

  return filters
}

export function mapColumnFiltersToSearchParams(filters: ColumnFiltersState): {
  status: string[] | null
  labels: string[] | null
  members: string[] | null
  dueDate: string[] | null
} {
  const readStrings = (value: unknown): string[] =>
    Array.isArray(value)
      ? value.filter(
          (item: unknown): item is string => typeof item === 'string'
        )
      : []
  const statusFilter = readStrings(
    filters.find((filter) => filter.id === 'status')?.value
  )
  const labelFilter = readStrings(
    filters.find((filter) => filter.id === 'label')?.value
  )
  const membersFilter = readStrings(
    filters.find((filter) => filter.id === 'assignees')?.value
  )
  const dueDateFilter: unknown = filters.find(
    (filter) => filter.id === 'dueDate'
  )?.value
  const dueDateStrings = Array.isArray(dueDateFilter)
    ? dueDateFilter
        .map(readFilterDate)
        .filter((date): date is Date => date !== undefined)
        .map((date) => String(date.getTime()))
    : []

  return {
    status: statusFilter.length ? statusFilter : null,
    labels: labelFilter.length ? labelFilter : null,
    members: membersFilter.length ? membersFilter : null,
    dueDate: dueDateStrings.length ? dueDateStrings : null,
  }
}
