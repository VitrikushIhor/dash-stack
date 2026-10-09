import { endOfDay, startOfDay } from 'date-fns'
import {
  getCoreRowModel,
  getFilteredRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import {
  readFilterDateRange,
  serializeFilterDateRange,
} from '@/shared/lib/date-range'
import { dateRangeFilterFn } from './date-range-filter'

describe('dateRangeFilterFn', () => {
  it('should_include_the_entire_last_day_when_using_serialized_calendar_bounds', () => {
    const from = new Date(2026, 9, 5)
    const to = new Date(2026, 9, 7)
    const value = serializeFilterDateRange({ from, to })
    const { result } = renderHook(() =>
      useReactTable({
        data: [
          { date: new Date(2026, 9, 4).toISOString() },
          { date: startOfDay(from).toISOString() },
          { date: endOfDay(to).toISOString() },
          { date: new Date(2026, 9, 8).toISOString() },
        ],
        columns: [{ accessorKey: 'date', filterFn: dateRangeFilterFn }],
        state: { columnFilters: [{ id: 'date', value }] },
        getCoreRowModel: getCoreRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
      })
    )

    expect(
      result.current.getRowModel().rows.map((row) => row.original.date)
    ).toEqual([startOfDay(from).toISOString(), endOfDay(to).toISOString()])
    expect(readFilterDateRange([from, to])).toEqual({ from, to })
    expect(readFilterDateRange(['invalid', 'invalid'])).toBeUndefined()
    expect(readFilterDateRange([to, from])).toBeUndefined()
  })
})
