import { cookies } from 'next/headers'
import { env } from '@/shared/config/env'
import { createHttpClient } from './http-core'

const BASE_URL =
  env.API_URL ?? env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000'

/**
 * Server-only client. Used in Server Components / Server Actions to talk
 * to the backend directly, bypassing the proxy for less overhead.
 */
export function createServerApiClient(
  onResponse?: (response: Response) => Promise<void> | void
) {
  return createHttpClient({
    baseURL: `${BASE_URL}/api`,
    getHeaders: async (): Promise<Record<string, string>> => {
      const store = await cookies()
      const token = store.get('access_token')?.value

      return token ? { Authorization: `Bearer ${token}` } : {}
    },
    onResponse,
  })
}

export const serverApi = createServerApiClient()
