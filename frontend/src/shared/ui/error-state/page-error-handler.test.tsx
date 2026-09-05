import { beforeEach, describe, expect, it, vi } from 'vitest'
import { PageErrorHandler } from './page-error-handler'

const { forbiddenMock, notFoundMock, unauthorizedMock } = vi.hoisted(() => ({
  forbiddenMock: vi.fn(() => {
    throw new Error('FORBIDDEN_INTERRUPT')
  }),
  notFoundMock: vi.fn(() => {
    throw new Error('NOT_FOUND_INTERRUPT')
  }),
  unauthorizedMock: vi.fn(() => {
    throw new Error('UNAUTHORIZED_INTERRUPT')
  }),
}))

vi.mock('next/navigation', () => ({
  forbidden: forbiddenMock,
  notFound: notFoundMock,
  unauthorized: unauthorizedMock,
}))

describe('PageErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('invokes unauthorized interrupt for unauthorized query errors', () => {
    expect(() =>
      PageErrorHandler({
        error: { code: 'UNAUTHORIZED', message: 'Sign in required' },
      })
    ).toThrow('UNAUTHORIZED_INTERRUPT')

    expect(unauthorizedMock).toHaveBeenCalledTimes(1)
    expect(forbiddenMock).not.toHaveBeenCalled()
    expect(notFoundMock).not.toHaveBeenCalled()
  })

  it('invokes forbidden interrupt for forbidden query errors', () => {
    expect(() =>
      PageErrorHandler({
        error: { code: 'FORBIDDEN', message: 'Access denied' },
      })
    ).toThrow('FORBIDDEN_INTERRUPT')

    expect(forbiddenMock).toHaveBeenCalledTimes(1)
    expect(unauthorizedMock).not.toHaveBeenCalled()
    expect(notFoundMock).not.toHaveBeenCalled()
  })

  it('invokes notFound interrupt for missing resources', () => {
    expect(() =>
      PageErrorHandler({
        error: { code: 'NOT_FOUND', message: 'Missing deck' },
      })
    ).toThrow('NOT_FOUND_INTERRUPT')

    expect(notFoundMock).toHaveBeenCalledTimes(1)
  })
})
