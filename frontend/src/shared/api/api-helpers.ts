import { toast } from 'sonner'
import { ApiError } from './api-error'

export { ApiError, extractErrorMessage } from './api-error'

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export function handleServerError(error: unknown): void {
  // eslint-disable-next-line no-console
  console.log(error)

  if (error instanceof ApiError) {
    if (error.isValidationError && error.validationMessages.length > 0) {
      toast.error(error.validationMessages[0])
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
