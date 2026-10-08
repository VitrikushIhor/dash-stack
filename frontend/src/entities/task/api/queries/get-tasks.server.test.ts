import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ApiError } from '@/shared/api'
import { taskServerApi } from '../task-api.server'
import { getOrganizationTasks, getTasksUnpaginated } from './get-tasks.server'

vi.mock('../task-api.server', () => ({
  taskServerApi: { findAll: vi.fn(), findAllUnpaginated: vi.fn() },
}))

describe('task server queries', () => {
  beforeEach(() => vi.clearAllMocks())

  it('should_return_typed_error_when_paginated_tasks_fail', async () => {
    vi.mocked(taskServerApi.findAll).mockRejectedValue(
      new ApiError(503, 'Tasks unavailable')
    )

    expect(await getOrganizationTasks('acme-corp', { page: 1 })).toEqual({
      ok: false,
      error: { code: 'UNKNOWN', message: 'Tasks unavailable' },
    })
  })

  it('should_return_typed_error_when_calendar_tasks_fail', async () => {
    vi.mocked(taskServerApi.findAllUnpaginated).mockRejectedValue(
      new ApiError(403, 'Access denied')
    )

    expect(await getTasksUnpaginated('acme-corp')).toEqual({
      ok: false,
      error: { code: 'FORBIDDEN', message: 'Access denied' },
    })
  })

  it('should_reject_invalid_organization_slug_before_loading_tasks', async () => {
    const result = await getOrganizationTasks('../admin')

    expect(result).toMatchObject({
      ok: false,
      error: { code: 'VALIDATION' },
    })
    expect(taskServerApi.findAll).not.toHaveBeenCalled()
  })
})
