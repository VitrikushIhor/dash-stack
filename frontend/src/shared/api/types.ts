export interface ApiErrorResponse {
  statusCode: number
  message: string | string[]
  error: string
}

export type ApiSuccessResponse<T> = T

export type ActionState<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; validationMessages?: string[] }

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'

export interface RequestOptions<TBody = unknown> {
  method?: HttpMethod
  body?: TBody
  params?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
  skipAuth?: boolean
  cache?: RequestCache
  next?: NextFetchRequestConfig
}
