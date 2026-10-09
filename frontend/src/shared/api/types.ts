import type { HTTP_METHODS } from './http-methods'
import type { QUERY_ERROR_CODES } from './query/query-error-codes'

export interface ApiErrorResponse {
  statusCode: number
  message: string | string[]
  error: string
}

export type ApiSuccessResponse<T> = T

export type ActionState<T = void> =
  | { success: true; data: T }
  | { success: false; error: string; validationMessages?: string[] }

export type QueryErrorCode =
  (typeof QUERY_ERROR_CODES)[keyof typeof QUERY_ERROR_CODES]

export type QueryResult<T> =
  | { ok: true; data: T }
  | {
      ok: false
      error: {
        code: QueryErrorCode
        message: string
        details?: Record<string, string[] | undefined>
      }
    }

export type HttpMethod = (typeof HTTP_METHODS)[keyof typeof HTTP_METHODS]

export interface RequestOptions<TBody = unknown> {
  method?: HttpMethod
  body?: TBody
  params?: Record<string, string | number | boolean | undefined>
  headers?: Record<string, string>
  skipAuth?: boolean
  suppressUnauthorizedHandler?: boolean
  cache?: RequestCache
  next?: NextFetchRequestConfig
  signal?: AbortSignal
}
