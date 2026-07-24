import { toast } from 'sonner'
import { createHttpClient } from './http-core'

/**
 * Browser client. Calls same-origin `/api/proxy/*`, so cookies are sent
 * automatically — no `credentials: 'include'` needed (same-origin request).
 */
export const api = createHttpClient({
  baseURL: '/api/proxy',
  getHeaders: () => ({}), // auth cookie travels automatically, same-origin
  onUnauthorized: () => {
    if (
      typeof window !== 'undefined' &&
      !window.location.pathname.startsWith('/sign-in')
    ) {
      toast.error('Session expired!')
      window.location.href = '/sign-in'
    }
  },
})

export default api
