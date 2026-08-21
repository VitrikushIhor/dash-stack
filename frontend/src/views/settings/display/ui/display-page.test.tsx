import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { DisplayPage } from './display-page'

vi.mock('./display-form', () => ({
  DisplayForm: () => <div data-testid='display-form'>Form</div>,
}))

describe('DisplayPage', () => {
  it('renders the settings section with display form', () => {
    render(<DisplayPage />)
    expect(screen.getByText('Display')).toBeInTheDocument()
    expect(
      screen.getByText(/Turn items on or off to control what's displayed/i)
    ).toBeInTheDocument()
    expect(screen.getByTestId('display-form')).toBeInTheDocument()
  })
})
