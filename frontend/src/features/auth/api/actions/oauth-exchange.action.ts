'use server'

import { createAction } from '@/shared/lib'
import { OAuthExchangeInputSchema } from '../../model/schema/auth-action.schema'
import type { AuthenticatedActionResult } from '../../model/types/auth.types'
import { authServerApi } from '../auth-api.server'

export const oauthExchangeAction = createAction(
  OAuthExchangeInputSchema,
  async ({ token }): Promise<AuthenticatedActionResult> => {
    return authServerApi.oauthExchange(token)
  }
)
