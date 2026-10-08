import { describe, expect, it, vi } from 'vitest'
import { fetchCalendarTasks } from '../server'
import { renderCalendarPage } from './render-calendar-page'

vi.mock('../server', () => ({ fetchCalendarTasks: vi.fn() }))

describe('renderCalendarPage', () => {
  it('should_pass_requested_view_and_tasks_to_client_when_fetch_succeeds', async () => {
    const searchParams = Promise.resolve({})
    vi.mocked(fetchCalendarTasks).mockResolvedValue({
      slug: 'acme-corp',
      date: new Date('2026-01-01'),
      result: { ok: true, data: [] },
    })

    const view = await renderCalendarPage({
      slug: 'acme-corp',
      searchParams,
      view: 'year',
    })

    expect(fetchCalendarTasks).toHaveBeenCalledWith(
      'acme-corp',
      'year',
      searchParams
    )
    expect(view.props).toMatchObject({
      slug: 'acme-corp',
      tasks: [],
      view: 'year',
    })
  })

  it('should_render_error_when_fetch_fails', async () => {
    vi.mocked(fetchCalendarTasks).mockResolvedValue({
      slug: 'acme-corp',
      date: new Date('2026-01-01'),
      result: {
        ok: false,
        error: { code: 'UNKNOWN', message: 'Calendar unavailable' },
      },
    })

    const view = await renderCalendarPage({
      slug: 'acme-corp',
      searchParams: Promise.resolve({}),
      view: 'month',
    })

    expect(view.props).toEqual({
      error: { code: 'UNKNOWN', message: 'Calendar unavailable' },
      withContainer: false,
    })
  })
})
