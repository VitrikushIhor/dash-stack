import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { NotificationsPage } from './notifications-page'

vi.mock('./notifications-form', () => ({
  NotificationsForm: () => <div data-testid='notifications-form'>Form</div>,
}))

describe('NotificationsPage', () => {
  it('renders the settings section with notifications form', () => {
    render(<NotificationsPage />)
    expect(screen.getByText('Notifications')).toBeInTheDocument()
    expect(
      screen.getByText(/Configure how you receive notifications/i)
    ).toBeInTheDocument()
    expect(screen.getByTestId('notifications-form')).toBeInTheDocument()
  })
})
