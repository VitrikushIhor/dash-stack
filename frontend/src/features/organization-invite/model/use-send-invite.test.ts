import { useRouter } from 'next/navigation'
import { renderHook, act, waitFor } from '@testing-library/react'
import { toast } from 'sonner'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { handleServerError } from '@/shared/api'
import { OrgRole } from '@/entities/organization'
import { sendInviteAction } from '../api/actions/send-invite.action'
import { useSendInvite } from './use-send-invite'

// Mock dependencies
vi.mock('../api/actions/send-invite.action', () => ({
  sendInviteAction: vi.fn(),
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

describe('useSendInvite', () => {
  const mockRefresh = vi.fn()
  const mockOnSuccess = vi.fn()
  const defaultDto = { email: 'new@example.com', role: OrgRole.MEMBER }

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

  it('sends an invite successfully, calls onSuccess, and refreshes the page', async () => {
    vi.mocked(sendInviteAction).mockResolvedValue({
      success: true,
      data: {
        id: 'invite-1',
        email: 'new@example.com',
        role: OrgRole.MEMBER,
        orgId: 'org-1',
        token: 'token-1',
        invitedBy: 'admin-1',
        expiresAt: '2026-12-31T00:00:00.000Z',
        createdAt: '2026-12-01T00:00:00.000Z',
      },
    })

    const { result } = renderHook(() => useSendInvite())

    act(() => {
      result.current.sendInvite('org-1', defaultDto, {
        onSuccess: mockOnSuccess,
      })
    })

    // It should immediately be pending
    expect(result.current.isPending).toBe(true)

    // Wait for async action to complete
    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    // Behavior verification:
    // 1. Called the API action
    expect(sendInviteAction).toHaveBeenCalledWith('org-1', defaultDto)
    // 2. Showed a success toast
    expect(toast.success).toHaveBeenCalledWith('Invitation sent successfully')
    // 3. Called the optional onSuccess callback
    expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    // 4. Refreshed the page router
    expect(mockRefresh).toHaveBeenCalledTimes(1)
    // 5. Did not call the error handler
    expect(handleServerError).not.toHaveBeenCalled()
  })

  it('handles server errors correctly (without validation messages)', async () => {
    const errorResponse = { success: false as const, error: 'Failed to send' }
    vi.mocked(sendInviteAction).mockResolvedValue(errorResponse)

    const { result } = renderHook(() => useSendInvite())

    act(() => {
      result.current.sendInvite('org-1', defaultDto, {
        onSuccess: mockOnSuccess,
      })
    })

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    // Behavior verification:
    // 1. Handled the server error (standard error message)
    expect(handleServerError).toHaveBeenCalledWith('Failed to send')
    // 2. Did NOT show success toast
    expect(toast.success).not.toHaveBeenCalled()
    // 3. Did NOT call onSuccess
    expect(mockOnSuccess).not.toHaveBeenCalled()
    // 4. Did NOT refresh the page
    expect(mockRefresh).not.toHaveBeenCalled()
  })

  it('handles validation errors correctly (preferring validationMessages over standard error)', async () => {
    const errorResponse = {
      success: false as const,
      error: 'General Error',
      validationMessages: ['Invalid email format'],
    }
    vi.mocked(sendInviteAction).mockResolvedValue(errorResponse)

    const { result } = renderHook(() => useSendInvite())

    act(() => {
      result.current.sendInvite('org-1', defaultDto)
    })

    await waitFor(() => {
      expect(result.current.isPending).toBe(false)
    })

    // Behavior verification:
    // It should pass validationMessages to handleServerError instead of standard error
    expect(handleServerError).toHaveBeenCalledWith(['Invalid email format'])
    expect(handleServerError).not.toHaveBeenCalledWith('General Error')
  })
})
