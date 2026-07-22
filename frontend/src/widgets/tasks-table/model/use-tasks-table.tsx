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
  type ColumnFiltersState,
  type PaginationState,
  type OnChangeFn,
} from '@tanstack/react-table'
import { useTasksTableSearchParams } from '@/shared/lib'
import { dateFilterFn, dateRangeFilterFn } from '@/shared/ui/data-table'
import { mockAvailableLabels } from '@/shared/ui/label'
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

  // Synced with URL states via nuqs
  const [searchParams, setSearchParams] = useTasksTableSearchParams()

  const columnFilters: ColumnFiltersState = useMemo(() => {
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
      const dates = searchParams.dueDate.map((d) => {
        const num = Number(d)
        return !isNaN(num) ? new Date(num) : new Date(d)
      })
      filters.push({ id: 'dueDate', value: dates })
    }
    return filters
  }, [
    searchParams.status,
    searchParams.labels,
    searchParams.members,
    searchParams.dueDate,
  ])

  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: Math.max(0, searchParams.page - 1),
      pageSize: searchParams.perPage,
    }),
    [searchParams.page, searchParams.perPage]
  )

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {
    const next =
      typeof updater === 'function' ? updater(columnFilters) : updater

    const statusFilter = next.find((f) => f.id === 'status')?.value as
      | string[]
      | undefined
    const labelFilter = next.find((f) => f.id === 'label')?.value as
      | string[]
      | undefined
    const membersFilter = next.find((f) => f.id === 'assignees')?.value as
      | string[]
      | undefined
    const dueDateFilter = next.find((f) => f.id === 'dueDate')?.value as
      | unknown[]
      | undefined

    let dueDateStrings: string[] = []
    if (Array.isArray(dueDateFilter)) {
      dueDateStrings = dueDateFilter.map((d) =>
        d instanceof Date ? String(d.getTime()) : String(d)
      )
    }

    setSearchParams({
      page: 1,
      status: statusFilter && statusFilter.length > 0 ? statusFilter : null,
      labels: labelFilter && labelFilter.length > 0 ? labelFilter : null,
      members: membersFilter && membersFilter.length > 0 ? membersFilter : null,
      dueDate: dueDateStrings.length > 0 ? dueDateStrings : null,
    })
  }

  const onGlobalFilterChange: OnChangeFn<string> = (updater) => {
    const next =
      typeof updater === 'function' ? updater(searchParams.filter) : updater
    setSearchParams({
      filter: next ? next.trim() : null,
      page: 1,
    })
  }

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === 'function' ? updater(pagination) : updater
    setSearchParams({
      page: next.pageIndex + 1,
      perPage: next.pageSize === 10 ? null : next.pageSize,
    })
  }

  // Table Instance
  const table = useReactTable({
    data,
    columns: tasksColumns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter: searchParams.filter,
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
    if (pageCount > 0 && searchParams.page > pageCount) {
      setSearchParams({ page: 1 })
    }
  }, [pageCount, searchParams.page, setSearchParams])

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
