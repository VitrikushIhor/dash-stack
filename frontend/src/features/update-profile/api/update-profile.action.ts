'use server'

import { revalidatePath } from 'next/cache'
import { ROUTES } from '@/shared/config'
import { createAction } from '@/shared/lib'
import { UpdateUserDtoSchema } from '@/entities/user'
import { userServerApi } from '@/entities/user/server'

export const updateProfileAction = createAction(
  UpdateUserDtoSchema,
  async (dto) => {
    const res = await userServerApi.updateMe(dto)
    revalidatePath(ROUTES.home, 'layout')
    return res
  }
)
