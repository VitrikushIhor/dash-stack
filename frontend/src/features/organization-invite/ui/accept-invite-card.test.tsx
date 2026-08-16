import { type ReactElement } from 'react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ROUTES } from '@/shared/config/constants/routes'
import { render, screen, waitFor } from '@/shared/lib/test/test-utils'
import { AcceptInviteCard } from './accept-invite-card'

const mockAcceptInviteAction = vi.fn()
const mockReplace = vi.fn()

vi.mock('../api/actions/accept-invite.action', () => ({
  acceptInviteAction: (...args: unknown[]) => mockAcceptInviteAction(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
}))

function renderComponent(ui: ReactElement) {
  return render(ui)
}

describe('AcceptInviteCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders missing token error when no token is provided', () => {
    renderComponent(<AcceptInviteCard />)

    expect(
      screen.getByText('Invitation could not be accepted')
    ).toBeInTheDocument()
    expect(
      screen.getByText(/no invitation token provided/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /back to sign in/i })
    ).toBeInTheDocument()
  })

  it('renders success state when invitation acceptance succeeds', async () => {
    mockAcceptInviteAction.mockResolvedValueOnce({
      success: true,
      data: { id: 'membership-1' },
    })

    renderComponent(<AcceptInviteCard token='valid-invite-token' />)

    await waitFor(() => {
      expect(mockAcceptInviteAction).toHaveBeenCalledWith('valid-invite-token')
    })

    expect(
      screen.getByText('Your invitation has been accepted!')
    ).toBeInTheDocument()
    expect(
      screen.getByText(/you have joined the organization/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /continue now/i })
    ).toBeInTheDocument()
  })

  it('renders error state with retry button when invitation acceptance fails', async () => {
    mockAcceptInviteAction.mockResolvedValueOnce({
      success: false,
      error: 'Invitation has expired',
    })

    renderComponent(<AcceptInviteCard token='expired-token' />)

    await waitFor(() => {
      expect(mockAcceptInviteAction).toHaveBeenCalledWith('expired-token')
    })

    expect(
      screen.getByText('Invitation could not be accepted')
    ).toBeInTheDocument()
    expect(screen.getByText('Invitation has expired')).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /try again/i })
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /back to sign in/i })
    ).toBeInTheDocument()
  })

  it('allows retrying when clicking try again button', async () => {
    const user = userEvent.setup()
    mockAcceptInviteAction
      .mockResolvedValueOnce({ success: false, error: 'Network error' })
      .mockResolvedValueOnce({ success: true, data: { id: 'membership-1' } })

    renderComponent(<AcceptInviteCard token='valid-token' />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /try again/i })
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /try again/i }))

    await waitFor(() => {
      expect(mockAcceptInviteAction).toHaveBeenCalledTimes(2)
      expect(
        screen.getByText('Your invitation has been accepted!')
      ).toBeInTheDocument()
    })
  })

  it('navigates to sign-in when clicking back button on missing token', async () => {
    const user = userEvent.setup()
    renderComponent(<AcceptInviteCard />)

    await user.click(screen.getByRole('button', { name: /back to sign in/i }))

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.signIn)
  })

  it('navigates to organizations when clicking continue on success', async () => {
    const user = userEvent.setup()
    mockAcceptInviteAction.mockResolvedValueOnce({
      success: true,
      data: { id: 'membership-1' },
    })

    renderComponent(<AcceptInviteCard token='valid-invite-token' />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /continue now/i })
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /continue now/i }))

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.organizations)
  })
})
