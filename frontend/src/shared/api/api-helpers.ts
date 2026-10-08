import { toast } from 'sonner'
import { logger } from '@/shared/lib'
import { ApiError } from './http/api-error'

export const getErrorMessage = (
  error: unknown,
  fallbackMessage: string = 'An unexpected error occurred'
): string => {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }

  return fallbackMessage
}

export function handleServerError(error: unknown): void {
  logger.error('[Server Error]', {
    statusCode: error instanceof ApiError ? error.statusCode : undefined,
  })

  if (Array.isArray(error)) {
    error.forEach((msg) => {
      if (typeof msg === 'string') toast.error(msg)
    })

    return
  }

  if (typeof error === 'string') {
    toast.error(error)

    return
  }

  if (error instanceof ApiError) {
    if (error.isValidationError && error.validationMessages.length > 0) {
      error.validationMessages.forEach((msg) => toast.error(msg))

      return
    }
    toast.error(error.message)

    return
  }

  if (error instanceof Error) {
    toast.error(error.message)

    return
  }

  toast.error('Something went wrong!')
}

export const getFileUrl = (
  key: string | null | undefined
): string | undefined => {
  if (!key) return undefined
  if (key.startsWith('http')) return key
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

  return `${baseUrl}/uploads/${key}`
}
