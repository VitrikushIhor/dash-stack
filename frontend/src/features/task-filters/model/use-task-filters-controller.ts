'use client'

import { useCallback } from 'react'
import { useTasksTableSearchParams } from './use-search-params'

type TaskFilterPatch = Partial<
  Record<'status' | 'labels' | 'members' | 'dueDate', string[] | null>
>

export function useTaskFiltersController() {
  const [filters, setParams] = useTasksTableSearchParams()
  const setFilters = useCallback(
    (patch: TaskFilterPatch) => setParams({ ...patch, page: 1 }),
    [setParams]
  )
  const setSearch = useCallback(
    (value: string) =>
      setParams({ filter: value || null, page: 1 }, { throttleMs: 300 }),
    [setParams]
  )
  const setPagination = useCallback(
    (page: number, perPage: number = filters.perPage) =>
      setParams({ page, perPage }),
    [setParams, filters.perPage]
  )

  return {
    filters,
    isFiltered: Boolean(
      filters.filter ||
      filters.status.length ||
      filters.labels.length ||
      filters.members.length ||
      filters.dueDate.length
    ),
    setSearch,
    setFilters,
    setStatuses: (value: string[] | undefined) =>
      setFilters({ status: value?.length ? value : null }),
    setLabels: (value: string[] | undefined) =>
      setFilters({ labels: value?.length ? value : null }),
    setMembers: (value: string[] | undefined) =>
      setFilters({ members: value?.length ? value : null }),
    setDueDateRange: (value: string[] | undefined) =>
      setFilters({ dueDate: value?.length ? value : null }),
    resetFilters: () =>
      setParams({
        filter: null,
        status: null,
        labels: null,
        members: null,
        dueDate: null,
        page: 1,
      }),
    setPagination,
  }
}
