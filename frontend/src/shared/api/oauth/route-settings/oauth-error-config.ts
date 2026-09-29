export const OAUTH_ERROR_CONFIG = {
  CSRF_FORBIDDEN: { message: 'Request origin is not trusted', status: 403 },
  PAYLOAD_TOO_LARGE: { message: 'Request body is too large', status: 413 },
  INVALID_REQUEST: { message: 'Invalid account linking request', status: 400 },
  UNAVAILABLE: {
    message: 'OAuth is unavailable',
    status: 503,
  },
} as const
