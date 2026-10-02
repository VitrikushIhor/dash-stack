import { describe, expect, it, vi } from 'vitest'
import { fetchCalendarTasks } from '../server'
import { CalendarMonthPage } from './calendar-month-page'

vi.mock('../server', () => ({ fetchCalendarTasks: vi.fn() }))

describe('CalendarMonthPage', () => {
  it('should_show_page_error_when_calendar_tasks_cannot_be_loaded', async () => {
    vi.mocked(fetchCalendarTasks).mockResolvedValue({
      slug: 'acme-corp',
      date: new Date('2026-01-01'),
      result: {
        ok: false,
        error: { code: 'UNKNOWN', message: 'Calendar unavailable' },
      },
    })

    const view = await CalendarMonthPage({
      slug: 'acme-corp',
      searchParams: Promise.resolve({}),
    })

    expect(view.props).toEqual({
      error: { code: 'UNKNOWN', message: 'Calendar unavailable' },
      withContainer: false,
    })
  })
})
