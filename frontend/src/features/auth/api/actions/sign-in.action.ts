'use server'

import { createAction } from '@/shared/lib/actions/action-builder'
import { setAuthCookies } from '@/shared/lib/session-cookies'
import { signInSchema } from '../../model/schema/sign-in.schema'
import type { AuthTokens } from '../../model/types/auth.types'
import { authServerApi } from '../auth-api.server'

export const signInAction = createAction(
  signInSchema,
  async (dto): Promise<AuthTokens> => {
    const tokens = await authServerApi.login(dto)
    await setAuthCookies(tokens)
    return tokens
  }
)
