import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { AppearancePage } from './appearance-page'

vi.mock('./appearance-form', () => ({
  AppearanceForm: () => <div data-testid='appearance-form'>Form</div>,
}))

describe('AppearancePage', () => {
  it('renders the settings section with appearance form', () => {
    render(<AppearancePage />)
    expect(screen.getByText('Appearance')).toBeInTheDocument()
    expect(
      screen.getByText(/Customize the appearance of the app/i)
    ).toBeInTheDocument()
    expect(screen.getByTestId('appearance-form')).toBeInTheDocument()
  })
})
