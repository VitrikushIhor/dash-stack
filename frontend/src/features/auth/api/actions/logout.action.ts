'use server'

import { cookies } from 'next/headers'
import { createAction } from '@/shared/lib/actions/action-builder'
import { clearAuthCookies, COOKIE_CONFIG } from '@/shared/lib/session-cookies'
import { authServerApi } from '../auth-api.server'

export const logoutAction = createAction(
  async (): Promise<{ message: string }> => {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get(
      COOKIE_CONFIG.REFRESH_TOKEN.name
    )?.value

    if (refreshToken) {
      try {
        await authServerApi.logout(refreshToken)
      } catch {
        // Ignore network/server errors during logout and proceed to clear cookies
      }
    }

    await clearAuthCookies()
    return { message: 'Logged out successfully' }
  }
)
