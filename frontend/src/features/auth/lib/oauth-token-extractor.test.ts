import { beforeEach, describe, expect, it } from 'vitest'
import { extractOAuthToken } from './oauth-token-extractor'

describe('extractOAuthToken', () => {
  beforeEach(() => {
    window.history.pushState({}, '', '/')
  })

  it('returns code when code is present in params', () => {
    const result = extractOAuthToken({ code: 'param-code-123' })
    expect(result).toBe('param-code-123')
  })

  it('returns token when token is present in params and code is not', () => {
    const result = extractOAuthToken({ token: 'param-token-456' })
    expect(result).toBe('param-token-456')
  })

  it('prioritizes code over token when both are in params', () => {
    const result = extractOAuthToken({
      code: 'param-code-123',
      token: 'param-token-456',
    })
    expect(result).toBe('param-code-123')
  })

  it('extracts access_token from window.location.search when params are empty', () => {
    window.history.pushState({}, '', '/?access_token=search-access-token')
    const result = extractOAuthToken({})
    expect(result).toBe('search-access-token')
  })

  it('extracts token from window.location.search when access_token is absent', () => {
    window.history.pushState({}, '', '/?token=search-token')
    const result = extractOAuthToken({})
    expect(result).toBe('search-token')
  })

  it('extracts code from window.location.search when token and access_token are absent', () => {
    window.history.pushState({}, '', '/?code=search-code')
    const result = extractOAuthToken({})
    expect(result).toBe('search-code')
  })

  it('extracts access_token from window.location.hash when search has no token', () => {
    window.history.pushState({}, '', '/#access_token=hash-access-token')
    const result = extractOAuthToken({})
    expect(result).toBe('hash-access-token')
  })

  it('extracts token from window.location.hash when access_token is absent in hash', () => {
    window.history.pushState({}, '', '/#token=hash-token')
    const result = extractOAuthToken({})
    expect(result).toBe('hash-token')
  })

  it('extracts code from window.location.hash when others are absent in hash', () => {
    window.history.pushState({}, '', '/#code=hash-code')
    const result = extractOAuthToken({})
    expect(result).toBe('hash-code')
  })

  it('returns null when no token or code is found anywhere', () => {
    window.history.pushState(
      {},
      '',
      '/?error=access_denied#some_other_param=123'
    )
    const result = extractOAuthToken({})
    expect(result).toBeNull()
  })
})
