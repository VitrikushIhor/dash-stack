import { cookies } from 'next/headers'
import { createHttpClient } from './http-core'

const BASE_URL =
  process.env.API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  'http://localhost:8000'

/**
 * Server-only client. Used in Server Components / Server Actions to talk
 * to the backend directly, bypassing the proxy for less overhead.
 */
export const serverApi = createHttpClient({
  baseURL: `${BASE_URL}/api`,
  getHeaders: async (): Promise<Record<string, string>> => {
    const store = await cookies()
    const token = store.get('access_token')?.value
    return token ? { Authorization: `Bearer ${token}` } : {}
  },
  onUnauthorized: () => {
    // On the server you cannot do window.location — throw and let an
    // error boundary / middleware handle the redirect instead.
  },
})

export default serverApi
