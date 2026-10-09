import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getCurrentUser } from '../../api/queries/get-current-user.server'
import { requireAuthenticatedUser } from './authentication-guards.server'

const { unauthorizedMock } = vi.hoisted(() => ({
  unauthorizedMock: vi.fn(() => {
    throw new Error('UNAUTHORIZED_INTERRUPT')
  }),
}))

vi.mock('next/navigation', () => ({
  unauthorized: unauthorizedMock,
}))

vi.mock('../../api/queries/get-current-user.server', () => ({
  getCurrentUser: vi.fn(),
}))

describe('requireAuthenticatedUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the current user when the session is valid', async () => {
    const user = {
      id: 'user-1',
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
    }

    vi.mocked(getCurrentUser).mockResolvedValue({
      data: user,
      error: null,
      statusCode: null,
    })

    await expect(requireAuthenticatedUser()).resolves.toEqual(user)
    expect(unauthorizedMock).not.toHaveBeenCalled()
  })

  it('invokes unauthorized interrupt when the backend returns 401', async () => {
    vi.mocked(getCurrentUser).mockResolvedValue({
      data: null,
      error: 'Unauthorized',
      statusCode: 401,
    })

    await expect(requireAuthenticatedUser()).rejects.toThrow(
      'UNAUTHORIZED_INTERRUPT'
    )
    expect(unauthorizedMock).toHaveBeenCalledTimes(1)
  })
})
