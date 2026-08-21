import { act, fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { LandingNavbarContainer } from './landing-navbar-container'

describe('LandingNavbarContainer', () => {
  it('renders children correctly', () => {
    render(
      <LandingNavbarContainer>
        <div data-testid='child'>Nav Content</div>
      </LandingNavbarContainer>
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Nav Content')).toBeInTheDocument()
  })

  it('has a transparent background initially (scrollY = 0)', () => {
    render(
      <LandingNavbarContainer>
        <div>Nav Content</div>
      </LandingNavbarContainer>
    )

    const header = screen.getByRole('banner') // <header> element
    expect(header).toHaveClass('bg-transparent')
    expect(header).not.toHaveClass('bg-background/90')
  })

  it('adds a semi-transparent background and blur effect when scrolled down (scrollY > 20)', () => {
    vi.useFakeTimers()

    render(
      <LandingNavbarContainer>
        <div>Nav Content</div>
      </LandingNavbarContainer>
    )

    const header = screen.getByRole('banner')

    Object.defineProperty(window, 'scrollY', {
      value: 25,
      writable: true,
      configurable: true,
    })

    act(() => {
      fireEvent.scroll(window)
      vi.runAllTimers()
    })

    expect(header).toHaveClass('bg-background/90', 'backdrop-blur-md')
    expect(header).not.toHaveClass('bg-transparent')

    vi.useRealTimers()
  })
})
