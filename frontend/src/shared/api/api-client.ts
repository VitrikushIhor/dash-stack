import { ApiError } from './api-helpers'
import { tokenStorage } from './token-storage'

const API_BASE_URL = '/api/proxy'

enum ApiMethod {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE',
  PATCH = 'PATCH',
}

interface RequestOptions {
  method?: ApiMethod
  body?: unknown
  params?: Record<string, string | undefined>
  headers?: Record<string, string>
  skipAuth?: boolean
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = ApiMethod.GET, body, params, headers = {} } = options

  const isFormData = body instanceof FormData

  const requestHeaders: Record<string, string> = {
    ...(!isFormData && { 'Content-Type': 'application/json' }),
    ...headers,
  }

  const fetchOptions: RequestInit = {
    method,
    headers: requestHeaders,
  }

  if (body) {
    fetchOptions.body = isFormData ? body : JSON.stringify(body)
  }

  let queryString = ''
  if (params) {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value)
      }
    })
    const str = searchParams.toString()
    if (str) queryString = `?${str}`
  }

  const response = await fetch(
    `${API_BASE_URL}${endpoint}${queryString}`,
    fetchOptions
  )

  if (response.status === 401) {
    await tokenStorage.clearTokens()
    if (
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/sign-in')
    ) {
      window.location.href = '/sign-in'
    }
  }

  if (response.status === 204) {
    return {} as T
  }

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
