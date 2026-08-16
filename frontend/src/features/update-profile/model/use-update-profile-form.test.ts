import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { type User } from '@/entities/user'
import { useUpdateProfile } from './use-update-profile'
import { useUpdateProfileForm } from './use-update-profile-form'

vi.mock('./use-update-profile', () => ({
  useUpdateProfile: vi.fn(),
}))

describe('useUpdateProfileForm', () => {
  const mockUpdateProfile = vi.fn()

  const mockUser: User = {
    id: 'user-200',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    bio: 'Software engineer',
    dob: '1990-01-15',
    avatar: 'avatars/avatar.webp',
    urls: ['https://example.com'],
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useUpdateProfile).mockReturnValue({
      updateProfile: mockUpdateProfile,
      isPending: false,
    })
  })

  it('pre-populates form with existing user profile details', () => {
    const { result } = renderHook(() => useUpdateProfileForm(mockUser))

    expect(result.current.form.getValues()).toEqual({
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      bio: 'Software engineer',
      dob: new Date(1990, 0, 15),
      avatar: { kind: 'key', value: 'avatars/avatar.webp' },
      urls: [{ value: 'https://example.com' }],
    })
  })

  it('submits updated values when form is submitted', async () => {
    mockUpdateProfile.mockResolvedValue(true)

    const { result } = renderHook(() => useUpdateProfileForm(mockUser))

    await act(async () => {
      result.current.form.setValue('firstName', 'Johnny')
      await result.current.onSubmit()
    })

    expect(mockUpdateProfile).toHaveBeenCalledWith(
      mockUser,
      expect.objectContaining({ firstName: 'Johnny' }),
      expect.any(Object)
    )
  })
})
