import { useRouter } from 'next/navigation'
import { act, renderHook, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ROUTES } from '@/shared/config'
import { logoutAction } from '../../api/actions/logout.action'
import { useLogout } from './use-logout-hook'

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))
vi.mock('sonner', () => ({
  toast: { success: vi.fn() },
}))
vi.mock('../../api/actions/logout.action', () => ({
  logoutAction: vi.fn(),
}))

describe('useLogout', () => {
  const push = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({
      push,
      replace: vi.fn(),
      refresh: vi.fn(),
      back: vi.fn(),
      forward: vi.fn(),
      prefetch: vi.fn(),
    })
  })

  it('should_logout_with_server_action_and_navigate_to_sign_in', async () => {
    vi.mocked(logoutAction).mockResolvedValue({
      success: true,
      data: { message: 'Logged out successfully' },
    })

    const { result } = renderHook(() => useLogout())

    act(() => result.current.handleLogout())

    expect(result.current.isPending).toBe(true)

    await waitFor(() => expect(result.current.isPending).toBe(false))

    expect(logoutAction).toHaveBeenCalledOnce()
    expect(toast.success).toHaveBeenCalledWith('Logged out successfully')
    expect(push).toHaveBeenCalledWith(ROUTES.signIn)
  })
})
