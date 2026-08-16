'use server'

import { createAction } from '@/shared/lib/actions/action-builder'
import { signUpSchema } from '../../model/schema/sign-up.schema'
import { authServerApi } from '../auth-api.server'

export const signUpAction = createAction(
  signUpSchema,
  async (dto): Promise<{ message: string }> => {
    return authServerApi.signup(dto)
  }
)
