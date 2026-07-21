'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import type {
  ColumnFiltersState,
  OnChangeFn,
  PaginationState,
} from '@tanstack/react-table'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'

type SearchRecord = Record<string, unknown>

export type NavigateFn = (opts: {
  search:
    | true
    | SearchRecord
    | ((prev: SearchRecord) => Partial<SearchRecord> | SearchRecord)
  replace?: boolean
}) => void

type UseTableUrlStateParams = {
  search?: SearchRecord
  navigate?: NavigateFn
  pagination?: {
    pageKey?: string
    pageSizeKey?: string
    defaultPage?: number
    defaultPageSize?: number
  }
  globalFilter?: {
    enabled?: boolean
    key?: string
    trim?: boolean
  }
  columnFilters?: Array<
    | {
        columnId: string
        searchKey: string
        type?: 'string'
        serialize?: (value: unknown) => unknown
        deserialize?: (value: unknown) => unknown
      }
    | {
        columnId: string
        searchKey: string
        type: 'array'
        serialize?: (value: unknown) => unknown
        deserialize?: (value: unknown) => unknown
      }
    | {
        columnId: string
        searchKey: string
        type: 'date'
        serialize?: (value: unknown) => string | undefined
        deserialize?: (value: unknown) => string
      }
    | {
        columnId: string
        searchKey: string
        type: 'dateRange'
        serialize?: (value: unknown) => string[] | undefined
        deserialize?: (value: unknown) => string[]
      }
  >
}

type UseTableUrlStateReturn = {
  globalFilter?: string
  onGlobalFilterChange?: OnChangeFn<string>
  columnFilters: ColumnFiltersState
  onColumnFiltersChange: OnChangeFn<ColumnFiltersState>
  pagination: PaginationState
  onPaginationChange: OnChangeFn<PaginationState>
  ensurePageInRange: (
    pageCount: number,
    opts?: { resetTo?: 'first' | 'last' }
  ) => void
}

