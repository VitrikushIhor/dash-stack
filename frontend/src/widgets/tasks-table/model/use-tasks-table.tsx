'use client'

import { useState, useEffect, useMemo } from 'react'
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
import { useTableUrlState } from '@/shared/lib'
import {
  dateFilterFn,
  dateRangeFilterFn,
  mockAvailableLabels,
} from '@/shared/ui'
import { useGetMembers } from '@/entities/organization'
import { TaskStatusEnum, type Task, STATUS_CONFIG } from '@/entities/task'
import { tasksColumns } from '../ui/tasks-columns'

interface UseTasksTableProps {
  orgId: string
  data: Task[]
}

export function useTasksTable({ orgId, data }: UseTasksTableProps) {
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
    pagination: { defaultPage: 1, defaultPageSize: 10 },
    globalFilter: { enabled: true, key: 'filter' },
    columnFilters: [
      { columnId: 'status', searchKey: 'status', type: 'array' },
      { columnId: 'label', searchKey: 'labels', type: 'array' },
      { columnId: 'assignees', searchKey: 'members', type: 'array' },
      {
        columnId: 'dueDate',
        searchKey: 'dueDate',
        type: 'array',
        serialize: (value: unknown) => {
          if (!Array.isArray(value)) return undefined
          return value.map((d) => (d instanceof Date ? d.getTime() : Number(d)))
        },
        deserialize: (value: unknown) => {
          const arr = Array.isArray(value) ? value : value ? [value] : []
          return arr.map((d) => {
            if (d instanceof Date) return d
            const num = Number(d)
            return !isNaN(num) ? new Date(num) : new Date(String(d))
          })
        },
      },
    ],
  })

  // Table Instance
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

    // Handlers
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,

    // Synced handlers
    onColumnFiltersChange,
    onGlobalFilterChange,
    onPaginationChange,

    // Row models
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),

    // Custom Filters
    filterFns: {
      dateFilter: dateFilterFn,
      dateRangeFilter: dateRangeFilterFn,
    },
  })

  // Ensure current page is in valid range
  const pageCount = table.getPageCount()
  useEffect(() => {
    ensurePageInRange(pageCount)
  }, [pageCount, ensurePageInRange])

  // Faceted filter options
  const { data: members = [] } = useGetMembers(orgId)

  const memberOptions = useMemo(
    () =>
      members.map((m) => {
        const name = m.user.firstName || m.user.email
        return { label: name, value: m.user.id }
      }),
    [members]
  )

  const filterOptions = useMemo(
    () => ({
      status: (Object.keys(TaskStatusEnum) as TaskStatusEnum[]).map((st) => ({
        label: STATUS_CONFIG[st].label,
        value: st,
        icon: STATUS_CONFIG[st].icon,
      })),
      labels: mockAvailableLabels.map((lbl) => ({
        label: lbl,
        value: lbl,
      })),
      members: memberOptions,
    }),
    [memberOptions]
  )

  return { table, filterOptions }
}
