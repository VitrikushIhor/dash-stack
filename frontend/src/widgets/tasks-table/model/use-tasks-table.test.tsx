import { type ReactNode } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { act, renderHook, waitFor } from '@testing-library/react'
import { NuqsTestingAdapter, type UrlUpdateEvent } from 'nuqs/adapters/testing'
import { describe, expect, it, vi } from 'vitest'
import { serializeFilterDateRange } from '@/shared/lib/date-range'
import { type Task } from '@/entities/task'
import { useTasksTableState } from './use-tasks-table'

const columns: ColumnDef<Task, unknown>[] = [
  { accessorKey: 'dueDate' },
  { accessorKey: 'status' },
]

describe('task table URL filters', () => {
  it('should_use_controller_page_reset_and_preserve_range_bounds_when_column_filter_changes', async () => {
    const onUrlUpdate = vi.fn<(event: UrlUpdateEvent) => void>()
    const wrapper = ({ children }: { children: ReactNode }) => (
      <NuqsTestingAdapter
        searchParams='?page=4&perPage=25&update-task=task-1'
        onUrlUpdate={onUrlUpdate}
        hasMemory
      >
        {children}
      </NuqsTestingAdapter>
    )
    const { result } = renderHook(
      () => useTasksTableState({ data: [], columns, pageCount: 4 }),
      { wrapper }
    )
    const range = serializeFilterDateRange({
      from: new Date(2026, 9, 5),
      to: new Date(2026, 9, 7),
    })

    act(() =>
      result.current.setColumnFilters([{ id: 'dueDate', value: range }])
    )

    await waitFor(() =>
      expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get('dueDate')).toBe(
        range?.join(',')
      )
    )
    expect(onUrlUpdate.mock.lastCall?.[0].searchParams.has('page')).toBe(false)
    expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get('perPage')).toBe(
      '25'
    )
    expect(onUrlUpdate.mock.lastCall?.[0].searchParams.get('update-task')).toBe(
      'task-1'
    )
  })
})
