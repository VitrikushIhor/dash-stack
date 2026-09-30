import { describe, expect, it, vi } from 'vitest'
import { logger } from '@/shared/lib'
import { ApiError } from '../http/api-error'
import { handleQueryError } from './query-helpers'

describe('handleQueryError', () => {
  it('does not log raw API errors or credentials', () => {
    const log = vi.spyOn(logger, 'error').mockImplementation(() => undefined)
    const error = new ApiError(500, 'TOKEN_SECRET', {
      statusCode: 500,
      message: 'TOKEN_SECRET',
      error: 'UPSTREAM',
    })

    handleQueryError(error, 'getMyDecksQuery')

    const logged = JSON.stringify(log.mock.calls)
    expect(logged).toContain('getMyDecksQuery')
    expect(logged).not.toContain('TOKEN_SECRET')
    log.mockRestore()
  })

  it('maps 401 API errors to UNAUTHORIZED query errors', () => {
    const result = handleQueryError(new ApiError(401, 'Sign in required'))

    expect(result).toEqual({
      ok: false,
      error: { code: 'UNAUTHORIZED', message: 'Sign in required' },
    })
  })

  it('maps 403 API errors to FORBIDDEN query errors', () => {
    const result = handleQueryError(new ApiError(403, 'Access denied'))

    expect(result).toEqual({
      ok: false,
      error: { code: 'FORBIDDEN', message: 'Access denied' },
    })
  })
})
