'use server'

import { createAction } from '@/shared/lib/actions/action-builder'
import { forgotPasswordSchema } from '../../model/schema/forgot-password.schema'
import { authServerApi } from '../auth-api.server'

export const forgotPasswordAction = createAction(
  forgotPasswordSchema,
  async (dto): Promise<{ message: string }> => {
    return authServerApi.forgotPassword(dto.email)
  }
)
