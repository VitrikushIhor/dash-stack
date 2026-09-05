import { logger } from '@/shared/lib'
import { ApiError } from './api-error'
import { type QueryResult } from './types'

export function handleQueryError(
  error: unknown,
  context?: string
): QueryResult<never> {
  if (context) {
    logger.error(`[Query Error: ${context}]`, error)
  } else {
    logger.error('[Query Error]', error)
  }

  if (error instanceof ApiError) {
    if (error.isUnauthorized) {
      return {
        ok: false,
        error: { code: 'UNAUTHORIZED', message: error.message },
      }
    }
    if (error.isForbidden) {
      return { ok: false, error: { code: 'FORBIDDEN', message: error.message } }
    }
    if (error.isNotFound) {
      return { ok: false, error: { code: 'NOT_FOUND', message: error.message } }
    }
    if (error.isValidationError) {
      return {
        ok: false,
        error: {
          code: 'VALIDATION',
          message:
            error.validationMessages.length > 0
              ? error.validationMessages[0]
              : error.message,
        },
      }
    }

    return { ok: false, error: { code: 'UNKNOWN', message: error.message } }
  }

  if (error instanceof Error) {
    return { ok: false, error: { code: 'UNKNOWN', message: error.message } }
  }

  return {
    ok: false,
    error: { code: 'UNKNOWN', message: 'An unexpected error occurred' },
  }
}
