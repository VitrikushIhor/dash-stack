import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen, waitFor } from '@/shared/lib/test/test-utils'
import { ResetPasswordForm } from './reset-password-form'

const mockResetPasswordAction = vi.fn()
vi.mock('../model/mutations/auth-actions', () => ({
  resetPasswordAction: (...args: unknown[]) => mockResetPasswordAction(...args),
}))

describe('ResetPasswordForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders password and confirm password inputs and submit button', () => {
    render(<ResetPasswordForm token='sample-token' />)

    expect(screen.getByLabelText(/new password/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /reset password/i })
    ).toBeInTheDocument()
  })

  it('displays validation errors when submitting empty form or mismatching passwords', async () => {
    const user = userEvent.setup()
    render(<ResetPasswordForm token='sample-token' />)

    await user.click(screen.getByRole('button', { name: /reset password/i }))

    expect(
      await screen.findByText(/please enter a password/i)
    ).toBeInTheDocument()

    await user.type(screen.getByLabelText(/new password/i), 'password123')
    await user.type(screen.getByLabelText(/confirm password/i), 'different123')
    await user.click(screen.getByRole('button', { name: /reset password/i }))

    expect(
      await screen.findByText(/passwords don't match/i)
    ).toBeInTheDocument()
    expect(mockResetPasswordAction).not.toHaveBeenCalled()
  })

  it('submits form with matching valid passwords and displays success view', async () => {
    const user = userEvent.setup()
    mockResetPasswordAction.mockResolvedValueOnce({ success: true })

    render(<ResetPasswordForm token='valid-token-xyz' />)

    await user.type(screen.getByLabelText(/new password/i), 'newSecret123')
    await user.type(screen.getByLabelText(/confirm password/i), 'newSecret123')
    await user.click(screen.getByRole('button', { name: /reset password/i }))

    await waitFor(() => {
      expect(mockResetPasswordAction).toHaveBeenCalledWith(
        'valid-token-xyz',
        'newSecret123'
      )
    })

    expect(
      await screen.findByText(/password reset complete/i)
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign in/i })).toBeInTheDocument()
  })
})
