import { describe, expect, it, vi } from 'vitest'
import OAuthCallbackRoute from './page'

const redirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: (path: string) => redirect(path),
}))

describe('OAuthCallbackRoute App Page', () => {
  it('should_redirect_legacy_callback_without_reading_url_credentials', () => {
    OAuthCallbackRoute()
    expect(redirect).toHaveBeenCalledWith('/sign-in')
  })
})
