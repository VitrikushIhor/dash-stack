import { type ReactElement } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ROUTES } from '@/shared/config/constants/routes'
import { render, screen, waitFor } from '@/shared/lib/test/test-utils'
import { AcceptInviteCard } from './accept-invite-card'

const mockAcceptInviteAction = vi.fn()
const mockReplace = vi.fn()

vi.mock('../api/accept-invite.action', () => ({
  acceptInviteAction: (...args: unknown[]) => mockAcceptInviteAction(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
}))

function renderWithQuery(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>
  )
}

describe('AcceptInviteCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders missing token error when no token is provided', () => {
    renderWithQuery(<AcceptInviteCard />)

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
    mockAcceptInviteAction.mockResolvedValueOnce({ id: 'membership-1' })

    renderWithQuery(<AcceptInviteCard token='valid-invite-token' />)

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
    mockAcceptInviteAction.mockRejectedValueOnce(
      new Error('Invitation has expired')
    )

    renderWithQuery(<AcceptInviteCard token='expired-token' />)

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
      .mockRejectedValueOnce(new Error('Network error'))
      .mockResolvedValueOnce({ id: 'membership-1' })

    renderWithQuery(<AcceptInviteCard token='valid-token' />)

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
    renderWithQuery(<AcceptInviteCard />)

    await user.click(screen.getByRole('button', { name: /back to sign in/i }))

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.signIn)
  })

  it('navigates to organizations when clicking continue on success', async () => {
    const user = userEvent.setup()
    mockAcceptInviteAction.mockResolvedValueOnce({ id: 'membership-1' })

    renderWithQuery(<AcceptInviteCard token='valid-invite-token' />)

    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /continue now/i })
      ).toBeInTheDocument()
    })

    await user.click(screen.getByRole('button', { name: /continue now/i }))

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.organizations)
  })
})
