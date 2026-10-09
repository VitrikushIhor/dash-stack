import { describe, expect, it } from 'vitest'
import { parseFrontendEnv } from './env'

describe('Frontend environment validation', () => {
  it('should_reject_missing_backend_url_in_production', () => {
    expect(() => parseFrontendEnv({ NODE_ENV: 'production' })).toThrow(
      'Invalid environment variables'
    )
  })

  it('should_reject_remote_http_backend_url_in_production', () => {
    expect(() =>
      parseFrontendEnv({
        NODE_ENV: 'production',
        API_URL: 'http://api.example.com',
      })
    ).toThrow('Invalid environment variables')
  })

  it.each([
    'https://user:pass@api.example.com',
    'https://api.example.com/path',
    'https://api.example.com/?token=secret',
    'https://api.example.com/#fragment',
  ])('should_reject_non_origin_backend_url_%s', (url) => {
    expect(() =>
      parseFrontendEnv({ NODE_ENV: 'production', API_URL: url })
    ).toThrow('Invalid environment variables')
  })

  it('should_reject_production_without_app_origin_even_when_oauth_is_disabled', () => {
    expect(() =>
      parseFrontendEnv({
        NODE_ENV: 'production',
        API_URL: 'https://api.example.com',
      })
    ).toThrow('Invalid environment variables')
  })

  it.each([
    'http://app.example.com',
    'https://app.example.com/path',
    'invalid',
  ])('should_reject_unsafe_app_origin_without_oauth_%s', (appOrigin) => {
    expect(() =>
      parseFrontendEnv({
        NODE_ENV: 'production',
        API_URL: 'https://api.example.com',
        NEXT_PUBLIC_APP_URL: appOrigin,
      })
    ).toThrow('Invalid environment variables')
  })

  it('should_accept_https_and_local_loopback_backend_urls_in_production', () => {
    expect(
      parseFrontendEnv({
        NODE_ENV: 'production',
        API_URL: 'https://api.example.com',
        NEXT_PUBLIC_APP_URL: 'https://app.example.com',
      }).API_URL
    ).toBe('https://api.example.com')
    expect(
      parseFrontendEnv({
        NODE_ENV: 'production',
        API_URL: 'http://localhost:8000',
        FRONTEND_URL: 'http://localhost:3000',
      }).API_URL
    ).toBe('http://localhost:8000')
  })

  it('should_reject_partial_or_invalid_oauth_configuration_in_production', () => {
    const base = { NODE_ENV: 'production', API_URL: 'https://api.example.com' }
    for (const values of [
      { NEXT_PUBLIC_AUTH0_DOMAIN: 'tenant.auth0.com' },
      { NEXT_PUBLIC_AUTH0_CLIENT_ID: 'client-123' },
      {
        NEXT_PUBLIC_AUTH0_DOMAIN: 'https://evil.example/path',
        NEXT_PUBLIC_AUTH0_CLIENT_ID: 'client-123',
      },
      {
        NEXT_PUBLIC_AUTH0_DOMAIN: 'your-auth0-domain.auth0.com',
        NEXT_PUBLIC_AUTH0_CLIENT_ID: 'your-auth0-client-id',
      },
      {
        NEXT_PUBLIC_AUTH0_DOMAIN: 'tenant.auth0.com',
        NEXT_PUBLIC_AUTH0_CLIENT_ID: 'client-123',
      },
      {
        NEXT_PUBLIC_AUTH0_DOMAIN: 'tenant.auth0.com',
        NEXT_PUBLIC_AUTH0_CLIENT_ID: 'client-123',
        NEXT_PUBLIC_APP_URL: 'https://app.example.com/path',
      },
    ]) {
      expect(() => parseFrontendEnv({ ...base, ...values })).toThrow(
        'Invalid environment variables'
      )
    }
  })

  it('should_accept_complete_oauth_configuration_in_production', () => {
    const parsed = parseFrontendEnv({
      NODE_ENV: 'production',
      API_URL: 'https://api.example.com',
      NEXT_PUBLIC_AUTH0_DOMAIN: 'tenant.auth0.com',
      NEXT_PUBLIC_AUTH0_CLIENT_ID: 'client-123',
      NEXT_PUBLIC_APP_URL: 'https://app.example.com',
    })
    expect(parsed.NEXT_PUBLIC_AUTH0_DOMAIN).toBe('tenant.auth0.com')
  })

  it('should_accept_frontend_url_fallback_for_local_oauth_in_production', () => {
    const parsed = parseFrontendEnv({
      NODE_ENV: 'production',
      API_URL: 'http://127.0.0.1:8000',
      NEXT_PUBLIC_AUTH0_DOMAIN: 'tenant.auth0.com',
      NEXT_PUBLIC_AUTH0_CLIENT_ID: 'client-123',
      FRONTEND_URL: 'http://localhost:3000',
    })

    expect(parsed.FRONTEND_URL).toBe('http://localhost:3000')
  })

  it.each([
    'https://user:pass@app.example.com',
    'http://app.example.com',
    'https://app.example.com/path',
  ])('should_reject_unsafe_oauth_app_origin_%s', (appUrl) => {
    expect(() =>
      parseFrontendEnv({
        NODE_ENV: 'production',
        API_URL: 'https://api.example.com',
        NEXT_PUBLIC_AUTH0_DOMAIN: 'tenant.auth0.com',
        NEXT_PUBLIC_AUTH0_CLIENT_ID: 'client-123',
        NEXT_PUBLIC_APP_URL: appUrl,
      })
    ).toThrow('Invalid environment variables')
  })

  it('should_keep_local_development_defaults', () => {
    expect(
      parseFrontendEnv({ NODE_ENV: 'development' }).API_URL
    ).toBeUndefined()
  })
})