export function useTableUrlState(
  params: UseTableUrlStateParams = {}
): UseTableUrlStateReturn {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const {
    pagination: paginationCfg,
    globalFilter: globalFilterCfg,
    columnFilters: columnFiltersCfg = [],
  } = params

  const currentSearchRecord: SearchRecord = useMemo(() => {
    const record: SearchRecord = {}
    searchParams.forEach((value, key) => {
      if (record[key] !== undefined) {
        if (Array.isArray(record[key])) {
          ;(record[key] as string[]).push(value)
        } else {
          record[key] = [record[key] as string, value]
        }
      } else {
        record[key] = value
      }
    })
    return record
  }, [searchParams])

  const navigate: NavigateFn = useCallback(
    (opts) => {
      const currentParams = new URLSearchParams(searchParams.toString())
      let newSearch: SearchRecord = {}

      if (typeof opts.search === 'function') {
        newSearch = opts.search(currentSearchRecord)
      } else if (typeof opts.search === 'object' && opts.search !== null) {
        newSearch = opts.search
      }

      Object.entries(newSearch).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          currentParams.delete(key)
        } else if (Array.isArray(value)) {
          currentParams.delete(key)
          value.forEach((val) => currentParams.append(key, String(val)))
        } else {
          currentParams.set(key, String(value))
        }
      })

      const query = currentParams.toString()
      const url = query ? `${pathname}?${query}` : pathname
      if (opts.replace) {
        router.replace(url)
      } else {
        router.push(url)
      }
    },
    [router, pathname, searchParams, currentSearchRecord]
  )

  const pageKey = paginationCfg?.pageKey ?? 'page'
  const pageSizeKey = paginationCfg?.pageSizeKey ?? 'pageSize'
  const defaultPage = paginationCfg?.defaultPage ?? 1
  const defaultPageSize = paginationCfg?.defaultPageSize ?? 10

  const globalFilterKey = globalFilterCfg?.key ?? 'filter'
  const globalFilterEnabled = globalFilterCfg?.enabled ?? true
  const trimGlobal = globalFilterCfg?.trim ?? true

  const initialColumnFilters: ColumnFiltersState = useMemo(() => {
    const collected: ColumnFiltersState = []
    for (const cfg of columnFiltersCfg) {
      const raw = currentSearchRecord[cfg.searchKey]
      const deserialize = cfg.deserialize ?? ((v: unknown) => v)

      if (cfg.type === 'string' || cfg.type === 'date') {
        const value = (deserialize(raw) as string) ?? ''
        if (typeof value === 'string' && value.trim() !== '') {
          collected.push({ id: cfg.columnId, value })
        }
      } else if (cfg.type === 'array' || cfg.type === 'dateRange') {
        const normalizedRaw =
          raw === undefined ? [] : typeof raw === 'string' ? [raw] : raw
        const value = (deserialize(normalizedRaw) as unknown[]) ?? []
        if (Array.isArray(value) && value.length > 0) {
          collected.push({ id: cfg.columnId, value })
        }
      }
    }
    return collected
  }, [columnFiltersCfg, currentSearchRecord])

  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>(initialColumnFilters)

  useEffect(() => {
    setColumnFilters(initialColumnFilters)
  }, [initialColumnFilters])

  const pagination: PaginationState = useMemo(() => {
    const rawPage = currentSearchRecord[pageKey]
    const rawPageSize = currentSearchRecord[pageSizeKey]
    const pageNum = rawPage ? Number(rawPage) : defaultPage
    const pageSizeNum = rawPageSize ? Number(rawPageSize) : defaultPageSize
    return { pageIndex: Math.max(0, pageNum - 1), pageSize: pageSizeNum }
  }, [currentSearchRecord, pageKey, pageSizeKey, defaultPage, defaultPageSize])

  const onPaginationChange: OnChangeFn<PaginationState> = (updater) => {
    const next = typeof updater === 'function' ? updater(pagination) : updater
    const nextPage = next.pageIndex + 1
    const nextPageSize = next.pageSize
    navigate({
      search: (prev) => ({
        ...prev,
        [pageKey]: nextPage <= defaultPage ? undefined : nextPage,
        [pageSizeKey]:
          nextPageSize === defaultPageSize ? undefined : nextPageSize,
      }),
    })
  }

  const [globalFilter, setGlobalFilter] = useState<string | undefined>(() => {
    if (!globalFilterEnabled) return undefined
    const raw = currentSearchRecord[globalFilterKey]
    return typeof raw === 'string' ? raw : ''
  })

  useEffect(() => {
    if (!globalFilterEnabled) return
    const raw = currentSearchRecord[globalFilterKey]
    const val = typeof raw === 'string' ? raw : ''
    setGlobalFilter(val)
  }, [currentSearchRecord, globalFilterKey, globalFilterEnabled])

  const onGlobalFilterChange: OnChangeFn<string> | undefined =
    globalFilterEnabled
      ? (updater) => {
          const next =
            typeof updater === 'function'
              ? updater(globalFilter ?? '')
              : updater
          const value = trimGlobal ? next.trim() : next
          setGlobalFilter(value)
          navigate({
            search: (prev) => ({
              ...prev,
              [pageKey]: undefined,
              [globalFilterKey]: value ? value : undefined,
            }),
          })
        }
      : undefined

  const onColumnFiltersChange: OnChangeFn<ColumnFiltersState> = (updater) => {
    const next =
      typeof updater === 'function' ? updater(columnFilters) : updater
    setColumnFilters(next)

    const patch: Record<string, unknown> = {}

    for (const cfg of columnFiltersCfg) {
      const found = next.find((f) => f.id === cfg.columnId)
      const serialize = cfg.serialize ?? ((v: unknown) => v)

      if (cfg.type === 'string' || cfg.type === 'date') {
        const value =
          typeof found?.value === 'string' ? (found.value as string) : ''
        patch[cfg.searchKey] =
          value.trim() !== '' ? serialize(value) : undefined
      } else if (cfg.type === 'array' || cfg.type === 'dateRange') {
        const value = Array.isArray(found?.value)
          ? (found!.value as unknown[])
          : []
        patch[cfg.searchKey] = value.length > 0 ? serialize(value) : undefined
      }
    }

    navigate({
      search: (prev) => ({
        ...prev,
        [pageKey]: undefined,
        ...patch,
      }),
    })
  }

  const ensurePageInRange = (
    pageCount: number,
    opts: { resetTo?: 'first' | 'last' } = { resetTo: 'first' }
  ) => {
    const currentPage = currentSearchRecord[pageKey]
    const pageNum = currentPage ? Number(currentPage) : defaultPage
    if (pageCount > 0 && pageNum > pageCount) {
      navigate({
        replace: true,
        search: (prev) => ({
          ...prev,
          [pageKey]: opts.resetTo === 'last' ? pageCount : undefined,
        }),
      })
    }
  }

  return {
    globalFilter: globalFilterEnabled ? (globalFilter ?? '') : undefined,
    onGlobalFilterChange,
    columnFilters,
    onColumnFiltersChange,
    pagination,
    onPaginationChange,
    ensurePageInRange,
  }
}
