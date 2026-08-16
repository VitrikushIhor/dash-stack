import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/shared/lib/test'
import ForgotPasswordRoute from './page'

vi.mock('@/views/auth', () => ({
  ForgotPassword: () => (
    <div data-testid='forgot-password-view'>ForgotPassword View Mock</div>
  ),
}))

describe('ForgotPasswordRoute App Page', () => {
  it('renders ForgotPassword view component', () => {
    render(<ForgotPasswordRoute />)

    expect(screen.getByTestId('forgot-password-view')).toBeInTheDocument()
  })
})
