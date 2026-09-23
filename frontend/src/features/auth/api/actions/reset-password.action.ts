'use server'

import { createAction } from '@/shared/lib'
import { ResetPasswordInputSchema } from '../../model/schema/auth-action.schema'
import { authServerApi } from '../auth-api.server'

export const resetPasswordAction = createAction(
  ResetPasswordInputSchema,
  async ({ token, password }): Promise<{ message: string }> => {
    return authServerApi.resetPassword({ token, password })
  }
)
