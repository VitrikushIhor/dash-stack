import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ROUTES } from '@/shared/config/constants/routes'
import { render, screen, waitFor } from '@/shared/lib/test/test-utils'
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
    render(<VerifyEmailCard />)

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

    render(<VerifyEmailCard token='valid-email-token' />)

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
  })

  it('redirects to sign-in when clicking continue or back to sign in button', async () => {
    const user = userEvent.setup()
    render(<VerifyEmailCard />)

    await user.click(screen.getByRole('button', { name: /back to sign in/i }))

    expect(mockReplace).toHaveBeenCalledWith(ROUTES.signIn)
  })
})
