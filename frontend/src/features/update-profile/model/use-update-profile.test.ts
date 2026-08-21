import { act, renderHook } from '@testing-library/react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleServerError } from '@/shared/api'
import { type User } from '@/entities/user'
import { updateProfileAction } from '../api/update-profile.action'
import { useUpdateProfile } from './use-update-profile'

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockMutateAsync = vi.fn()
vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>()
  return {
    ...actual,
    useUploadImage: () => ({
      mutateAsync: mockMutateAsync,
      isPending: false,
    }),
    handleServerError: vi.fn(),
  }
})

vi.mock('../api/update-profile.action', () => ({
  updateProfileAction: vi.fn(),
}))

describe('useUpdateProfile', () => {
  const baseUser: User = {
    id: 'user-1',
    firstName: 'Alice',
    lastName: 'Smith',
    email: 'alice@example.com',
    bio: 'Old bio',
    avatar: 'avatars/old.webp',
    dob: '1995-05-15',
    urls: ['https://old.com'],
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('successfully updates changed fields and shows success toast', async () => {
    const mockUpdatedUser = {
      ...baseUser,
      firstName: 'Alice Updated',
      bio: 'New bio',
    }

    vi.mocked(updateProfileAction).mockResolvedValue({
      success: true,
      data: mockUpdatedUser,
    })

    const onSuccess = vi.fn()
    const { result } = renderHook(() => useUpdateProfile())

    let success = false
    await act(async () => {
      success = await result.current.updateProfile(
        baseUser,
        {
          firstName: 'Alice Updated',
          lastName: 'Smith',
          email: 'alice@example.com',
          bio: 'New bio',
          dob: new Date(1995, 4, 15),
          avatar: { kind: 'key', value: 'avatars/old.webp' },
          urls: [{ value: 'https://old.com' }],
        },
        { onSuccess }
      )
    })

    expect(success).toBe(true)
    expect(updateProfileAction).toHaveBeenCalledWith({
      firstName: 'Alice Updated',
      bio: 'New bio',
    })
    expect(toast.success).toHaveBeenCalledWith('Profile updated successfully.')
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('skips network call if no fields changed', async () => {
    const onSuccess = vi.fn()
    const { result } = renderHook(() => useUpdateProfile())

    let success = false
    await act(async () => {
      success = await result.current.updateProfile(
        baseUser,
        {
          firstName: 'Alice',
          lastName: 'Smith',
          email: 'alice@example.com',
          bio: 'Old bio',
          dob: new Date(1995, 4, 15),
          avatar: { kind: 'key', value: 'avatars/old.webp' },
          urls: [{ value: 'https://old.com' }],
        },
        { onSuccess }
      )
    })

    expect(success).toBe(true)
    expect(updateProfileAction).not.toHaveBeenCalled()
    expect(toast.success).toHaveBeenCalledWith('Profile updated successfully.')
    expect(onSuccess).toHaveBeenCalledTimes(1)
  })

  it('uploads file avatar first if kind is file', async () => {
    mockMutateAsync.mockResolvedValue({ key: 'avatars/uploaded.webp' })
    vi.mocked(updateProfileAction).mockResolvedValue({
      success: true,
      data: {
        ...baseUser,
        avatar: 'avatars/uploaded.webp',
      },
    })

    const fakeFile = new File(['fake'], 'avatar.png', { type: 'image/png' })
    const { result } = renderHook(() => useUpdateProfile())

    let success = false
    await act(async () => {
      success = await result.current.updateProfile(baseUser, {
        firstName: 'Alice',
        lastName: 'Smith',
        email: 'alice@example.com',
        bio: 'Old bio',
        dob: new Date(1995, 4, 15),
        avatar: { kind: 'file', value: fakeFile },
        urls: [{ value: 'https://old.com' }],
      })
    })

    expect(mockMutateAsync).toHaveBeenCalledWith(fakeFile)
    expect(updateProfileAction).toHaveBeenCalledWith({
      avatar: 'avatars/uploaded.webp',
    })
    expect(success).toBe(true)
  })

  it('handles server action error response with handleServerError', async () => {
    vi.mocked(updateProfileAction).mockResolvedValue({
      success: false,
      error: 'Profile update failed',
    })

    const { result } = renderHook(() => useUpdateProfile())

    let success = false
    await act(async () => {
      success = await result.current.updateProfile(baseUser, {
        firstName: 'Alice New',
        lastName: 'Smith',
        email: 'alice@example.com',
        bio: 'Old bio',
        avatar: { kind: 'none' },
        urls: [{ value: 'https://old.com' }],
      })
    })

    expect(success).toBe(false)
    expect(handleServerError).toHaveBeenCalledWith('Profile update failed')
  })
})
