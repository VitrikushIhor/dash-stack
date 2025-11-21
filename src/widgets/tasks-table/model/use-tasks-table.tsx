import { useState, useEffect, useMemo } from 'react'
import { getRouteApi } from '@tanstack/react-router'
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  type SortingState,
  type VisibilityState,
  type RowSelectionState,
} from '@tanstack/react-table'
import { useTableUrlState } from '@/shared/hooks/use-table-url-state'
import { dateFilterFn } from '@/shared/ui/components/data-table/date-filter'
import { dateRangeFilterFn } from '@/shared/ui/components/data-table/date-range-filter'
import { mockAvailableLabels } from '@/shared/ui/components/label/mock-labels'
import { TaskStatusEnum, type Task } from '@/entities/task'
import { type TeamMember } from '@/entities/team'
import { tasksColumns } from '../ui/tasks-columns'
import { STATUS_CONFIG } from './task-status-config'

interface UseTasksTableProps {
  data: Task[]
}
const route = getRouteApi('/_authenticated/task/')

export function useTasksTable({ data }: UseTasksTableProps) {
  // Local UI-only states
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  // Synced with URL states
  const {
    globalFilter,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  } = useTableUrlState({
    search: route.useSearch(),
    navigate: route.useNavigate(),
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { columnId: 'assignedLabels', searchKey: 'labels', type: 'array' },
      { columnId: 'assignedMembers', searchKey: 'members', type: 'array' },
      {
        columnId: 'deadline',
        searchKey: 'deadline',
        type: 'array',
        serialize: (value: unknown) => {
          if (!Array.isArray(value)) return undefined
          const filtered = value.filter(Boolean)
          return filtered.length > 0 ? filtered : undefined
        },
        deserialize: (value: unknown) => {
          if (!Array.isArray(value)) return []
          return value.filter((v) => typeof v === 'string' && v)
        },
      },
    ],
  })

  const table = useReactTable({
    data,
    columns: tasksColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    globalFilterFn: (row, _columnId, filterValue) => {
      const desc = String(row.getValue('description')).toLowerCase()
      const title = String(row.getValue('title')).toLowerCase()
      const searchValue = String(filterValue).toLowerCase()

      return desc.includes(searchValue) || title.includes(searchValue)
    },
    filterFns: {
      dateFilter: dateFilterFn,
      dateRangeFilter: dateRangeFilterFn,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    onPaginationChange,
    onGlobalFilterChange,
    onColumnFiltersChange,
  })

  const pageCount = table.getPageCount()
  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  // Memoize filter options to avoid unnecessary recalculations
  const filterOptions = useMemo(() => {
    const statuses = Object.values(TaskStatusEnum).map((status) => ({
      label: STATUS_CONFIG[status].label,
      value: status,
      icon: STATUS_CONFIG[status].icon,
    }))

    const labels = mockAvailableLabels.map((l) => ({
      label: l.name.charAt(0).toUpperCase() + l.name.slice(1).toLowerCase(),
      value: l.name,
    }))

    const uniqueMembers = new Map<string, TeamMember>()
    data.forEach((task) => {
      task.assignedMembers?.forEach((member) => {
        if (!uniqueMembers.has(member.id)) {
          uniqueMembers.set(member.id, member)
        }
      })
    })

    const members = Array.from(uniqueMembers.values()).map((member) => ({
      label: `${member.first_name} ${member.last_name}`,
      value: member.id,
    }))

    return { statuses, labels, members }
  }, [data])

  return {
    table,
    filterOptions,
  }
}

