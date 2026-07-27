import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LandingNavbar } from './landing-navbar'

vi.mock('./landing-navbar-container', () => ({
  LandingNavbarContainer: ({ children }: { children: React.ReactNode }) => (
    <div data-testid='mock-container'>{children}</div>
  ),
}))

vi.mock('./landing-navbar-auth', () => ({
  LandingNavbarAuth: () => <div data-testid='mock-auth'>Auth</div>,
}))

vi.mock('./landing-navbar-mobile', () => ({
  LandingNavbarMobile: () => <div data-testid='mock-mobile'>Mobile Menu</div>,
}))

describe('LandingNavbar', () => {
  it('renders the Dash Stack logo and desktop navigation links', () => {
    render(<LandingNavbar />)

    expect(screen.getByText('Dash Stack')).toBeInTheDocument()

    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
  })

  it('composes the mobile menu and auth components successfully', () => {
    render(<LandingNavbar />)

    expect(screen.getByTestId('mock-container')).toBeInTheDocument()
    expect(screen.getByTestId('mock-auth')).toBeInTheDocument()
    expect(screen.getByTestId('mock-mobile')).toBeInTheDocument()
  })
})
