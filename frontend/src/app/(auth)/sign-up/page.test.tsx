import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@/shared/lib/test'
import SignUpRoute from './page'

vi.mock('@/views/auth', () => ({
  SignUp: () => <div data-testid='sign-up-view'>SignUp View Mock</div>,
}))

describe('SignUpRoute App Page', () => {
  it('renders SignUp view component', () => {
    render(<SignUpRoute />)

    expect(screen.getByTestId('sign-up-view')).toBeInTheDocument()
  })
})
