import { beforeEach, describe, expect, it, vi } from 'vitest'
import { userServerApi } from '../user-api.server'
import { getCurrentUser } from './get-current-user.server'

vi.mock('../user-api.server', () => ({
  userServerApi: {
    getMe: vi.fn(),
  },
}))

describe('getCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns user data and null error on success', async () => {
    const mockUser = {
      id: 'user-1',
      firstName: 'Alice',
      lastName: 'Smith',
      email: 'alice@example.com',
    }
    vi.mocked(userServerApi.getMe).mockResolvedValue(mockUser)

    const result = await getCurrentUser()

    expect(result).toEqual({
      data: mockUser,
      error: null,
    })
    expect(userServerApi.getMe).toHaveBeenCalledTimes(1)
  })

  it('returns null data and formatted error message on failure', async () => {
    vi.mocked(userServerApi.getMe).mockRejectedValue(new Error('Unauthorized'))

    const result = await getCurrentUser()

    expect(result).toEqual({
      data: null,
      error: 'Unauthorized',
    })
  })
})
