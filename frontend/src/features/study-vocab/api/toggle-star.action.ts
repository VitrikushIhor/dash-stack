'use server'

import { createAction } from '@/shared/lib'
import { ToggleStarPayloadSchema } from '@/entities/vocab'
import { vocabServerApi } from '@/entities/vocab/server'

export const toggleStarAction = createAction(
  ToggleStarPayloadSchema,
  async ({ cardId, isStarred }) => {
    const res = await vocabServerApi.setStar(cardId, { isStarred })

    return res
  }
)
