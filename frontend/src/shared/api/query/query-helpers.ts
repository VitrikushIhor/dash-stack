import { logger } from '@/shared/lib'
import { ApiError } from '../http/api-error'
import { type QueryResult } from '../types'
import { QUERY_ERROR_CODES } from './query-error-codes'

export function handleQueryError(
  error: unknown,
  context?: string
): QueryResult<never> {
  logger.error('[Query Error]', {
    context: context ?? 'unknown',
    statusCode: error instanceof ApiError ? error.statusCode : undefined,
  })

  if (error instanceof ApiError) {
    if (error.isUnauthorized) {
      return {
        ok: false,
        error: { code: QUERY_ERROR_CODES.UNAUTHORIZED, message: error.message },
      }
    }
    if (error.isForbidden) {
      return {
        ok: false,
        error: { code: QUERY_ERROR_CODES.FORBIDDEN, message: error.message },
      }
    }
    if (error.isNotFound) {
      return {
        ok: false,
        error: { code: QUERY_ERROR_CODES.NOT_FOUND, message: error.message },
      }
    }
    if (error.isValidationError) {
      return {
        ok: false,
        error: {
          code: QUERY_ERROR_CODES.VALIDATION,
          message:
            error.validationMessages.length > 0
              ? error.validationMessages[0]
              : error.message,
        },
      }
    }

    return {
      ok: false,
      error: { code: QUERY_ERROR_CODES.UNKNOWN, message: error.message },
    }
  }

  if (error instanceof Error) {
    return {
      ok: false,
      error: { code: QUERY_ERROR_CODES.UNKNOWN, message: error.message },
    }
  }

  return {
    ok: false,
    error: {
      code: QUERY_ERROR_CODES.UNKNOWN,
      message: 'An unexpected error occurred',
    },
  }
}
