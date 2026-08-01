import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getCookie, removeCookie, setCookie } from './cookies'

describe('Browser Cookies Utility (cookies.ts)', () => {
  let originalDocumentCookie: string

  beforeEach(() => {
    originalDocumentCookie = document.cookie

    let mockCookie = ''
    Object.defineProperty(document, 'cookie', {
      get: () => mockCookie,
      set: (val: string) => {
        mockCookie = val
      },
      configurable: true,
    })
  })

  afterEach(() => {
    Object.defineProperty(document, 'cookie', {
      value: originalDocumentCookie,
      writable: true,
      configurable: true,
    })
  })

  describe('getCookie', () => {
    it('returns undefined when cookie does not exist', () => {
      document.cookie = 'other=value; something=123'
      expect(getCookie('test')).toBeUndefined()
    })

    it('returns the value of an existing cookie', () => {
      document.cookie = 'other=value; test=expectedValue; another=123'
      expect(getCookie('test')).toBe('expectedValue')
    })

    it('returns undefined in SSR environment (typeof document === undefined)', () => {
      const originalDocument = global.document
      // @ts-expect-error - Simulating SSR
      delete global.document

      expect(getCookie('test')).toBeUndefined()

      global.document = originalDocument
    })
  })

  describe('setCookie', () => {
    it('sets a cookie with default maxAge (7 days)', () => {
      setCookie('test', 'value')
      expect(document.cookie).toContain('test=value; path=/; max-age=604800')
    })

    it('sets a cookie with custom maxAge', () => {
      setCookie('test', 'value', 3600)
      expect(document.cookie).toContain('test=value; path=/; max-age=3600')
    })

    it('does nothing in SSR environment', () => {
      const originalDocument = global.document
      // @ts-expect-error - Simulating SSR
      delete global.document

      expect(() => setCookie('test', 'value')).not.toThrow()

      global.document = originalDocument
    })
  })

  describe('removeCookie', () => {
    it('removes a cookie by setting max-age to 0', () => {
      removeCookie('test')
      expect(document.cookie).toContain('test=; path=/; max-age=0')
    })

    it('does nothing in SSR environment', () => {
      const originalDocument = global.document
      // @ts-expect-error - Simulating SSR
      delete global.document

      expect(() => removeCookie('test')).not.toThrow()

      global.document = originalDocument
    })
  })
})
