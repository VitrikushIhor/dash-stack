'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  type ColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type VisibilityState,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { dateFilterFn, dateRangeFilterFn } from '@/shared/ui/data-table'
import { type Task } from '@/entities/task'
import { useTasksTableSearchParams } from '@/features/task-filters'
import {
  mapColumnFiltersToSearchParams,
  mapSearchParamsToColumnFilters,
} from '../lib/filters'

/* eslint-disable react-hooks/incompatible-library */

interface UseTasksTableStateProps {
  data: Task[]
  columns: ColumnDef<Task, unknown>[]
  pageCount?: number
}

const DEFAULT_PAGE_SIZE = 10

export function useTasksTableState({
  data,
  columns,
  pageCount = -1,
}: UseTasksTableStateProps) {
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const [searchParams, setSearchParams] = useTasksTableSearchParams()

  const columnFilters: ColumnFiltersState = useMemo(
    () => mapSearchParamsToColumnFilters(searchParams),
    [searchParams]
  )

  const pagination: PaginationState = useMemo(
    () => ({
      pageIndex: Math.max(0, searchParams.page - 1),
      pageSize: searchParams.perPage || DEFAULT_PAGE_SIZE,
    }),
    [searchParams.page, searchParams.perPage]
  )

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {
    const next =
      typeof updater === 'function' ? updater(columnFilters) : updater
    const mapped = mapColumnFiltersToSearchParams(next)

    setSearchParams({
      page: 1,
      status: mapped.status,
      labels: mapped.labels,
      members: mapped.members,
      dueDate: mapped.dueDate,
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
      perPage: next.pageSize === DEFAULT_PAGE_SIZE ? null : next.pageSize,
    })
  }

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      globalFilter: searchParams.filter,
      pagination,
    },
    pageCount,
    manualPagination: true,
    manualFiltering: true,

    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,

    onColumnFiltersChange,
    onGlobalFilterChange,
    onPaginationChange,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),

    filterFns: {
      dateFilter: dateFilterFn,
      dateRangeFilter: dateRangeFilterFn,
    },
  })

  // Optionally ensure that page is bounded to pageCount
  const actualPageCount = table.getPageCount()
  useEffect(() => {
    if (actualPageCount > 0 && searchParams.page > actualPageCount) {
      setSearchParams({ page: Math.max(1, actualPageCount) })
    }
  }, [actualPageCount, searchParams.page, setSearchParams])

  return table
}
