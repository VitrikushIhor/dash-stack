import type { ProxyError } from '../proxy.types'
import { PROXY_ERROR_CODES } from './proxy-error-codes'

export const PROXY_ERROR_CONFIG = {
  CSRF_FORBIDDEN: {
    status: 403,
    code: PROXY_ERROR_CODES.CSRF_FORBIDDEN,
    message: 'Request origin is not trusted',
  },
  INVALID_PATH: {
    status: 400,
    code: PROXY_ERROR_CODES.INVALID_PATH,
    message: 'Invalid path',
  },
  INVALID_REQUEST_BODY: {
    status: 400,
    code: PROXY_ERROR_CODES.INVALID_REQUEST_BODY,
    message: 'Invalid request body',
  },
  PAYLOAD_TOO_LARGE: {
    status: 413,
    code: PROXY_ERROR_CODES.PAYLOAD_TOO_LARGE,
    message: 'Request body too large',
  },
  UPSTREAM_REDIRECT: {
    status: 502,
    code: PROXY_ERROR_CODES.UPSTREAM_REDIRECT,
    message: 'Unexpected upstream redirect',
  },
  UPSTREAM_UNAVAILABLE: {
    status: 502,
    code: PROXY_ERROR_CODES.UPSTREAM_UNAVAILABLE,
    message: 'Backend temporarily unavailable',
  },
  UPSTREAM_UNAVAILABLE_RETRY: {
    status: 502,
    code: PROXY_ERROR_CODES.UPSTREAM_UNAVAILABLE,
    message: 'Backend temporarily unavailable during retry',
  },
  INVALID_REFRESH_RESPONSE: {
    status: 502,
    code: PROXY_ERROR_CODES.INVALID_REFRESH_RESPONSE,
    message: 'Invalid refresh response',
  },
  SESSION_REFRESH_UNAVAILABLE: {
    status: 503,
    code: PROXY_ERROR_CODES.SESSION_REFRESH_UNAVAILABLE,
    message: 'Session refresh temporarily unavailable',
  },
} as const satisfies Record<string, ProxyError>
