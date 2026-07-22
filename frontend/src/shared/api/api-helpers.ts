import { tokenStorage } from './token-storage'

// Token storage keys
export const ACCESS_TOKEN_KEY = 'accessToken'
export const REFRESH_TOKEN_KEY = 'refreshToken'

export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    return error.message
  }
  if (error instanceof Error) {
    return error.message
  }
  return 'An unexpected error occurred'
}

export const getAccessToken = (): string | null => null
export const getRefreshToken = (): string | null => null

// Token helpers (delegating to tokenStorage Route Handlers)
export const setTokens = (
  accessToken: string,
  refreshToken: string
): Promise<void> => {
  return tokenStorage.setTokens(accessToken, refreshToken)
}

export const clearTokens = (): Promise<void> => {
  return tokenStorage.clearTokens()
}

// Custom error class for API errors
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const getFileUrl = (
  key: string | null | undefined
): string | undefined => {
  if (!key) return undefined
  if (key.startsWith('http')) return key
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  return `${baseUrl}/uploads/${key}`
}
