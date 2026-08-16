import { describe, expect, it, vi } from 'vitest'
import { ROUTES } from '@/shared/config'
import { render, screen } from '@/shared/lib/test'
import SignInRoute from './page'

vi.mock('@/views/auth', () => ({
  SignIn: ({ redirectTo }: { redirectTo?: string }) => (
    <div data-testid='sign-in-view' data-redirect-to={redirectTo}>
      SignIn View Mock
    </div>
  ),
}))

describe('SignInRoute App Page', () => {
  it('awaits searchParams and renders SignIn view with redirect property', async () => {
    const searchParamsPromise = Promise.resolve({ redirect: ROUTES.settings })

    const pageElement = await SignInRoute({ searchParams: searchParamsPromise })
    render(pageElement)

    const view = screen.getByTestId('sign-in-view')
    expect(view).toBeInTheDocument()
    expect(view).toHaveAttribute('data-redirect-to', ROUTES.settings)
  })

  it('renders SignIn view without redirect when searchParams does not contain redirect', async () => {
    const searchParamsPromise = Promise.resolve({})

    const pageElement = await SignInRoute({ searchParams: searchParamsPromise })
    render(pageElement)

    const view = screen.getByTestId('sign-in-view')
    expect(view).toBeInTheDocument()
    expect(view).not.toHaveAttribute('data-redirect-to')
  })
})
