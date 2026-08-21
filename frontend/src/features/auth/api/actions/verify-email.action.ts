'use server'

import { z } from 'zod'
import { createAction } from '@/shared/lib'
import { setAuthCookies } from '@/shared/lib/session-cookies'
import type { AuthTokens } from '../../model/types/auth.types'
import { authServerApi } from '../auth-api.server'

const VerifyEmailInputSchema = z.object({
  token: z.string().min(1, 'Token is required'),
})

export const verifyEmailAction = createAction(
  VerifyEmailInputSchema,
  async ({ token }): Promise<AuthTokens> => {
    const tokens = await authServerApi.verifyEmail(token)
    await setAuthCookies(tokens)
    return tokens
  }
)
