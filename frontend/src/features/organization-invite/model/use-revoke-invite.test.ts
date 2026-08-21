import { useRouter } from 'next/navigation'
import { act, renderHook, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { handleServerError } from '@/shared/api'
import { revokeInviteAction } from '../api/actions/revoke-invite.action'
import { useRevokeInvite } from './use-revoke-invite'

// Mock dependencies
vi.mock('../api/actions/revoke-invite.action', () => ({
  revokeInviteAction: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}))

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
  },
}))

vi.mock('@/shared/api', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/shared/api')>()
  return {
    ...actual,
    handleServerError: vi.fn(),
  }
})

describe('useRevokeInvite', () => {
  const mockRefresh = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useRouter).mockReturnValue({
      refresh: mockRefresh,
      back: vi.fn(),
      forward: vi.fn(),
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    })
  })

  it('revokes an invite successfully and refreshes the page', async () => {
    vi.mocked(revokeInviteAction).mockResolvedValue({
      success: true,
      data: undefined,
    })

    const { result } = renderHook(() => useRevokeInvite())

    act(() => {
      result.current.revokeInvite('org-1', 'invite-1')
    })

    // It should immediately be pending
    expect(result.current.isPending).toBe(true)

    // Wait for async action to complete
    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    // Behavior verification:
    // 1. Called the API action
    expect(revokeInviteAction).toHaveBeenCalledWith('org-1', 'invite-1')
    // 2. Showed a success toast
    expect(toast.success).toHaveBeenCalledWith('Invitation revoked')
    // 3. Refreshed the page router
    expect(mockRefresh).toHaveBeenCalledTimes(1)
    // 4. Did not call the error handler
    expect(handleServerError).not.toHaveBeenCalled()
  })

  it('handles server errors correctly without crashing', async () => {
    const errorResponse = { success: false as const, error: 'Failed to revoke' }
    vi.mocked(revokeInviteAction).mockResolvedValue(errorResponse)

    const { result } = renderHook(() => useRevokeInvite())

    act(() => {
      result.current.revokeInvite('org-1', 'invite-1')
    })

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    // Behavior verification:
    // 1. Called the API action
    expect(revokeInviteAction).toHaveBeenCalledWith('org-1', 'invite-1')
    // 2. Handled the server error
    expect(handleServerError).toHaveBeenCalledWith('Failed to revoke')
    // 3. Did NOT show success toast
    expect(toast.success).not.toHaveBeenCalled()
    // 4. Did NOT refresh the page
    expect(mockRefresh).not.toHaveBeenCalled()
  })
})
