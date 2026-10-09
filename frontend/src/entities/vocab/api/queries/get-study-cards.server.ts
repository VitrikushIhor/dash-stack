import { cache } from 'react'
import 'server-only'
import { createServerQuery } from '@/shared/lib/server'
import { StudySessionQuerySchema } from '../../model/vocab.schema'
import { vocabServerApi } from '../vocab-api.server'

export const getStudyCardsQuery = cache(
  createServerQuery('getStudyCardsQuery', StudySessionQuerySchema, (query) =>
    vocabServerApi.getStudySession(query.deckId, {
      mode: query.mode,
      onlyStarred: query.onlyStarred,
      onlyDue: query.onlyDue,
    })
  )
)
