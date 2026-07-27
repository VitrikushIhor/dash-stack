import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useCurrentUser } from '@/entities/user'
import { useIsAuthenticated } from './use-is-authenticated'

vi.mock('@/entities/user', () => ({
  useCurrentUser: vi.fn(),
}))

describe('useIsAuthenticated', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns isAuthenticated: true and user data when user is logged in', () => {
    const mockUser = {
      id: 'usr-1',
      email: 'user@example.com',
      firstName: 'John',
      lastName: 'Doe',
    }
    vi.mocked(useCurrentUser).mockReturnValue({
      data: mockUser,
      isLoading: false,
    } as Partial<ReturnType<typeof useCurrentUser>> as ReturnType<
      typeof useCurrentUser
    >)

    const { result } = renderHook(() => useIsAuthenticated())

    expect(result.current.isAuthenticated).toBe(true)
    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isLoading).toBe(false)
  })

  it('returns isAuthenticated: false when user is logged out', () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      data: undefined,
      isLoading: false,
    } as Partial<ReturnType<typeof useCurrentUser>> as ReturnType<
      typeof useCurrentUser
    >)

    const { result } = renderHook(() => useIsAuthenticated())

    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.user).toBeUndefined()
    expect(result.current.isLoading).toBe(false)
  })

  it('reflects isLoading status while current user request is pending', () => {
    vi.mocked(useCurrentUser).mockReturnValue({
      data: undefined,
      isLoading: true,
    } as Partial<ReturnType<typeof useCurrentUser>> as ReturnType<
      typeof useCurrentUser
    >)

    const { result } = renderHook(() => useIsAuthenticated())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.isAuthenticated).toBe(false)
  })
})
