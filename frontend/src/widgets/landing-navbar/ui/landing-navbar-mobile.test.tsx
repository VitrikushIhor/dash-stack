import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LandingNavbarMobile } from './landing-navbar-mobile'

vi.mock('./landing-navbar-auth', () => ({
  LandingNavbarAuth: () => (
    <div data-testid='mock-auth-component'>Mock Auth</div>
  ),
}))

const mockLinks = [
  { href: '/#features', label: 'Features' },
  { href: '/#pricing', label: 'Pricing' },
]

describe('LandingNavbarMobile', () => {
  it('renders a hamburger menu button initially', () => {
    render(<LandingNavbarMobile navLinks={mockLinks} />)
    const button = screen.getByRole('button', { name: /toggle menu/i })
    expect(button).toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('does not show navigation links when the menu is closed', () => {
    render(<LandingNavbarMobile navLinks={mockLinks} />)
    expect(screen.queryByText('Features')).not.toBeInTheDocument()
    expect(screen.queryByTestId('mock-auth-component')).not.toBeInTheDocument()
  })

  it('toggles the menu open when clicking the hamburger button, displaying the links and auth component', () => {
    render(<LandingNavbarMobile navLinks={mockLinks} />)
    const button = screen.getByRole('button', { name: /toggle menu/i })

    fireEvent.click(button)

    expect(button).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText('Features')).toBeInTheDocument()
    expect(screen.getByText('Pricing')).toBeInTheDocument()
    expect(screen.getByTestId('mock-auth-component')).toBeInTheDocument()
  })

  it('closes the menu when clicking the close button', () => {
    render(<LandingNavbarMobile navLinks={mockLinks} />)
    const button = screen.getByRole('button', { name: /toggle menu/i })

    fireEvent.click(button)
    expect(screen.getByText('Features')).toBeInTheDocument()

    fireEvent.click(button)
    expect(screen.queryByText('Features')).not.toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the menu when a navigation link is clicked', () => {
    render(<LandingNavbarMobile navLinks={mockLinks} />)
    const button = screen.getByRole('button', { name: /toggle menu/i })

    fireEvent.click(button)

    const featureLink = screen.getByText('Features')
    fireEvent.click(featureLink)

    expect(screen.queryByText('Features')).not.toBeInTheDocument()
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })
})
