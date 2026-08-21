import type { ApiErrorResponse } from './types'

export class ApiError extends Error {
  readonly statusCode: number
  readonly errorCode: string
  readonly details: ApiErrorResponse | null
  readonly validationMessages: string[]

  constructor(
    statusCode: number,
    message: string,
    raw: ApiErrorResponse | null = null
  ) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.errorCode = raw?.error ?? 'UnknownError'
    this.details = raw
    this.validationMessages = Array.isArray(raw?.message) ? raw!.message : []
  }

  get isValidationError(): boolean {
    return this.statusCode === 400 && this.validationMessages.length > 0
  }

  get isUnauthorized(): boolean {
    return this.statusCode === 401
  }

  get isForbidden(): boolean {
    return this.statusCode === 403
  }

  get isNotFound(): boolean {
    return this.statusCode === 404
  }
}

/**
 * Extracts a single readable message from a NestJS-style error payload.
 * message can be a string OR an array of validation strings.
 */
export function extractErrorMessage(
  payload: unknown,
  fallback = 'An error occurred'
): string {
  if (!payload || typeof payload !== 'object') return fallback
  const data = payload as Partial<ApiErrorResponse>
  if (Array.isArray(data.message)) return data.message[0] ?? fallback
  if (typeof data.message === 'string') return data.message
  return fallback
}
