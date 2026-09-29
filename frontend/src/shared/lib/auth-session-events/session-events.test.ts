import { afterEach, describe, expect, it, vi } from 'vitest'
import { logger } from '@/shared/lib/logger'
import { AUTH_SESSION_EVENT_KIND } from './session-event-kind'
import {
  parseAuthSessionEvent,
  publishAuthSessionEvent,
  readAuthSessionEvent,
} from './session-events'

describe('parseAuthSessionEvent', () => {
  it('should return a typed event when the payload is valid', () => {
    const event = {
      id: '5a996e87-405a-454e-a7c0-c33528ec6d90',
      kind: AUTH_SESSION_EVENT_KIND.SIGNED_OUT,
    }

    expect(parseAuthSessionEvent(JSON.stringify(event))).toEqual(event)
  })

  it.each([
    null,
    '{',
    JSON.stringify({ id: 'invalid', kind: AUTH_SESSION_EVENT_KIND.SIGNED_IN }),
    JSON.stringify({
      id: '5a996e87-405a-454e-a7c0-c33528ec6d90',
      kind: 'unknown',
    }),
  ])('should reject an invalid event payload', (value) => {
    expect(parseAuthSessionEvent(value)).toBeNull()
  })
})

afterEach(() => vi.restoreAllMocks())

describe('Auth notification storage failures', () => {
  it.each(['SecurityError', 'QuotaExceededError'])(
    'should_preserve_auth_completion_when_publish_fails_with_%s',
    (name) => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new DOMException('SECRET', name)
      })
      const warn = vi.spyOn(logger, 'warn').mockImplementation(() => undefined)
      expect(() =>
        publishAuthSessionEvent(AUTH_SESSION_EVENT_KIND.SIGNED_IN)
      ).not.toThrow()
      expect(warn).toHaveBeenCalledWith(
        'Auth session notification unavailable',
        { operation: 'publish' }
      )
    }
  )

  it('should_return_no_notification_and_report_when_storage_read_is_blocked', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('SECRET', 'SecurityError')
    })
    const warn = vi.spyOn(logger, 'warn').mockImplementation(() => undefined)
    expect(readAuthSessionEvent()).toBeNull()
    expect(warn).toHaveBeenCalledWith('Auth session notification unavailable', {
      operation: 'read',
    })
  })
})
