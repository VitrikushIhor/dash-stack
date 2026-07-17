import {
  ApiError,
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from './api-helpers'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

enum ApiMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

// Request options type
interface RequestOptions {
  method?: ApiMethod
  body?: unknown
  params?: Record<string, string | undefined>
  headers?: Record<string, string>
  skipAuth?: boolean
}

// Refresh token logic
let isRefreshing = false
let refreshPromise: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    throw new ApiError(401, 'No refresh token available')
  }

  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: ApiMethod.POST,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: refreshToken }),
  })

  if (!response.ok) {
    clearTokens()
    window.location.href = '/sign-in'
    throw new ApiError(response.status, 'Failed to refresh token')
  }

  const data = await response.json()
  setTokens(data.accessToken, getRefreshToken() ?? '')
  return data.accessToken
}

// Main fetch wrapper with auth
export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const {
    method = ApiMethod.GET,
    body,
    params,
    headers = {},
    skipAuth = false,
  } = options

  const isFormData = body instanceof FormData

  const requestHeaders: Record<string, string> = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...headers,
  }

  // Add auth header if not skipped
  if (!skipAuth) {
    const token = getAccessToken()
    if (token) {
      requestHeaders['Authorization'] = `Bearer ${token}`
    }
  }

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
  }

  if (body) {
    fetchOptions.body = isFormData ? body : JSON.stringify(body)
  }

  // Serialize params to URLSearchParams
  let queryString = ''
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value)
      }
    })
    const str = searchParams.toString()
    if (str) {
      queryString = `?${str}`
    }
  }

  let response = await fetch(
    `${API_BASE_URL}/api${endpoint}${queryString}`,
    fetchOptions
  )

  // Handle 401 - try refresh token
  if (response.status === 401 && !skipAuth) {
    if (!isRefreshing) {
      isRefreshing = true
      refreshPromise = refreshAccessToken().finally(() => {
        isRefreshing = false
        refreshPromise = null
      })
    }

    try {
      const newToken = await refreshPromise
      if (newToken) {
        requestHeaders['Authorization'] = `Bearer ${newToken}`
        response = await fetch(`${API_BASE_URL}/api${endpoint}${queryString}`, {
          ...fetchOptions,
          headers: requestHeaders,
        })
      }
    } catch {
      clearTokens()
      window.location.href = '/sign-in'
      throw new ApiError(401, 'Session expired')
    }
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T
  }

  // Parse response
  const contentType = response.headers.get('content-type')
  const isJson = contentType?.includes('application/json')
  const data = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const message =
      isJson && data?.message
        ? Array.isArray(data.message)
          ? data.message[0]
          : data.message
        : 'An error occurred'
    throw new ApiError(response.status, message, data)
  }

  return data as T
}

// Convenience methods
export const api = {
  get: <T>(
    endpoint: string,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) => apiClient<T>(endpoint, { ...options, method: ApiMethod.GET }),

  post: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) => apiClient<T>(endpoint, { ...options, method: ApiMethod.POST, body }),

  put: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) => apiClient<T>(endpoint, { ...options, method: ApiMethod.PUT, body }),

  patch: <T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, 'method' | 'body'>
  ) => apiClient<T>(endpoint, { ...options, method: ApiMethod.PATCH, body }),

  delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) =>
    apiClient<T>(endpoint, { ...options, method: ApiMethod.DELETE }),
}

export default api
