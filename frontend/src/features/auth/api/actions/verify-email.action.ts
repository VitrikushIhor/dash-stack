'use server'

import { createAction } from '@/shared/lib'
import { setAuthCookies } from '@/shared/lib/session-cookies'
import { VerifyEmailInputSchema } from '../../model/schema/auth-action.schema'
import type { AuthTokens } from '../../model/types/auth.types'
import { authServerApi } from '../auth-api.server'

export const verifyEmailAction = createAction(
  VerifyEmailInputSchema,
  async ({ token }): Promise<AuthTokens> => {
    const tokens = await authServerApi.verifyEmail(token)

    await setAuthCookies(tokens)

    return tokens
  }
)
