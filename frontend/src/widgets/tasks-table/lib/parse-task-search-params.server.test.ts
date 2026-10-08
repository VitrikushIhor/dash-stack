import { endOfDay, startOfDay } from 'date-fns'
import { describe, expect, it, vi } from 'vitest'
import { serializeFilterDateRange } from '@/shared/lib/date-range'
import { getParsedTaskFilters } from './parse-task-search-params.server'

vi.mock('server-only', () => ({}))

describe('task filter transport', () => {
  it('should_preserve_client_timezone_bounds_when_loading_server_filters', () => {
    const from = new Date(2026, 9, 24)
    const to = new Date(2026, 9, 26)
    const range = serializeFilterDateRange({ from, to })

    const filters = getParsedTaskFilters({ dueDate: range?.join(',') })

    expect(filters.dueDateFrom).toBe(startOfDay(from).toISOString())
    expect(filters.dueDateTo).toBe(endOfDay(to).toISOString())
  })
})
