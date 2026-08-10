import { ApiError, extractErrorMessage } from './api-error'
import type { ApiErrorResponse, RequestOptions } from './types'

export interface HttpClientConfig {
  baseURL: string
  /** Resolves auth/context headers per-request (sync on client, async on server via cookies()) */
  getHeaders: () => Promise<Record<string, string>> | Record<string, string>
  /** Hook fired on 401 — e.g. redirect on client, throw/redirect on server */
  onUnauthorized?: () => void
}

function buildQueryString(params?: RequestOptions['params']): string {
  if (!params) return ''
  const searchParams = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) searchParams.append(key, String(value))
  })
  const str = searchParams.toString()
  return str ? `?${str}` : ''
}

async function parseBody(response: Response): Promise<unknown> {
  if (response.status === 204) return null
  const contentType = response.headers.get('content-type') ?? ''
  return contentType.includes('application/json')
    ? response.json()
    : response.text()
}

/**
 * Factory that produces an isomorphic-shaped HTTP client.
 * Both the browser client and the server client wrap this — only
 * `getHeaders` (auth source) and `baseURL` differ between them.
 */
export function createHttpClient(config: HttpClientConfig) {
  async function request<T, TBody = unknown>(
    endpoint: string,
    options: RequestOptions<TBody> = {}
  ): Promise<T> {
    const {
      method = 'GET',
      body,
      params,
      headers: customHeaders,
      skipAuth,
      cache,
      next,
    } = options

    const isFormData = body instanceof FormData
    const baseHeaders = skipAuth ? {} : await config.getHeaders()

    const headers: Record<string, string> = {
      ...(!isFormData && { 'Content-Type': 'application/json' }),
      ...baseHeaders,
      ...customHeaders,
    }

    const normalizedEndpoint = endpoint.startsWith('/')
      ? endpoint
      : `/${endpoint}`

    const response = await fetch(
      `${config.baseURL}${normalizedEndpoint}${buildQueryString(params)}`,
      {
        method,
        headers,
        body: body
          ? isFormData
            ? (body as FormData)
            : JSON.stringify(body)
          : undefined,
        cache,
        next,
      }
    )

    if (response.status === 401) {
      config.onUnauthorized?.()
    }

    const data = await parseBody(response)

    if (!response.ok) {
      const raw = data as ApiErrorResponse | null
      throw new ApiError(response.status, extractErrorMessage(raw), raw)
    }

    return data as T
  }

  return {
    request,
    get: <T>(
      endpoint: string,
      options?: Omit<RequestOptions, 'method' | 'body'>
    ) => request<T>(endpoint, { ...options, method: 'GET' }),
    post: <T, TBody = unknown>(
      endpoint: string,
      body?: TBody,
      options?: Omit<RequestOptions<TBody>, 'method' | 'body'>
    ) => request<T, TBody>(endpoint, { ...options, method: 'POST', body }),
    put: <T, TBody = unknown>(
      endpoint: string,
      body?: TBody,
      options?: Omit<RequestOptions<TBody>, 'method' | 'body'>
    ) => request<T, TBody>(endpoint, { ...options, method: 'PUT', body }),
    patch: <T, TBody = unknown>(
      endpoint: string,
      body?: TBody,
      options?: Omit<RequestOptions<TBody>, 'method' | 'body'>
    ) => request<T, TBody>(endpoint, { ...options, method: 'PATCH', body }),
    delete: <T>(endpoint: string, options?: Omit<RequestOptions, 'method'>) =>
      request<T>(endpoint, { ...options, method: 'DELETE' }),
  }
}

export type HttpClient = ReturnType<typeof createHttpClient>
