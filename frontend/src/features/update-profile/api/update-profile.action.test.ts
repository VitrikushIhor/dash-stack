import { revalidatePath } from 'next/cache'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ApiError } from '@/shared/api'
import { ROUTES } from '@/shared/config'
import { userServerApi } from '@/entities/user/server'
import { updateProfileAction } from './update-profile.action'

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

vi.mock('@/entities/user/server', () => ({
  userServerApi: {
    updateMe: vi.fn(),
  },
}))

describe('updateProfileAction', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('successfully updates user profile and revalidates dashboard layout', async () => {
    const mockUpdatedUser = {
      id: 'user-1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      bio: 'Hello world',
      dob: '1990-01-01',
      avatar: 'avatars/avatar.webp',
      urls: ['https://example.com'],
    }
    vi.mocked(userServerApi.updateMe).mockResolvedValue(mockUpdatedUser)

    const result = await updateProfileAction({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      bio: 'Hello world',
      dob: '1990-01-01',
      avatar: 'avatars/avatar.webp',
      urls: ['https://example.com'],
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(mockUpdatedUser)
    }
    expect(userServerApi.updateMe).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      bio: 'Hello world',
      dob: '1990-01-01',
      avatar: 'avatars/avatar.webp',
      urls: ['https://example.com'],
    })
    expect(revalidatePath).toHaveBeenCalledWith(ROUTES.home, 'layout')
  })

  it('allows null bio when updating profile', async () => {
    const mockUpdatedUser = {
      id: 'user-1',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      bio: null,
      dob: null,
      avatar: null,
      urls: [],
    }
    vi.mocked(userServerApi.updateMe).mockResolvedValue(mockUpdatedUser)

    const result = await updateProfileAction({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      bio: null,
      dob: null,
      avatar: null,
      urls: [],
    })

    expect(result.success).toBe(true)
    expect(userServerApi.updateMe).toHaveBeenCalledWith({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      bio: null,
      dob: null,
      avatar: null,
      urls: [],
    })
  })

  it('fails validation when email is invalid', async () => {
    const result = await updateProfileAction({
      email: 'not-an-email',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Validation failed')
    }
    expect(userServerApi.updateMe).not.toHaveBeenCalled()
  })

  it('handles ApiError correctly on server rejection', async () => {
    vi.mocked(userServerApi.updateMe).mockRejectedValue(
      new ApiError(400, 'Email already taken')
    )

    const result = await updateProfileAction({
      email: 'taken@example.com',
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error).toBe('Email already taken')
    }
  })
})
