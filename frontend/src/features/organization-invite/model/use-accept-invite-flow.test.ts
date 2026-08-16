import { renderHook, waitFor, act } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { ROUTES } from '@/shared/config'
import { type Membership, OrgRole } from '@/entities/organization'
import { acceptInviteAction } from '../api/actions/accept-invite.action'
import { useAcceptInviteFlow } from './use-accept-invite-flow'

const mockMembership: Membership = {
  id: 'membership-1',
  userId: 'user-1',
  orgId: 'org-1',
  role: OrgRole.MEMBER,
  user: {
    id: 'user-1',
    email: 'test@example.com',
    firstName: 'Test User',
    avatar: undefined,
  },
}

const mockReplace = vi.fn()

vi.mock('../api/actions/accept-invite.action', () => ({
  acceptInviteAction: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
  }),
}))

describe('useAcceptInviteFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with error state if token is missing', () => {
    const { result } = renderHook(() => useAcceptInviteFlow(null))

    expect(result.current.status).toBe('error')
    expect(result.current.isFailed).toBe(true)
    expect(result.current.errorMessage).toBe('No invitation token provided')
  })

  it('calls acceptInviteAction and sets success state when token is valid', async () => {
    vi.mocked(acceptInviteAction).mockResolvedValue({
      success: true,
      data: mockMembership,
    })

    const { result } = renderHook(() => useAcceptInviteFlow('valid-token'))

    expect(result.current.status).toBe('loading')

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    expect(acceptInviteAction).toHaveBeenCalledWith('valid-token')
  })

  it('calls acceptInviteAction and sets error state when action fails', async () => {
    vi.mocked(acceptInviteAction).mockResolvedValue({
      success: false,
      error: 'Invalid token',
    })

    const { result } = renderHook(() => useAcceptInviteFlow('invalid-token'))

    await waitFor(() => {
      expect(result.current.status).toBe('error')
      expect(result.current.errorMessage).toBe('Invalid token')
    })
  })

  it('calls acceptInviteAction only once on mount despite strict mode', async () => {
    vi.mocked(acceptInviteAction).mockResolvedValue({
      success: true,
      data: mockMembership,
    })

    const { rerender } = renderHook(() => useAcceptInviteFlow('token-1'))
    rerender()

    await waitFor(() => {
      expect(acceptInviteAction).toHaveBeenCalledTimes(1)
    })
  })

  it('retries when handleRetry is called', async () => {
    vi.mocked(acceptInviteAction)
      .mockResolvedValueOnce({ success: false, error: 'Network error' })
      .mockResolvedValueOnce({ success: true, data: mockMembership })

    const { result } = renderHook(() => useAcceptInviteFlow('retry-token'))

    await waitFor(() => {
      expect(result.current.status).toBe('error')
    })

    act(() => {
      result.current.handleRetry!()
    })

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    expect(acceptInviteAction).toHaveBeenCalledTimes(2)
  })

  it('redirects to organizations after success with delay', async () => {
    vi.mocked(acceptInviteAction).mockResolvedValue({
      success: true,
      data: mockMembership,
    })

    const { result } = renderHook(() => useAcceptInviteFlow('redirect-token'))

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })

    await waitFor(
      () => {
        expect(mockReplace).toHaveBeenCalledWith(ROUTES.organizations)
      },
      { timeout: 3000 }
    )
  })

  it('redirects to sign in on continue if failed', async () => {
    vi.mocked(acceptInviteAction).mockResolvedValue({
      success: false,
      error: 'Failed',
    })

    const { result } = renderHook(() => useAcceptInviteFlow('failed-token'))

    await waitFor(() => {
      expect(result.current.status).toBe('error')
    })

    act(() => {
      result.current.handleContinue()
    })

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.signIn)
  })
})
