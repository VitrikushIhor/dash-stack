import { describe, expect, it, vi } from 'vitest'
import { fetchTaskViewData } from '@/views/task/server'
import OrganizationTaskKanbanPage from './page'

vi.mock('@/views/task/server', () => ({ fetchTaskViewData: vi.fn() }))

describe('OrganizationTaskKanbanPage', () => {
  it('should_show_page_error_when_tasks_cannot_be_loaded', async () => {
    vi.mocked(fetchTaskViewData).mockResolvedValue({
      slug: 'acme-corp',
      result: {
        ok: false,
        error: { code: 'UNKNOWN', message: 'Tasks unavailable' },
      },
    })

    const view = await OrganizationTaskKanbanPage({
      params: Promise.resolve({ slug: 'acme-corp' }),
      searchParams: Promise.resolve({}),
    })

    expect(view.props).toEqual({
      error: { code: 'UNKNOWN', message: 'Tasks unavailable' },
      withContainer: false,
    })
  })
})
