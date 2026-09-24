'use server'

import { createAction } from '@/shared/lib'
import { CreateMatchSessionPayloadSchema } from '@/entities/vocab'
import { vocabServerApi } from '@/entities/vocab/server'

export const createMatchSessionAction = createAction(
  CreateMatchSessionPayloadSchema,
  async ({ deckId, ...filters }) =>
    vocabServerApi.createMatchSession(deckId, filters)
)
