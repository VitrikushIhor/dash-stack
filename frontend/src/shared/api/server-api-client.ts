import { cookies } from 'next/headers'
import { ApiError } from './api-helpers'

const API_BASE_URL =
  process.env.API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000'

export async function serverApiClient<T>(
  endpoint: string,
  options: {
    method?: string
    body?: unknown
    params?: Record<string, string | undefined>
    skipAuth?: boolean
  } = {}
): Promise<T> {
  const { method = 'GET', body, params, skipAuth = false } = options
  const cookieStore = await cookies()
  const token = cookieStore.get('access_token')?.value

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }

  if (!skipAuth && token) {
    headers['Authorization'] = `Bearer ${token}`
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

  const response = await fetch(`${API_BASE_URL}/api${endpoint}${queryString}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

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
