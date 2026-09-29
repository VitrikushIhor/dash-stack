import { HTTP_METHODS } from '@/shared/api/http-methods'

export const SAFE_PROXY_METHODS: readonly string[] = [
  HTTP_METHODS.GET,
  HTTP_METHODS.HEAD,
  HTTP_METHODS.OPTIONS,
]

export const BODY_LESS_PROXY_METHODS: readonly string[] = [
  HTTP_METHODS.GET,
  HTTP_METHODS.HEAD,
]
