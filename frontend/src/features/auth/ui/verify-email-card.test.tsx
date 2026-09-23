import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ROUTES } from '@/shared/config'
import { render, screen, waitFor } from '@/shared/lib/test'
import { userKeys } from '@/entities/user'
import { VerifyEmailCard } from './verify-email-card'

const mockVerifyEmailAction = vi.fn()
const mockReplace = vi.fn()

vi.mock('../api/actions/verify-email.action', () => ({
  verifyEmailAction: (...args: unknown[]) => mockVerifyEmailAction(...args),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
  }),
}))

describe('VerifyEmailCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders missing token error when no token is provided', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <VerifyEmailCard />
      </QueryClientProvider>
    )

    expect(screen.getByText('Verification failed')).toBeInTheDocument()
    expect(
      screen.getByText(/verification link is invalid: no token provided/i)
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /back to sign in/i })
    ).toBeInTheDocument()
  })

  it('renders success state when email verification succeeds', async () => {
    mockVerifyEmailAction.mockResolvedValueOnce({ success: true })
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    queryClient.setQueryData(userKeys.me(), { id: 'user-a' })

    render(
      <QueryClientProvider client={queryClient}>
        <VerifyEmailCard token='valid-email-token' />
      </QueryClientProvider>
    )

    await waitFor(() => {
      expect(mockVerifyEmailAction).toHaveBeenCalledWith({
        token: 'valid-email-token',
      })
    })

    expect(
      screen.getByText('Your email has been verified!')
    ).toBeInTheDocument()
    expect(screen.getByText(/your account is now active/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /continue now/i })
    ).toBeInTheDocument()
    expect(queryClient.getQueryData(userKeys.me())).toBeUndefined()
  })

  it('redirects to sign-in when clicking continue or back to sign in button', async () => {
    const user = userEvent.setup()
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })

    render(
      <QueryClientProvider client={queryClient}>
        <VerifyEmailCard />
      </QueryClientProvider>
    )

    await user.click(screen.getByRole('button', { name: /back to sign in/i }))

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.signIn)
  })
})
