import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { ThemeProvider, useTheme } from '@/shared/lib/providers'
import { render, screen } from '@/shared/lib/test'
import { ThemeSwitch } from './theme-switch'

function ThemeConsumer() {
  const { theme } = useTheme()
  return <div data-testid='current-theme'>{theme}</div>
}

describe('ThemeSwitch', () => {
  it('renders trigger button', () => {
    render(
      <ThemeProvider>
        <ThemeSwitch />
      </ThemeProvider>
    )

    expect(
      screen.getByRole('button', { name: /toggle theme/i })
    ).toBeInTheDocument()
  })

  it('opens dropdown menu and allows changing theme with ARIA semantics', async () => {
    const user = userEvent.setup()

    render(
      <ThemeProvider>
        <ThemeSwitch />
        <ThemeConsumer />
      </ThemeProvider>
    )

    const trigger = screen.getByRole('button', { name: /toggle theme/i })
    await user.click(trigger)

    const systemOption = screen.getByRole('menuitemradio', { name: 'System' })
    expect(systemOption).toHaveAttribute('aria-checked', 'true')

    const darkOption = screen.getByRole('menuitemradio', { name: 'Dark' })
    expect(darkOption).toBeInTheDocument()
    expect(darkOption).toHaveAttribute('aria-checked', 'false')

    await user.click(darkOption)

    expect(screen.getByTestId('current-theme').textContent).toBe('dark')
  })
})
