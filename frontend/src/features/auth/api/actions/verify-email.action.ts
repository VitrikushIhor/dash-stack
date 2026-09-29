'use server'

import { createAction } from '@/shared/lib'
import { VerifyEmailInputSchema } from '../../model/schema/auth-action.schema'
import type { AuthenticatedActionResult } from '../../model/types/auth.types'
import { authServerApi } from '../auth-api.server'

export const verifyEmailAction = createAction(
  VerifyEmailInputSchema,
  async ({ token }): Promise<AuthenticatedActionResult> => {
    return authServerApi.verifyEmail(token)
  }
)
