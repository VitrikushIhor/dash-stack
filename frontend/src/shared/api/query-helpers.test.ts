import { describe, expect, it } from 'vitest'
import { ApiError } from './api-error'
import { handleQueryError } from './query-helpers'

describe('handleQueryError', () => {
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
