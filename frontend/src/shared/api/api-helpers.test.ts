import { describe, expect, it, vi } from 'vitest'
import { logger } from '@/shared/lib'
import { handleServerError } from './api-helpers'
import { ApiError } from './http/api-error'

vi.mock('sonner', () => ({ toast: { error: vi.fn() } }))

describe('server error handling', () => {
  it('should_not_log_raw_api_error_details', () => {
    const log = vi.spyOn(logger, 'error').mockImplementation(() => undefined)
    const error = new ApiError(500, 'TOKEN_SECRET', {
      statusCode: 500,
      error: 'InternalServerError',
      message: 'TOKEN_SECRET',
    })

    handleServerError(error)

    expect(JSON.stringify(log.mock.calls)).not.toContain('TOKEN_SECRET')
    expect(log.mock.calls).toEqual([['[Server Error]', { statusCode: 500 }]])
    log.mockRestore()
  })
})
