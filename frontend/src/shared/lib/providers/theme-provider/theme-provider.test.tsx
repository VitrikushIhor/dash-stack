import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ThemeProvider, useTheme } from './theme-provider'
import { isResolvedTheme, isTheme } from './theme-utils'

function TestComponent() {
  const { theme, resolvedTheme, setTheme, resetTheme, defaultTheme } =
    useTheme()

  return (
    <div>
      <span data-testid='theme'>{theme}</span>
      <span data-testid='resolvedTheme'>{resolvedTheme}</span>
      <span data-testid='defaultTheme'>{defaultTheme}</span>
      <button data-testid='set-dark' onClick={() => setTheme('dark')}>
        Set Dark
      </button>
      <button data-testid='set-light' onClick={() => setTheme('light')}>
        Set Light
      </button>
      <button data-testid='reset' onClick={() => resetTheme()}>
        Reset
      </button>
    </div>
  )
}

describe('ThemeProvider & useTheme', () => {
  it('provides default theme state and fallback resolvedTheme', () => {
    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    expect(screen.getByTestId('theme').textContent).toBe('system')
    expect(screen.getByTestId('defaultTheme').textContent).toBe('system')
    expect(screen.getByTestId('resolvedTheme').textContent).toBe('light')
  })

  it('updates theme state when setTheme is called', async () => {
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const setDarkBtn = screen.getByTestId('set-dark')
    await user.click(setDarkBtn)

    expect(screen.getByTestId('theme').textContent).toBe('dark')

    const setLightBtn = screen.getByTestId('set-light')
    await user.click(setLightBtn)

    expect(screen.getByTestId('theme').textContent).toBe('light')
  })

  it('resets theme to default when resetTheme is called', async () => {
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <TestComponent />
      </ThemeProvider>
    )

    const setDarkBtn = screen.getByTestId('set-dark')
    await user.click(setDarkBtn)
    expect(screen.getByTestId('theme').textContent).toBe('dark')

    const resetBtn = screen.getByTestId('reset')
    await user.click(resetBtn)
    expect(screen.getByTestId('theme').textContent).toBe('system')
  })

  it('validates theme runtime type guards accurately', () => {
    expect(isTheme('dark')).toBe(true)
    expect(isTheme('light')).toBe(true)
    expect(isTheme('system')).toBe(true)
    expect(isTheme('invalid')).toBe(false)
    expect(isTheme(undefined)).toBe(false)

    expect(isResolvedTheme('dark')).toBe(true)
    expect(isResolvedTheme('light')).toBe(true)
    expect(isResolvedTheme('system')).toBe(false)
    expect(isResolvedTheme(undefined)).toBe(false)
  })
})
