import { type ColumnFiltersState } from '@tanstack/react-table'
import { type Membership } from '@/shared/model'
import { type Label } from '@/entities/label'
import { type TaskStatusEnum, STATUS_CONFIG } from '@/entities/task'

export function parseDateSafe(val: string | undefined): string | undefined {
  if (!val) return undefined
  const num = Number(val)
  const date = !isNaN(num) ? new Date(num) : new Date(val)
  return isNaN(date.getTime()) ? undefined : date.toISOString()
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
      .map((d) => {
        const num = Number(d)
        const date = !isNaN(num) ? new Date(num) : new Date(d)
        return isNaN(date.getTime()) ? null : date
      })
      .filter((d) => d !== null)

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
  const statusFilter = filters.find((f) => f.id === 'status')?.value as
    | string[]
    | undefined
  const labelFilter = filters.find((f) => f.id === 'label')?.value as
    | string[]
    | undefined
  const membersFilter = filters.find((f) => f.id === 'assignees')?.value as
    | string[]
    | undefined
  const dueDateFilter = filters.find((f) => f.id === 'dueDate')?.value as
    | Date[]
    | undefined

  let dueDateStrings: string[] = []
  if (Array.isArray(dueDateFilter)) {
    dueDateStrings = dueDateFilter
      .filter((d) => d instanceof Date && !isNaN(d.getTime()))
      .map((d) => String(d.getTime()))
  }

  return {
    status: statusFilter && statusFilter.length > 0 ? statusFilter : null,
    labels: labelFilter && labelFilter.length > 0 ? labelFilter : null,
    members: membersFilter && membersFilter.length > 0 ? membersFilter : null,
    dueDate: dueDateStrings.length > 0 ? dueDateStrings : null,
  }
}

export function generateFilterOptions(
  members: Membership[],
  availableLabels: Label[]
) {
  const memberOptions = members.map((m) => {
    const name = m.user.firstName || m.user.email
    return { label: name, value: m.user.id }
  })

  return {
    status: Object.keys(STATUS_CONFIG).map((st) => ({
      label: STATUS_CONFIG[st as TaskStatusEnum].label,
      value: st,
      icon: STATUS_CONFIG[st as TaskStatusEnum].icon,
    })),
    labels: availableLabels.map((lbl) => ({
      label: lbl.name,
      value: lbl.name,
    })),
    members: memberOptions,
  }
}
