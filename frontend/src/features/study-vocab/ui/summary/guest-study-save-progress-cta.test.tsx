import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { type User, userApi, userKeys } from '@/entities/user'
import { GuestStudySaveProgressCta } from './guest-study-save-progress-cta'

afterEach(() => vi.restoreAllMocks())

describe('GuestStudySaveProgressCta', () => {
  function renderCta(user: User | null) {
    const client = new QueryClient()
    client.setQueryData(userKeys.me(), user)
    return render(
      <QueryClientProvider client={client}>
        <GuestStudySaveProgressCta />
      </QueryClientProvider>
    )
  }

  it('offers sign-in and account creation after a guest study session', () => {
    const getMe = vi.spyOn(userApi, 'getMe')
    renderCta(null)

    expect(
      screen.getByText(/sign in or create an account to save your progress/i)
    ).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /sign in/i })).toHaveAttribute(
      'href',
      '/sign-in'
    )
    expect(
      screen.getByRole('link', { name: /create account/i })
    ).toHaveAttribute('href', '/sign-up')
    expect(getMe).not.toHaveBeenCalled()
  })

  it('does not render for an authenticated visitor', () => {
    const getMe = vi.spyOn(userApi, 'getMe')
    const { container } = renderCta({
      id: 'user-1',
      firstName: 'Alice',
      email: 'alice@example.com',
    })

    expect(container).toBeEmptyDOMElement()
    expect(getMe).not.toHaveBeenCalled()
  })
})
