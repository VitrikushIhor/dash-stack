'use server'

import { headers } from 'next/headers'
import { createAction } from '@/shared/lib'
import { signInSchema } from '../../model/schema/sign-in.schema'
import type { AuthenticatedActionResult } from '../../model/types/auth.types'
import { authServerApi } from '../auth-api.server'

export const signInAction = createAction(
  signInSchema,
  async (dto): Promise<AuthenticatedActionResult> => {
    const requestHeaders = await headers()
    return authServerApi.login(
      dto,
      requestHeaders.get('user-agent') ?? undefined
    )
  }
)
