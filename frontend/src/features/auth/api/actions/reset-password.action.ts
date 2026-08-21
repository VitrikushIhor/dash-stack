'use server'

import { z } from 'zod'
import { createAction } from '@/shared/lib'
import { resetPasswordSchema } from '../../model/schema/reset-password.schema'
import { authServerApi } from '../auth-api.server'

const ResetPasswordInputSchema = resetPasswordSchema.and(
  z.object({
    token: z.string().min(1, 'Token is required'),
  })
)

export const resetPasswordAction = createAction(
  ResetPasswordInputSchema,
  async ({ token, password }): Promise<{ message: string }> => {
    return authServerApi.resetPassword({ token, password })
  }
)
